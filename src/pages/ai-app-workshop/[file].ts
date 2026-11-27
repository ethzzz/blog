import type { APIRoute } from "astro";

const sources = import.meta.glob<string>(
	"../../../lab/ai-app-workshop/{setup.mjs,server.mjs,db.mjs,http.mjs,model.mjs,sse.mjs,index.html,app.mjs,smoke.mjs,package.json,package-lock.json,compose.yaml,init-dev.sql,dev.env.example,rag.mjs,agent.mjs,mcp.mjs,media.mjs,ops.mjs,config.env.example,evaluate.mjs,eval-cases.json}",
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
