export const AI_APP_CATEGORY = "AI应用开发学习路线";

export function aiAppRoadmapOrder(slug: string): number {
	const stage = slug.match(/^ai-app-workshop-(\d+)-/);
	if (stage) return Number(stage[1]);
	const topic = Number(slug.match(/^ai-app-roadmap-(\d+)-/)?.[1] ?? 99);
	if (topic === 0) return 0;
	if (topic === 13) return 6;
	return 100 + topic;
}
