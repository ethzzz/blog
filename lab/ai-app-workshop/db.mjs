import { readFileSync } from "node:fs";
import mysql from "mysql2/promise";

export function connect(env = process.env, overrides = {}) {
  const pool = mysql.createPool({
    host: env.DB_HOST || "127.0.0.1",
    port: Number(env.DB_PORT || 3307),
    user: env.DB_USER || "workshop",
    password: env.DB_PASSWORD,
    database: env.DB_NAME || "kb_workshop",
    charset: "utf8mb4",
    connectionLimit: 5,
    queueLimit: 50,
    connectTimeout: 5000,
    decimalNumbers: true,
    jsonStrings: true,
    ...(env.DB_SSL_CA_FILE ? { ssl: { ca: readFileSync(env.DB_SSL_CA_FILE) } } : {}),
    ...overrides,
  });
  return {
    ...statements(pool),
    async transaction(work) {
      const connection = await pool.getConnection();
      try {
        await connection.query("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");
        await connection.beginTransaction();
        const result = await work(statements(connection));
        await connection.commit();
        return result;
      } catch (error) {
        await connection.rollback().catch(() => {});
        throw error;
      } finally {
        connection.release();
      }
    },
    close: () => pool.end(),
  };
}

function statements(connection) {
  const execute = async (sql, ...params) => {
    const [result] = await connection.execute(sql, params);
    return result;
  };
  return {
    all: execute,
    async one(sql, ...params) {
      const [row] = await execute(sql, ...params);
      return row;
    },
    run: execute,
  };
}

export async function lockAccount(db, owner) {
  await db.one("SELECT id FROM accounts WHERE id = ? FOR UPDATE", owner);
}
