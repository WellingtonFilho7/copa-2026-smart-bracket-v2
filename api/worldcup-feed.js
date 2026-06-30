import { getOfficialFeedOrFallback } from "./official-feed.js";

export default async function handler(_request, response) {
  const payload = await getOfficialFeedOrFallback();

  if (typeof response.setHeader === "function") {
    response.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=900");
  }

  response.status(200).json(payload);
}
