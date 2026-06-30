import express from "express";

import { getOfficialFeedOrFallback } from "../api/official-feed.js";

const app = express();
const port = Number(process.env.PORT ?? 3016);

app.get("/api/worldcup-feed", async (_request, response) => {
  response.json(await getOfficialFeedOrFallback());
});

app.listen(port, () => {
  console.log(`World Cup feed server listening on http://localhost:${port}`);
});
