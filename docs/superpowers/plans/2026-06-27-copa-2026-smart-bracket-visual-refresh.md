# Copa 2026 Smart Bracket Visual Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reestilizar a home e as superfícies principais com linguagem de pôster esportivo clássico, mantendo o comportamento atual intacto.

**Architecture:** A implementação preserva a árvore atual de componentes e concentra a mudança em hierarquia visual, copy, composição e CSS. O plano distribui o trabalho entre shell da página, superfícies de entrada mobile e superfícies de detalhe, sempre validando com a suíte atual e build de produção.

**Tech Stack:** React, TypeScript, CSS global, Vitest, Testing Library, Vite

---

## File Structure

- Modify: `src/App.tsx`
  - Ajustar hero, seção dos grupos e framing visual da home.
- Modify: `src/styles.css`
  - Consolidar a nova linguagem visual de pôster clássico.
- Modify: `src/components/WorkspaceToolbar.tsx`
  - Simplificar a faixa de controle.
- Modify: `src/components/MatchHub.tsx`
  - Dar prioridade visual a placares, fase e status.
- Modify: `src/components/GroupCards.tsx`
  - Remover visual repetitivo de card colorido.
- Modify: `src/components/ConflictPanel.tsx`
  - Transformar conflitos em aviso editorial claro.
- Modify: `src/components/BracketHome.tsx`
  - Deixar o chaveamento mais oficial e menos “app card”.
- Modify: `src/components/MatchModal.tsx`
  - Reforçar hierarquia do placar e ações principais.
- Modify: `src/App.test.tsx`
  - Validar a nova assinatura textual da home.
- Modify: `src/App.integration.test.tsx`
  - Garantir que os fluxos principais seguem intactos.

### Task 1: Reframe da Home

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Write the failing smoke test for the new home framing**

```tsx
import { render, screen } from "@testing-library/react";

import App from "./App";

describe("App shell", () => {
  it("shows the new poster-style home framing", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: /copa 2026 smart bracket/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/acompanhe o mata-mata/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /grupos classificados/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm test -- src/App.test.tsx`
Expected: FAIL because the new copy `/acompanhe o mata-mata/i` is not rendered yet.

- [ ] **Step 3: Update the home hero and section framing in `src/App.tsx`**

```tsx
<header className="hero">
  <div className="hero-copy">
    <p className="eyebrow">World Cup 2026 • bracket poster</p>
    <h1>Copa 2026 Smart Bracket</h1>
    <p className="hero-lead">
      Acompanhe o mata-mata, ajuste resultados e revise conflitos em uma página
      com cara de tabela oficial.
    </p>
  </div>

  <div className="hero-ribbon" aria-label="Resumo da home">
    <span>{filledMatchCount} placares</span>
    <span>{manualMatchCount} manuais</span>
    <span>{feedMatchCount} da API</span>
  </div>
</header>

<section className="section-block" id="grupos">
  <div className="section-heading">
    <p className="eyebrow">Mapa do torneio</p>
    <h2>Grupos classificados</h2>
  </div>
  <GroupCards teams={workspace.tournament.teams} />
</section>
```

- [ ] **Step 4: Re-run the focused test to verify it passes**

