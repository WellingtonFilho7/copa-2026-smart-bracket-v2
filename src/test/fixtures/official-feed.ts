import snapshot from "../../../data/official-feed.snapshot.json";

import type { OfficialFeedPayload } from "../../lib/feed/schema";

export const officialFeedFixture = snapshot as OfficialFeedPayload;
