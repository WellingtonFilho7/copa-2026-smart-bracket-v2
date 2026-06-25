import { getSampleFeed } from "../src/lib/feed/sample-feed";

export default {
  fetch(_request: Request): Response {
    return Response.json(getSampleFeed(), {
      headers: {
        "cache-control": "no-store",
      },
    });
  },
};
