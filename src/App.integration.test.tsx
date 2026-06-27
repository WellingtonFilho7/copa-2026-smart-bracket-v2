import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "./App";
import { ConflictPanel } from "./components/ConflictPanel";

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
});
