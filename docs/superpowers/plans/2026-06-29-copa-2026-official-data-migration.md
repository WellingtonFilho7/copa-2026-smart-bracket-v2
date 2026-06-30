# Copa 2026 Official Data Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mixed demo/manual workspace with a read-only official-data flow that renders groups and bracket from a single normalized server payload.

**Architecture:** The Vercel function becomes the only source-aware normalization layer. The frontend stops computing truth from seeded tournament state and instead renders a cached normalized feed payload with explicit loading, stale, and error states.

**Tech Stack:** React, TypeScript, Vite, Vitest, Vercel Functions, localStorage cache

---

### Task 1: Define the normalized official feed contract

**Files:**
- Create: `src/lib/feed/schema.ts`
- Modify: `src/lib/feed/client.ts`
- Test: `src/lib/feed/client.test.ts`

- [ ] **Step 1: Write the failing contract test**

Add assertions in `src/lib/feed/client.test.ts` that the client returns a payload with `meta`, `groups`, `matches`, and `bracket`, not a flat `matches` array.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/feed/client.test.ts`
Expected: FAIL because the client still expects `{ matches: [...] }`.

- [ ] **Step 3: Add the normalized schema types**

Create `src/lib/feed/schema.ts` with the shared frontend contract for:
- `OfficialFeedMeta`
- `OfficialGroupTeam`
- `OfficialGroup`
- `OfficialMatch`
- `OfficialBracket`
- `OfficialFeedPayload`

- [ ] **Step 4: Update the client fetcher**

Change `src/lib/feed/client.ts` so `fetchFeedMatches()` becomes a payload fetcher such as `fetchOfficialFeed()` returning `OfficialFeedPayload`.

- [ ] **Step 5: Update the client test fixture**

Update `src/lib/feed/client.test.ts` to use the new payload shape and assert the full normalized return value.

- [ ] **Step 6: Run the test again**

Run: `npm test -- src/lib/feed/client.test.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/lib/feed/schema.ts src/lib/feed/client.ts src/lib/feed/client.test.ts
git commit -m "refactor: define official feed contract"
```

### Task 2: Replace the demo API response with the normalized server payload

**Files:**
- Modify: `api/worldcup-feed.js`
- Modify: `api/worldcup-feed.test.ts`

- [ ] **Step 1: Write the failing API contract test**

Update `api/worldcup-feed.test.ts` so it expects `meta`, `groups`, `matches`, and `bracket`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- api/worldcup-feed.test.ts`
Expected: FAIL because the route currently returns only `{ matches: [...] }`.

- [ ] **Step 3: Normalize the current server payload**

Update `api/worldcup-feed.js` to return the new contract shape, even if the upstream remains static during the first migration slice.

- [ ] **Step 4: Include source metadata**

Ensure the route includes `meta.source`, `meta.syncedAt`, and `meta.upstreamUpdatedAt`.

- [ ] **Step 5: Run the API test again**

Run: `npm test -- api/worldcup-feed.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add api/worldcup-feed.js api/worldcup-feed.test.ts
git commit -m "refactor: normalize world cup feed route"
```

### Task 3: Remove workspace/manual/conflict state from the app shell

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/lib/workspace/storage.ts`
- Modify: `src/lib/workspace/schema.ts`
- Modify: `src/lib/workspace/reducer.ts`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Write the failing app shell test**

Update `src/App.test.tsx` to assert that manual/editorial copy is gone and that the app now references official sync/read-only language.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/App.test.tsx`
Expected: FAIL because the app still renders workspace/editorial language and controls.

- [ ] **Step 3: Introduce a read-only cache model**

Replace the workspace storage helpers with feed snapshot caching, for example:
- load cached official payload
- save cached official payload
- clear invalid cache on parse failure

- [ ] **Step 4: Delete manual/conflict resolution code paths**

Remove:
- manual overrides
- conflict state
- import/export handlers
- modal mutation handlers

- [ ] **Step 5: Rewrite `App.tsx` around official payload state**

`App.tsx` should manage:
- `data`
- `syncState`
- `isStale`
- `error`

It should not build state from `TOURNAMENT_BASE` or use reducer precedence logic.

- [ ] **Step 6: Update the app shell test**

Make `src/App.test.tsx` assert:
- no import/export buttons
- no conflict panel
- official/tracker copy
- sync shell still present

- [ ] **Step 7: Run the test again**