Run: `npm test -- src/App.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit the home reframing**

```bash
git add src/App.tsx src/App.test.tsx
git commit -m "Refine poster-style home framing"
```

### Task 2: Mobile Entry Surfaces

**Files:**
- Modify: `src/components/WorkspaceToolbar.tsx`
- Modify: `src/components/MatchHub.tsx`
- Modify: `src/components/GroupCards.tsx`
- Modify: `src/styles.css`
- Test: `src/App.integration.test.tsx`

- [ ] **Step 1: Extend the integration test to preserve the quick-entry flow**

```tsx
it("keeps the quick match entry flow after the visual refresh", async () => {
  const user = userEvent.setup();

  render(<App />);

  expect(screen.getByRole("heading", { name: /partidas rápidas/i })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /abrir partida rápida k3/i }));

  expect(screen.getByRole("dialog", { name: /partida k3/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the focused integration file to verify the baseline still passes**

Run: `npm test -- src/App.integration.test.tsx`
Expected: PASS before visual edits, confirming the test is stable.

- [ ] **Step 3: Simplify toolbar, densify match hub and normalize group cards**

```tsx
// src/components/WorkspaceToolbar.tsx
<div className="toolbar">
  <div className="toolbar-copy">
    <p className="eyebrow">Controle do workspace</p>
    <p className="toolbar-lead">Atualize o feed, exporte o estado e retome de onde parou.</p>
  </div>
  <div className="toolbar-row">
    <button className="primary-button" type="button" onClick={onSync}>
      Buscar feed
    </button>
    <button className="ghost-button" type="button" onClick={onExport}>
      Exportar JSON
    </button>
    <button className="ghost-button" type="button" onClick={onImportClick}>
      Importar JSON
    </button>
  </div>
</div>

// src/components/MatchHub.tsx
<article className="match-quick-card" key={match.id} role="listitem">
  <div className="match-quick-meta">
    <span>{match.stage}</span>
    <span>{match.kickoff}</span>
  </div>
  <div className="match-quick-score" aria-label={`Placar atual ${match.id}`}>
    <strong>{match.homeScore ?? "-"}</strong>
    <span>x</span>
    <strong>{match.awayScore ?? "-"}</strong>
  </div>
  <h3>{match.homeTeam} x {match.awayTeam}</h3>
  <div className="match-quick-status">
    <span className={`status-pill status-${match.source}`}>{sourceCopy[match.source]}</span>
    {match.hasConflict ? <span className="status-pill status-conflict">conflito</span> : null}
  </div>
</article>

// src/components/GroupCards.tsx
<section className={`group-card group-${group.toLowerCase()}`}>
  <header className="group-card-header">
    <p className="eyebrow">Grupo {group}</p>
    <h3>{teams.length} seleções</h3>
  </header>
  <ul className="group-team-list">
    {teams.map((team) => (
      <li key={team.code}>
        <span className="group-team-seed">{team.code}</span>
        <span>{team.name}</span>
      </li>
    ))}
  </ul>
</section>
```

- [ ] **Step 4: Add the matching CSS for the poster-style mobile entry surfaces**

```css
.hero-ribbon,
.toolbar,
.match-hub,
.group-card {
  border: 1px solid var(--line-strong);
  background: var(--paper-strong);
}

.match-quick-card {
  border-radius: 10px;
  border: 1px solid var(--line-strong);
  box-shadow: none;
}

.match-quick-score {
  font-size: clamp(2rem, 6vw, 3rem);
  font-weight: 700;
}

.group-card {
  border-left: 4px solid var(--group-accent);
}
```

- [ ] **Step 5: Re-run the integration test to verify interaction survived the redesign**

Run: `npm test -- src/App.integration.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit the mobile entry surface refresh**

```bash
git add src/components/WorkspaceToolbar.tsx src/components/MatchHub.tsx src/components/GroupCards.tsx src/styles.css src/App.integration.test.tsx
git commit -m "Refresh mobile entry surfaces"
```

### Task 3: Chaveamento, Conflitos e Modal

**Files:**
- Modify: `src/components/BracketHome.tsx`
- Modify: `src/components/ConflictPanel.tsx`
- Modify: `src/components/MatchModal.tsx`
- Modify: `src/styles.css`
- Test: `src/App.integration.test.tsx`

- [ ] **Step 1: Keep the existing modal/conflict regression test as the guardrail**

```tsx
it("opens a knockout match modal, saves a manual score, and shows a conflict after sync", async () => {
  const user = userEvent.setup();
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      matches: [{ id: "K3", homeScore: 1, awayScore: 0, status: "finished" }],
    }),
  });

  vi.stubGlobal("fetch", fetchMock);

  render(<App />);
  await user.click(screen.getByRole("button", { name: /abrir partida k3/i }));
  const homeScore = screen.getByLabelText(/placar casa/i);
  const awayScore = screen.getByLabelText(/placar fora/i);

  await user.clear(homeScore);
  await user.type(homeScore, "3");
  await user.clear(awayScore);
  await user.type(awayScore, "2");
  await user.click(screen.getByRole("button", { name: /salvar placar/i }));

  await user.click(screen.getByRole("button", { name: /buscar feed/i }));
});
```

- [ ] **Step 2: Run the focused integration file before changing detail surfaces**

Run: `npm test -- src/App.integration.test.tsx`
Expected: PASS

- [ ] **Step 3: Recompose the bracket, conflict panel and modal markup**

```tsx
// src/components/BracketHome.tsx
<section className="bracket-shell">
  <div className="bracket-header">
    <p className="eyebrow">Fase eliminatória</p>
    <h2>Chaveamento da Copa do Mundo 2026</h2>
    <p>Tabela principal • horários de Brasília • edição manual ativa</p>
  </div>
  <div className="bracket-grid">
    {columns.map((column) => (
      <div className="bracket-column" key={`${column.title}-${column.ids[0]}`}>
        <h3>{column.title}</h3>
      </div>
    ))}
  </div>
