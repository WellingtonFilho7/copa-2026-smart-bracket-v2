import express from "express";

import { getSampleFeed } from "./feed/sample-feed";

const app = express();
const port = Number(process.env.PORT ?? 3016);

app.get("/api/worldcup-feed", (_request, response) => {
  response.json(getSampleFeed());
});

app.listen(port, () => {
  console.log(`World Cup feed server listening on http://localhost:${port}`);
});