Run: `npm test -- src/App.test.tsx`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/App.tsx src/lib/workspace/storage.ts src/lib/workspace/schema.ts src/lib/workspace/reducer.ts src/App.test.tsx
git commit -m "refactor: remove editable workspace state"
```

### Task 4: Replace group rendering with official standings rendering

**Files:**
- Modify: `src/components/GroupCards.tsx`
- Modify: `src/styles.css`
- Test: `src/App.integration.test.tsx`

- [ ] **Step 1: Write the failing standings test**

Add an integration assertion that the groups section shows ranked standings fields such as points or goal difference instead of just listing team names.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/App.integration.test.tsx`
Expected: FAIL because `GroupCards` currently receives only raw teams.

- [ ] **Step 3: Refactor `GroupCards` input**

Change the component to accept normalized groups with ranked team rows.

- [ ] **Step 4: Render standings rows**

Each group card should show:
- position
- team code and name
- points
- played
- goal difference

- [ ] **Step 5: Add compact styling**

Update `src/styles.css` to support standings tables without breaking the current poster layout.

- [ ] **Step 6: Run the integration test again**

Run: `npm test -- src/App.integration.test.tsx`
Expected: PASS for the new standings assertions

- [ ] **Step 7: Commit**

```bash
git add src/components/GroupCards.tsx src/styles.css src/App.integration.test.tsx
git commit -m "feat: render official group standings"
```

### Task 5: Refactor bracket and match hub to use normalized official matches

**Files:**
- Modify: `src/components/BracketHome.tsx`
- Modify: `src/components/MatchHub.tsx`
- Modify: `src/components/MatchModal.tsx`
- Modify: `src/App.tsx`
- Test: `src/App.integration.test.tsx`

- [ ] **Step 1: Write the failing bracket test**

Add an integration test that the bracket renders official status/source language and does not expose manual editing actions.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/App.integration.test.tsx`
Expected: FAIL because bracket cards and modal still expose manual/base/api semantics and editing controls.

- [ ] **Step 3: Replace card source semantics**

Use normalized match fields directly:
- `scheduled`
- `live`
- `finished`
- `official`

- [ ] **Step 4: Make the modal read-only**

The match modal should become a detail panel with:
- teams
- kickoff
- status
- official score
- next match context when available

No save/accept/keep actions.

- [ ] **Step 5: Update the hub metrics**

Replace manual/conflict counts with official tracker metrics such as:
- finished matches
- live matches
- official sync freshness

- [ ] **Step 6: Run the integration test again**

Run: `npm test -- src/App.integration.test.tsx`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/components/BracketHome.tsx src/components/MatchHub.tsx src/components/MatchModal.tsx src/App.tsx src/App.integration.test.tsx
git commit -m "refactor: make bracket and modal official read-only"
```

### Task 6: Remove obsolete tournament engine/base-data dependencies

**Files:**
- Modify: `src/lib/tournament/base-data.ts`
- Modify: `src/lib/tournament/engine.ts`
- Modify: `src/lib/tournament/engine.test.ts`
- Modify: `src/lib/types.ts`

- [ ] **Step 1: Write the failing dependency check**

Search for remaining imports of the seeded base-data or client-side tournament derivation path and identify which are still needed.

- [ ] **Step 2: Remove unused seeded logic**

Delete or reduce:
- seeded base tournament truth
- manual score derivation support
- heuristic third-place backtracking if bracket order is delivered by the feed

- [ ] **Step 3: Keep only what the app still needs**

Retain utility types/functions only if the normalized payload still depends on them.

- [ ] **Step 4: Update or remove stale tests**

Adapt `src/lib/tournament/engine.test.ts` to the remaining responsibilities, or delete it if the engine is no longer used.

- [ ] **Step 5: Run targeted tests**

Run: `npm test -- src/lib/tournament/engine.test.ts src/App.integration.test.tsx`
Expected: PASS, or no engine test if the engine was intentionally removed.

- [ ] **Step 6: Commit**

```bash
git add src/lib/tournament/base-data.ts src/lib/tournament/engine.ts src/lib/tournament/engine.test.ts src/lib/types.ts
git commit -m "refactor: remove seeded tournament truth"
```

### Task 7: Full verification and publish

**Files:**
- Modify: `README.md` if product copy is documented there

- [ ] **Step 1: Run the focused test suite**

Run: `npm test -- src/App.test.tsx src/App.integration.test.tsx src/lib/feed/client.test.ts api/worldcup-feed.test.ts`
Expected: PASS

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: PASS with 0 failures

- [ ] **Step 3: Run the production build**

Run: `npm run build`
Expected: successful Vite build with exit code 0

- [ ] **Step 4: Review the final diff**

Run: `git diff --stat HEAD~1..HEAD`
Expected: only files related to official-data migration and supporting cleanup

- [ ] **Step 5: Commit any final copy/docs updates**

```bash
git add .
git commit -m "feat: migrate app to official read-only data"
```

- [ ] **Step 6: Push for deployment**

```bash
git push origin main
```
