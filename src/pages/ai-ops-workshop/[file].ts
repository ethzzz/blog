import type { APIRoute } from "astro";

const sources = import.meta.glob<string>(
	"../../../lab/ai-ops-workshop/{setup.mjs,package.json,package-lock.json,dev.env.example,compose.yaml,init-dev.sql,fixtures.mjs,rules.mjs,db.mjs,assistant.mjs,server.mjs,index.html,app.mjs,rules.test.mjs,eval-cases.json,eval.mjs,smoke.mjs}",
	{ eager: true, query: "?raw", import: "default" },
);

export function getStaticPaths() {
	return Object.entries(sources).map(([path, source]) => {
		const name = path.slice(path.lastIndexOf("/") + 1);
		return {
			params: { file: name === "index.html" ? "index.html.txt" : name },
			props: { source },
		};
	});
}

export const GET: APIRoute = ({ params, props }) =>
	new Response(props.source, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Content-Disposition": `attachment; filename="${params.file}"`,
			"X-Content-Type-Options": "nosniff",
		},
	});
