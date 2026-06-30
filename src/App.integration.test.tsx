import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "./App";
import "./styles.css";

describe("Copa 2026 official bracket UI", () => {
  it("keeps the quick official match flow after the migration", async () => {
    const user = userEvent.setup();

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /partidas em destaque/i })).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/última sincronização/i)).toHaveTextContent(/\d{2}\/\d{2}/i);

    await user.click(screen.getByRole("button", { name: /abrir partida rápida k3/i }));

    expect(screen.getByRole("dialog", { name: /partida k3/i })).toBeInTheDocument();
    expect(screen.getByText(/fonte atual: oficial/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /salvar placar/i })).not.toBeInTheDocument();
  });

  it("traps focus inside the match modal", async () => {
    const user = userEvent.setup();

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /abrir partida rápida k3/i })).toBeInTheDocument();
    });

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

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /32 avos/i })).toHaveAttribute("aria-selected", "true");
    });

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

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /32 avos/i })).toBeInTheDocument();
    });

    const round32Tab = screen.getByRole("tab", { name: /32 avos/i });
    round32Tab.focus();

    await user.keyboard("{ArrowRight}");

    const round16Tab = screen.getByRole("tab", { name: /oitavas/i });
    expect(round16Tab).toHaveFocus();
    expect(round16Tab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("button", { name: /^abrir partida o1$/i })).toBeInTheDocument();
  });

  it("keeps phase cards at their natural height instead of stretching every row", async () => {
    render(<App />);

    await waitFor(() => {
      expect(document.querySelector(".bracket-stage-list")).not.toBeNull();
    });

    const stageList = document.querySelector(".bracket-stage-list");
    const stageCard = document.querySelector(".bracket-stage-card");

    expect(stageList).not.toBeNull();
    expect(stageCard).not.toBeNull();
    expect(getComputedStyle(stageList as HTMLElement).alignItems).toBe("start");
    expect(getComputedStyle(stageCard as HTMLElement).minHeight).toMatch(/^0(px)?$/);
  });

  it("marks finished knockout cards differently from upcoming matches", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^abrir partida k3$/i })).toBeInTheDocument();
    });

    const playedMatch = screen.getByRole("button", { name: /^abrir partida k3$/i });
    const upcomingMatch = screen.getByRole("button", { name: /^abrir partida k1$/i });

    expect(playedMatch).toHaveClass("match-card-played");
    expect(upcomingMatch).not.toHaveClass("match-card-played");
  });
});
