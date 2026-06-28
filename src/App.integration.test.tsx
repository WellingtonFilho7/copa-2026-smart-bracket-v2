import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "./App";
import { ConflictPanel } from "./components/ConflictPanel";
import "./styles.css";

describe("Copa 2026 Smart Bracket UI", () => {
  it("uses neutral summary copy when there are no open conflicts", () => {
    render(<ConflictPanel conflicts={[]} />);

    expect(screen.getByText(/nenhum conflito aberto/i)).toBeInTheDocument();
  });

  it("keeps the quick match entry flow after the visual refresh", async () => {
    const user = userEvent.setup();

    render(<App />);

    expect(screen.getByRole("heading", { name: /partidas em destaque/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/última sincronização/i)).toHaveTextContent(/ainda não sincronizado/i);

    await user.click(screen.getByRole("button", { name: /abrir partida rápida k3/i }));

    expect(screen.getByRole("dialog", { name: /partida k3/i })).toBeInTheDocument();
  });

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

    expect(screen.getByRole("dialog", { name: /partida k3/i })).toBeInTheDocument();

    const homeScore = screen.getByLabelText(/placar casa/i);
    const awayScore = screen.getByLabelText(/placar fora/i);

    await user.clear(homeScore);
    await user.type(homeScore, "3");
    await user.clear(awayScore);
    await user.type(awayScore, "2");
    await user.click(screen.getByRole("button", { name: /salvar placar/i }));

    expect(screen.getByText(/fonte atual: manual/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /buscar feed/i }));

    await waitFor(() => {
      expect(screen.getByText(/1 conflito aberto/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/api sugeriu 1 x 0/i)).toBeInTheDocument();
  });

  it("traps focus inside the match modal", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole("button", { name: /abrir partida rápida k3/i }));

    const dialog = screen.getByRole("dialog", { name: /partida k3/i });
    const closeButton = screen.getByRole("button", { name: /fechar/i });
    const structureButton = screen.getByRole("button", { name: /ver estrutura da chave/i });

    expect(dialog).toHaveFocus();

    await user.tab();
    expect(closeButton).toHaveFocus();

    await user.tab({ shift: true });
    expect(structureButton).toHaveFocus();
  });

  it("shows the bracket in phase mode by default and reveals the full tree on demand", async () => {
    const user = userEvent.setup();

    render(<App />);

    expect(screen.getByRole("tab", { name: /32 avos/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("button", { name: /^abrir partida k1$/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^abrir partida o1$/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /quartas/i }));

    expect(screen.getByRole("tab", { name: /quartas/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("button", { name: /^abrir partida q1$/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^abrir partida k1$/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /ver chave completa/i }));

    expect(screen.getByRole("button", { name: /^abrir partida k1$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^abrir partida o1$/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /voltar para fases/i }));

    expect(screen.queryByRole("button", { name: /^abrir partida o1$/i })).not.toBeInTheDocument();
  });

  it("supports arrow navigation across bracket phases", async () => {
    const user = userEvent.setup();

    render(<App />);

    const round32Tab = screen.getByRole("tab", { name: /32 avos/i });
    round32Tab.focus();

    await user.keyboard("{ArrowRight}");

    const round16Tab = screen.getByRole("tab", { name: /oitavas/i });
    expect(round16Tab).toHaveFocus();
    expect(round16Tab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("button", { name: /^abrir partida o1$/i })).toBeInTheDocument();
  });

  it("keeps phase cards at their natural height instead of stretching every row", () => {
    render(<App />);

    const stageList = document.querySelector(".bracket-stage-list");
    const stageCard = document.querySelector(".bracket-stage-card");

    expect(stageList).not.toBeNull();
    expect(stageCard).not.toBeNull();
    expect(getComputedStyle(stageList as HTMLElement).alignItems).toBe("start");
    expect(getComputedStyle(stageCard as HTMLElement).minHeight).toMatch(/^0(px)?$/);
  });

  it("marks knockout cards that already happened differently from upcoming matches", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-28T20:00:00-03:00"));

    render(<App />);

    const playedMatch = screen.getByRole("button", { name: /^abrir partida k3$/i });
    const upcomingMatch = screen.getByRole("button", { name: /^abrir partida k1$/i });

    expect(playedMatch).toHaveClass("match-card-played");
    expect(upcomingMatch).not.toHaveClass("match-card-played");

    vi.useRealTimers();
  });
});
