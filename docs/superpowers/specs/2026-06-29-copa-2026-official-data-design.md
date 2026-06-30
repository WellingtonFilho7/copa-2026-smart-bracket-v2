# Copa 2026 Official Data Design

## Goal

Transform the app from a mixed demo/editorial workspace into a read-only World Cup tracker whose primary truth is official tournament data.

## Product Direction

The app should no longer behave like an editable bracket workspace. It should behave like a lightweight public-facing tracker:

- official group standings
- official knockout bracket
- official match scores and status
- clear last-updated metadata
- no manual override layer
- no editorial conflict resolution flow

This changes the product from "interactive bracket editor" to "official bracket viewer with sync".

## Current Problems

The current implementation mixes four different sources of truth:

1. hardcoded base tournament data in the frontend
2. browser `localStorage` snapshots
3. manual score overrides
4. a fake API route that returns only a couple of static matches

This creates incorrect or ambiguous output because:

- many values shown as if they were real are actually seeded locally
- manual edits can override official-looking values
- groups and bracket can drift away from each other
- the UI suggests real sync while the backend is still demo data
- the third-place routing logic is heuristic instead of tied to a deterministic official mapping

## Desired Data Model

The app should have one primary data source:

- server-normalized official tournament payload

The browser may keep a cached copy only for performance and resilience, but that cache is not an editable workspace. It is a read-only snapshot of the last successful sync.

### Source Priority

1. fresh server response from `/api/worldcup-feed`
2. cached last-known successful payload from `localStorage`
3. if neither exists, show an explicit empty/loading/error state

There should be no `manual`, `feed`, or `base` precedence model anymore.

## Recommended Architecture

### Backend

Keep a minimal backend route:

- `GET /api/worldcup-feed`

Responsibilities:

- fetch official World Cup data from the selected upstream source
- normalize the payload to a stable app-specific contract
- expose only the fields needed by the frontend
- include source metadata and last update timestamps
- fail loudly and predictably when upstream data is unavailable

The route should be the only place that knows about the upstream provider schema.

### Frontend

The frontend should:

- fetch the normalized payload
- render groups, standings, bracket, and match cards directly from that payload
- cache the latest successful payload
- expose sync state and source freshness
- never mutate scores locally

The frontend should no longer compute official tournament truth from a seeded fake dataset.

## Normalized Feed Contract

The frontend should consume a single response with explicit structure:

```json
{
  "meta": {
    "source": "official",
    "syncedAt": "2026-06-29T15:00:00.000Z",
    "upstreamUpdatedAt": "2026-06-29T14:57:00.000Z"
  },
  "groups": [
    {
      "group": "A",
      "teams": [
        {
          "code": "MEX",
          "name": "Mexico",
          "rank": 1,
          "points": 6,
          "played": 2,
          "wins": 2,
          "draws": 0,
          "losses": 0,
          "goalsFor": 3,
          "goalsAgainst": 0,
          "goalDifference": 3,
          "status": "qualified"
        }
      ]
    }
  ],
  "matches": [
    {
      "id": "K3",
      "stage": "32 avos",
      "group": null,
      "homeTeam": "MEX",
      "awayTeam": "SUI",
      "homeScore": 1,
      "awayScore": 0,
      "status": "finished",
      "kickoff": "2026-06-28T19:00:00.000Z",
      "kickoffLabel": "28/06 • 16h00",
      "winnerTeam": "MEX",
      "nextMatchId": "O2"
    }
  ],
  "bracket": {
    "round32": ["K1", "K2"],
    "round16": ["O1", "O2"],
    "quarters": ["Q1", "Q2"],
    "semis": ["S1", "S2"],
    "finals": ["F", "T"]
  }
}
```

Notes:

- `groups` is already sorted and ranked
- `matches` is the canonical source for both group-stage and knockout cards
- `bracket` defines ordering for display rather than forcing the frontend to infer it

## UX Changes

### Remove Editing Surface

Remove:

- manual score modal actions
- conflict resolution panel and badges
- workspace import/export flow
- manual/feed/base provenance badges

Replace them with:

- official source badge
- last-updated timestamp
- sync status
- error/retry state

### Groups Section

The current "Grupos classificados" block only lists teams by group. It must become an actual standings view:

- group ranking
- points
- matches played
- goal difference
- qualification status when available

### Bracket Section

The bracket should show:

- actual official teams when known
- placeholder `A definir` only when the official source has not resolved a slot yet
- actual score/status when a match has started or finished
- a distinct visual state for `scheduled`, `live`, and `finished`

The bracket should not rely on a heuristic third-place allocation algorithm unless the chosen official source truly requires local derivation. If derivation is necessary, use an explicit deterministic mapping table, not backtracking.

## Error Handling

If upstream fetch fails:

- keep the last successful cached payload if one exists
- show a non-blocking stale-data message
- show the last successful sync time

If no payload has ever been loaded:

- show a proper empty state with retry action

If upstream returns partial data:

- render only validated sections
- never silently inject fake seeded values

## Testing Strategy

Cover:

- route normalization from upstream payload to app contract
- client fetch success and failure handling
- cache fallback behavior
- groups rendering from normalized standings
- bracket rendering from normalized match list/order
- stale-data state when sync fails after a successful cache
- absence of manual edit and conflict UI

## Scope

This migration includes:

- data model replacement
- API contract redesign
- removal of manual editing features
- UI copy and component cleanup
- updated tests

This migration does not include:

- user accounts
- shared cloud persistence
- live sockets
- non-official prediction modes

## Recommendation

Use a server-normalized official feed as the only truth, keep a read-only client cache for resilience, and remove all manual/editorial state from the product.