</section>

// src/components/ConflictPanel.tsx
<aside className="conflict-panel">
  <div className="conflict-panel-header">
    <p className="eyebrow">Revisão editorial</p>
    <h3>Conflitos abertos</h3>
  </div>
  <ul className="conflict-list">
    {conflicts.map((conflict) => (
      <li key={conflict.matchId}>
        <strong>{conflict.matchId}</strong>
        <span>Manual {conflict.manualValue.homeScore} x {conflict.manualValue.awayScore}</span>
        <span>API {conflict.externalValue.homeScore} x {conflict.externalValue.awayScore}</span>
      </li>
    ))}
  </ul>
</aside>

// src/components/MatchModal.tsx
<header className="match-modal-header">
  <div>
    <p className="eyebrow">{match.stage}</p>
    <h2>Partida {match.id}</h2>
    <p>{match.kickoff}</p>
  </div>
  <button className="ghost-button" type="button" onClick={onClose}>
    Fechar
  </button>
</header>
```

- [ ] **Step 4: Update CSS to make these surfaces feel official instead of card-based**

```css
.bracket-shell,
.conflict-panel,
.match-modal {
  border-radius: 12px;
  border: 1px solid var(--line-strong);
  box-shadow: none;
}

.bracket-column h3,
.match-card-meta,
.conflict-count-badge,
.match-modal h2 {
  color: var(--ink-strong);
}

.conflict-list li {
  border-left: 4px solid var(--warn);
  background: var(--paper-alert);
}
```

- [ ] **Step 5: Re-run the integration regression test**

Run: `npm test -- src/App.integration.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit the detail-surface refresh**

```bash
git add src/components/BracketHome.tsx src/components/ConflictPanel.tsx src/components/MatchModal.tsx src/styles.css
git commit -m "Refresh bracket conflicts and modal styling"
```

### Task 4: Final Verification and Cleanup

**Files:**
- Modify: `src/styles.css`
- Test: `src/App.test.tsx`
- Test: `src/App.integration.test.tsx`

- [ ] **Step 1: Do a final pass for variable cleanup and responsive consistency**

```css
:root {
  --paper-base: #f6f0e6;
  --paper-strong: #fffaf2;
  --paper-alert: #f9efe0;
  --ink-strong: #16181c;
  --line-strong: #1f3656;
  --accent: #17355b;
  --warn: #a45708;
}

@media (max-width: 900px) {
  .section-nav,
  .group-strip,
  .bracket-grid {
    overflow-x: auto;
  }
}
```

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: PASS with all current tests green.

- [ ] **Step 3: Run the production build**

Run: `npm run build`
Expected: Vite build completes successfully with emitted assets in `dist/`.

- [ ] **Step 4: Review the final diff before publishing**

Run: `git diff --stat HEAD~3..HEAD`
Expected: Changes concentrated in `src/App.tsx`, the UI components, tests, and `src/styles.css`.

- [ ] **Step 5: Commit the final visual polish**

```bash
git add src/App.tsx src/styles.css src/App.test.tsx src/App.integration.test.tsx
git commit -m "Finalize visual refresh polish"
```
