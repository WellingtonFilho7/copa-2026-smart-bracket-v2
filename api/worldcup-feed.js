import snapshot from "../data/official-feed.snapshot.json" with { type: "json" };

export default function handler(_request, response) {
  response.status(200).json({
    ...snapshot,
    meta: {
      ...snapshot.meta,
      syncedAt: new Date().toISOString(),
    },
  });
}
