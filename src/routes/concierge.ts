import { Router } from "express";

export function rankExcursions(
  excursions: Array<Record<string, unknown>>,
  interests: string[] = [],
  limit = 5,
) {
  const wanted = interests.map((i) => i.toLowerCase());
  return [...excursions]
    .map((ex) => {
      const tags = ((ex.tags as string[]) || (ex.categories as string[]) || []).map(String);
      let score = Number(ex.rating || ex.score || 0);
      if (wanted.length) {
        const overlap = tags.filter((t) => wanted.includes(t.toLowerCase())).length;
        score += overlap * 1.5;
      }
      return { ...ex, recommendation_score: score };
    })
    .sort((a, b) => Number(b.recommendation_score) - Number(a.recommendation_score))
    .slice(0, limit);
}

export const conciergeRouter = Router();
conciergeRouter.get("/recommendations", (req, res) => {
  const interests = String(req.query.interests || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const limit = Number(req.query.limit || 5);
  const excursions: Array<Record<string, unknown>> = [];
  res.json({
    recommendations: rankExcursions(excursions, interests, limit),
    meta: { limit, interests },
  });
});
