# Análise de Frontend / UX-UI — Copa 2026 Smart Bracket

**Data:** 2026-06-27
**Escopo:** Página principal (SPA) do app — React 19 + TypeScript + Vite, CSS global em `src/styles.css`.
**Método:** Revisão de código + avaliação visual real (Playwright/Chromium) em desktop (1440×900) e
mobile (390×844), incluindo o modal de edição de placar.
**Idioma da UI:** pt-BR (`<html lang="pt-BR">`).

> Esta é uma rodada de **diagnóstico + plano de ação**. Nenhum código do app foi alterado.
> As correções estão recomendadas e priorizadas na seção [Plano de Ação](#plano-de-ação).

---

## 1. Resumo executivo

O app é funcional e tem uma identidade visual ambiciosa ("álbum/pôster esportivo"), mas a execução
atual sofre de **um bug crítico de layout no mobile**, **lacunas de acessibilidade** e uma
**direção visual que contradiz o próprio design spec já aprovado** no repositório
(`docs/superpowers/specs/2026-06-27-copa-2026-smart-bracket-visual-refresh-design.md`).

Em uma frase: a home atual é justamente a versão "híbrida e indecisa" que aquele spec pediu para
substituir, e além disso quebra no celular — o que colide diretamente com o objetivo declarado de
ser *mobile-first*.

| Severidade | Qtd | Itens |
|---|---|---|
| 🔴 Crítico | 1 | C1 |
| 🟠 Alto | 4 | H1, H2, H3, H4 |
| 🟡 Médio | 5 | M1–M5 |
| 🟢 Baixo | 4 | L1–L4 |

**Top 4 a resolver primeiro:** C1 (overflow mobile), H1 (foco de teclado), H2 (inputs de placar
ilegíveis) e H4 (feedback de sync). Os dois primeiros são correções pequenas de altíssimo retorno.

---

## 2. Evidência visual

| Tela | Antes | Depois |
|---|---|---|
| Desktop — dobra inicial (hero) | `assets/ux-review/desktop-fold.png` | `assets/ux-review/desktop-fold-after.png` |
| Desktop — modal de partida | `assets/ux-review/desktop-modal.png` | `assets/ux-review/desktop-modal-after.png` |
| Mobile — página completa (overflow) | `assets/ux-review/mobile-full.png` | `assets/ux-review/mobile-full-after.png` |
| Desktop — página completa | `assets/ux-review/desktop-full.png` | — |
| Mobile — dobra inicial | `assets/ux-review/mobile-fold.png` | — |

---

## 3. O que está bom (manter)

- **HTML semântico**: `<main>`, `<header>`, `<nav>`, `<section>`, `<aside>`, `<article>`.
- **Interações em elementos corretos**: ações são `<button type="button">` / `<a>`, não `<div>` com
  `onClick` — base sólida para acessibilidade de teclado.
- **Rótulos ARIA presentes** em botões e regiões: `aria-label` em "Abrir partida {id}", `role="dialog"`
  + `aria-modal="true"` no modal, `.sr-only` para rótulos de input, `aria-hidden` em decorações.
- **Inputs numéricos mobile-friendly**: `inputMode="numeric"` + `pattern="[0-9]*"` no modal.
- **Empty state do painel de conflitos** bem tratado (`ConflictPanel.tsx`).
- **Tipografia com personalidade** (Anton condensada para títulos, Fraunces para corpo) e uso de
  `clamp()` para tipografia fluida.
- **Persistência transparente** em `localStorage` + export/import JSON, sem login — boa proposta de valor.

---

## 4. Achados (priorizados por severidade)

### 🔴 CRÍTICO

#### C1 — Overflow horizontal quebra o layout mobile
Medido ao vivo em viewport de **390px**: `document.scrollWidth = 2314px`. O conteúdo fica espremido
numa coluna estreita à esquerda, com ~75% de área vazia à direita (ver `assets/ux-review/mobile-full.png`).

**Causa raiz.** O container de rolagem do bracket vira `display:flex; overflow-x:auto` em
`@media (max-width:900px)` (`src/styles.css:1344`), mas **não é contido**: os filhos diretos do
`.workspace-grid` — `<div id="chave">` e `<div id="conflitos">` (`src/App.tsx:231` e `src/App.tsx:238`) —
são itens de grid com `min-width: auto` (padrão CSS) e **não recebem `min-width: 0`**. Como item de
grid/flex com `min-width:auto` se recusa a encolher abaixo do tamanho do conteúdo, o subtree do
bracket empurra a largura do documento inteiro. O CSS já aplica `min-width:0` em `.match-quick-card`,
`.group-card` e `.match-hub-metrics` (`src/styles.css:1318`, `:1328`, `:1332`) — mas **esqueceu os
wrappers do bracket**.

Confirmação programática dos "culpados" (viewport 390): `.workspace-grid` → `.bracket-shell` (2298px)
→ `.bracket-grid` (2256px).

**Correção recomendada.**
```css
.workspace-grid > * { min-width: 0; }      /* permite que o item de grid encolha */
/* defensivamente: */
.bracket-shell, .bracket-grid { max-width: 100%; }
```
**Validação:** em 390px, `document.documentElement.scrollWidth === window.innerWidth`.
**Impacto:** sem isso, o app é praticamente inutilizável no celular — contradiz o objetivo *mobile-first*.

---

### 🟠 ALTO

#### H1 — Ausência total de estilos de foco
Uma busca em todo o `src/styles.css` não retorna **nenhuma** regra `:focus`, `:focus-visible` ou
`outline`. A navegação é por elementos focáveis (bom), mas usuários de teclado **não enxergam onde
estão**. Falha **WCAG 2.4.7 (Focus Visible)**.

**Correção recomendada.**
```css
:where(a, button, input, [tabindex]):focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
  border-radius: 6px;
}
```

#### H2 — Inputs de placar do modal quase invisíveis
`.modal-score-grid input` é **branco com borda branca** (`border: 2px solid #fff;
background: rgba(255,255,255,.9)`, `src/styles.css:1028`) sobre um gradiente claro azul→lime
(`.modal-score-shell`, `src/styles.css:1006`). Em `assets/ux-review/desktop-modal.png` os dois campos
aparecem como retângulos quase imperceptíveis, **sem separador "x" visível, sem placeholder e sem
indicação de foco**. Como editar o placar é a tarefa central do app, este é justamente o elemento
mais difícil de localizar.

**Correção recomendada:** borda escura/contraste real, fundo sólido, campos maiores, separador "x"
central explícito e foco visível (ver H1). Componente: `src/components/MatchModal.tsx` + CSS.

#### H3 — Hero contradiz o design spec aprovado e prejudica a leitura
O hero atual (faixas diagonais multicoloridas + círculos espalhados + "20"/"26" gigantes + 3
stat-cards coloridos) é exatamente a estética "híbrida e indecisa" que o próprio
`...-visual-refresh-design.md` (seções 2, 5.1 e 5.2) pediu para **substituir** por *"um acento
dominante"*, *"ornamento reduzido"* e *"cor como sinalização, não decoração espalhada"*.

Problemas concretos observados:
- O título branco "BRACKET" atravessa faixas lime/vermelho → **contraste irregular** (`desktop-fold.png`).
- O hero ocupa **quase toda a primeira dobra** em desktop e mobile, empurrando o conteúdo útil
  (Partidas/Chave) para baixo.

**Correção recomendada:** aplicar a direção já aprovada — azul profundo dominante, métricas como
faixa técnica discreta (não mini-cards), ornamento reduzido. Arquivos: `src/App.tsx` (hero) + `src/styles.css`.

#### H4 — Sync sem estados de carregamento/erro
`handleSync` (`src/App.tsx:115`) é `async` e chama `fetchFeedMatches()`, mas **não há** spinner,
desabilitação do botão durante a chamada, nem tratamento de falha — se a Promise rejeitar, o erro é
silencioso e o usuário não recebe feedback algum ao clicar "Buscar feed".

**Correção recomendada:** estado `idle | pending | error`, botão desabilitado + label "Buscando…"
durante a chamada, e mensagem de erro visível. Arquivos: `src/App.tsx`, `src/components/WorkspaceToolbar.tsx`.

---

### 🟡 MÉDIO

- **M1 — Contraste de texto nos group cards claros.** Cabeçalhos como "GRUPO C/F/K" em branco sobre
  lime/laranja (`.group-c`, `.group-f`, `.group-k`) ficam abaixo do recomendado. Existem overrides de
  texto escuro para alguns grupos, mas não cobrem todos os títulos. Validar **todos** contra WCAG AA
  (≥ 4.5:1). Arquivos: `src/components/GroupCards.tsx`, `src/styles.css`.
- **M2 — Letras-fantasma gigantes (A…L) atrás dos group cards** adicionam ruído visual e competem
  com o conteúdo — contra o princípio "contraste antes de textura" do spec.
- **M3 — Altura/densidade do hero no mobile.** Mesmo corrigido C1, o hero consome muito scroll antes
  de "Partidas em destaque", que o spec define como o **ponto de entrada mobile principal**.
- **M4 — `section-nav` sticky pouco diferenciada**; no mobile vira coluna única (`src/styles.css:1398`),
  consumindo bastante altura vertical.
- **M5 — Modal: refinos de acessibilidade.** A pílula "32 AVOS" aparece **sobreposta ao título**
  (`desktop-modal.png`); o dialog **não fecha com `Esc`**, não faz *focus trap* nem move o foco para
  dentro ao abrir / de volta ao gatilho ao fechar. Arquivo: `src/components/MatchModal.tsx`.

---

### 🟢 BAIXO / Polish

- **L1 — Sem skip-link** ("pular para o conteúdo") no topo da página.
- **L2 — Branding/favicon**: verificar `index.html` para favicon e metadados coerentes (título, OG tags).
- **L3 — Placar vazio vs zero:** células sem jogo mostram "-", sem distinção clara de "não jogado"
  vs "0 a 0".
- **L4 — Tokens de cor concorrentes:** a paleta tem tokens duplicados/ambíguos (`--accent` vs
  `--album-blue`, múltiplos `--paper-*`), o que dificulta manutenção e a "consolidação da linguagem
  visual" pedida pelo spec.

---

## 5. Plano de Ação

Recomendação priorizada. **P0/P1 são pequenos e de alto retorno**. A coluna **Status** reflete o
que já foi implementado nesta branch (`claude/frontend-ux-ui-analysis-w9igiw`).

| Prioridade | Item | Arquivos | Status |
|---|---|---|---|
| **P0** | C1 — overflow mobile (`min-width:0` nos filhos do `.workspace-grid`) | `src/styles.css` | ✅ feito |
| **P0** | H1 — foco visível global (`:focus-visible`) | `src/styles.css` | ✅ feito |
| **P1** | H2 — inputs de placar legíveis + separador "×" | `src/styles.css`, `src/components/MatchModal.tsx` | ✅ feito |
| **P1** | H4 — estados de loading/erro no sync | `src/App.tsx`, `src/components/WorkspaceToolbar.tsx` | ✅ feito |
| **P2** | H3 — hero conforme spec aprovado (azul dominante, faixa técnica) | `src/App.tsx`, `src/styles.css` | ✅ feito |
| **P2** | M2 — reduzir ruído das letras-fantasma dos grupos | `src/styles.css` | ✅ feito |
| **P2** | M1 — contraste dos group cards claros | `src/styles.css` | ➖ overrides já existentes cobrem grupos claros (sem mudança) |
| **P3** | M5 — a11y do modal (Esc, foco, fundo mais limpo) | `src/components/MatchModal.tsx`, `src/styles.css` | ✅ feito |
| **P3** | M3 — densidade do hero no mobile | `src/App.tsx`, `src/styles.css` | ✅ feito (hero compacto) |
| **P3** | L1 — skip-link | `src/App.tsx`, `src/styles.css` | ✅ feito |
| **P3** | L2 — favicon + meta description/theme-color | `index.html` | ✅ feito |
| **P3** | M4 — `section-nav` no mobile | `src/styles.css` | ➖ mantido (impacto baixo) |
| **P3** | L3 — placar vazio vs zero | — | ➖ já distinto (`0` vs `-`) |
| **P3** | L4 — consolidação de tokens de cor | `src/styles.css` | ⏭️ adiado (refactor de risco, valor baixo) |

> **Verificação desta rodada:** `npm test` (14/14 ✅) e `npm run build` (✅) passam. Overflow mobile
> confirmado corrigido ao vivo (`scrollWidth === innerWidth === 390`). Screenshots pós-correção
> também em `docs/assets/ux-review/`.

### Como verificar cada correção
- **C1:** abrir em 390px e checar `scrollWidth === innerWidth`; rolar a página sem barra horizontal.
- **H1:** navegar só com `Tab` e confirmar anel de foco visível em todos os controles.
- **H2:** abrir o modal e confirmar que os dois campos e o separador "x" são imediatamente legíveis.
- **H4:** clicar "Buscar feed" com rede lenta/erro e confirmar feedback visual.
- **Regressão:** `npm test` e `npm run build` devem continuar verdes (suíte Vitest + build Vite).

---

## 6. Apêndice — Stack e arquitetura observadas

- **Framework:** React 19.2 + TypeScript 5.9, bundler Vite 7. SPA sem router (uma única página com
  âncoras `#partidas`, `#grupos`, `#chave`, `#conflitos`).
- **Estilo:** CSS global único (`src/styles.css`, ~1.475 linhas), sem Tailwind/CSS Modules; tokens via
  CSS custom properties.
- **Componentes:** `App.tsx` (shell) + `BracketHome`, `MatchHub`, `GroupCards`, `WorkspaceToolbar`,
  `ConflictPanel`, `MatchModal` (em `src/components/`).
- **Estado:** `useState`/`useMemo` em `App.tsx`, reducers em `src/lib/workspace/`, persistência em
  `localStorage`, feed via `src/lib/feed/client.ts` (`/api/worldcup-feed`).
- **Responsividade:** breakpoints em 1280px, 900px e 640px; bracket com rolagem horizontal + scroll-snap
  no mobile (afetado por C1).
- **Testes:** Vitest + Testing Library (`*.test.tsx`).
