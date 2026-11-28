import { randomUUID } from "node:crypto";
import mysql from "mysql2/promise";
import { fallback, materials } from "./fixtures.mjs";
import { fail, overlaps, validate } from "./rules.mjs";

export async function openDatabase(env) {
  const pool = mysql.createPool({
    host: env.DB_HOST || "127.0.0.1", port: Number(env.DB_PORT || 3308),
    user: env.DB_USER || "workshop", password: env.DB_PASSWORD,
    database: env.DB_NAME || "ops_workshop", charset: "utf8mb4",
    connectionLimit: 5, queueLimit: 30, connectTimeout: 5000,
  });
  const sql = async (connection, query, ...params) => (await connection.execute(query, params))[0];
  const query = (statement, ...params) => sql(pool, statement, ...params);
  const tx = async (work) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await work((statement, ...params) => sql(connection, statement, ...params));
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback().catch(() => {});
      throw error;
    } finally {
      connection.release();
    }
  };
  try {
    await query(`CREATE TABLE IF NOT EXISTS placements (
      id VARCHAR(30) PRIMARY KEY
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    await query(`CREATE TABLE IF NOT EXISTS ai_proposals (
      id VARCHAR(36) PRIMARY KEY,
      brief TEXT NOT NULL,
      result JSON NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    await query(`CREATE TABLE IF NOT EXISTS campaigns (
      id VARCHAR(36) PRIMARY KEY,
      placement_id VARCHAR(30) NOT NULL,
      status ENUM('draft','in_review','published','offline') NOT NULL,
      revision INT UNSIGNED NOT NULL,
      config JSON NOT NULL,
      proposal_id VARCHAR(36),
      INDEX (placement_id, status),
      FOREIGN KEY (placement_id) REFERENCES placements(id),
      FOREIGN KEY (proposal_id) REFERENCES ai_proposals(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    await query(`CREATE TABLE IF NOT EXISTS campaign_audit (
      campaign_id VARCHAR(36) NOT NULL,
      revision INT UNSIGNED NOT NULL,
      actor VARCHAR(20) NOT NULL,
      action VARCHAR(20) NOT NULL,
      snapshot JSON NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (campaign_id, revision),
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    await tx(async (exec) => {
      await exec("INSERT INTO placements (id) VALUES ('home-banner') ON DUPLICATE KEY UPDATE id = id");
      const [existing] = await exec("SELECT id FROM campaigns WHERE id = 'baseline' FOR UPDATE");
      if (!existing) {
        const row = { id: "baseline", status: "published", revision: 1, config: fallback };
        await insert(exec, row);
        await audit(exec, row, "seed", "seed");
      }
    });
  } catch (error) {
    await pool.end();
    throw error;
  }

  const getLocked = async (exec, id, revision) => {
    const [current] = await exec("SELECT id, status, revision, config, proposal_id AS proposalId FROM campaigns WHERE id = ? FOR UPDATE", id);
    if (!current) fail(404, "CAMPAIGN_NOT_FOUND");
    if (!Number.isInteger(revision) || current.revision !== revision) fail(409, "STALE_REVISION");
    return current;
  };
  const getProposalId = async (exec, id) => {
    if (id === null || id === undefined) return null;
    if (typeof id !== "string" || !/^[a-f0-9-]{36}$/.test(id)) fail(400, "INVALID_PROPOSAL");
    if (!(await exec("SELECT id FROM ai_proposals WHERE id = ?", id)).length) fail(400, "INVALID_PROPOSAL");
    return id;
  };

  return {
    close: () => pool.end(),
    list: () => query("SELECT id, status, revision, config FROM campaigns ORDER BY id"),
    published: () => query("SELECT id, config FROM campaigns WHERE placement_id = 'home-banner' AND status = 'published'"),
    audit: (id) => query(`SELECT a.revision, a.actor, a.action, a.snapshot, a.created_at, p.brief, p.result AS proposal
      FROM campaign_audit AS a LEFT JOIN ai_proposals AS p
        ON p.id = JSON_UNQUOTE(JSON_EXTRACT(a.snapshot, '$.proposalId'))
      WHERE a.campaign_id = ? ORDER BY a.revision`, id),
    saveProposal: async (brief, result) => {
      const id = randomUUID();
      await query("INSERT INTO ai_proposals (id, brief, result) VALUES (?, ?, ?)", id, brief, JSON.stringify(result));
      return id;
    },
    create: (config, proposalId) => tx(async (exec) => {
      const row = { id: randomUUID(), status: "draft", revision: 1, config: validate(config, materials),
        proposalId: await getProposalId(exec, proposalId) };
      await insert(exec, row);
      await audit(exec, row, "operator", "create");
      return row;
    }),
    edit: (id, revision, config, proposalId) => tx(async (exec) => {
      const current = await getLocked(exec, id, revision);
      if (current.status !== "draft") fail(409, "INVALID_TRANSITION");
      const row = { ...current, revision: revision + 1, config: validate(config, materials),
        proposalId: proposalId === undefined ? current.proposalId : await getProposalId(exec, proposalId) };
      await save(exec, row, "operator", "edit");
      return row;
    }),
    transition: (id, revision, action, actor) => tx(async (exec) => {
      const transition = {
        submit: ["operator", "draft", "in_review"],
        return: ["reviewer", "in_review", "draft"],
        publish: ["reviewer", "in_review", "published"],
        offline: ["reviewer", "published", "offline"],
      }[action];
      if (!Array.isArray(transition)) fail(400, "UNKNOWN_ACTION");
      const [role, before, after] = transition;
      if (actor !== role) fail(403, "FORBIDDEN");
      if (action === "publish") await exec("SELECT id FROM placements WHERE id = 'home-banner' FOR UPDATE");
      const current = await getLocked(exec, id, revision);
      if (current.status !== before) fail(409, "INVALID_TRANSITION");
      if (action === "publish") {
        validate(current.config, materials);
        const live = await exec(`SELECT config FROM campaigns
          WHERE placement_id = 'home-banner' AND status = 'published'`);
        if (live.some(({ config }) => config.priority === current.config.priority && overlaps(config, current.config))) {
          fail(409, "SAME_PRIORITY_WINDOW_CONFLICT");
        }
      }
      const row = { ...current, status: after, revision: revision + 1 };
      await save(exec, row, actor, action);
      return row;
    }),
  };
}

function insert(exec, row) {
  return exec("INSERT INTO campaigns (id, placement_id, status, revision, config, proposal_id) VALUES (?, 'home-banner', ?, ?, ?, ?)",
    row.id, row.status, row.revision, JSON.stringify(row.config), row.proposalId ?? null);
}

function audit(exec, row, actor, action) {
  return exec("INSERT INTO campaign_audit (campaign_id, revision, actor, action, snapshot) VALUES (?, ?, ?, ?, ?)",
    row.id, row.revision, actor, action, JSON.stringify({ status: row.status, config: row.config, proposalId: row.proposalId ?? null }));
}

async function save(exec, row, actor, action) {
  await exec("UPDATE campaigns SET config = ?, status = ?, revision = ?, proposal_id = ? WHERE id = ?",
    JSON.stringify(row.config), row.status, row.revision, row.proposalId, row.id);
  await audit(exec, row, actor, action);
}
