import { render, screen, waitFor, within } from "@testing-library/react";

import App from "./App";

describe("App shell", () => {
  it("shows the official read-only tracker framing", async () => {
    render(<App />);

    expect(screen.getByRole("link", { name: /pular para partidas/i })).toHaveAttribute(
      "href",
      "#partidas",
    );
    expect(
      screen.getByRole("heading", { name: /copa 2026 official bracket/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/fonte oficial normalizada/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /partidas em destaque/i })).toBeInTheDocument();
    });

    const summary = screen.getByLabelText(/resumo da home/i);
    expect(within(summary).getByText(/encerradas/i)).toBeInTheDocument();
    expect(within(summary).getByText(/agendadas/i)).toBeInTheDocument();
    expect(within(summary).getByText(/ao vivo/i)).toBeInTheDocument();

    expect(screen.getByRole("tablist", { name: /fases do chaveamento/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ver chave completa/i })).toBeInTheDocument();
    expect(document.querySelector(".workspace-primary")).toHaveAttribute("id", "chave");
    expect(document.querySelector(".workspace-sidebar")).toBeNull();
    expect(screen.getByRole("heading", { name: /classificação dos grupos/i })).toBeInTheDocument();
    expect(screen.queryByText(/conflitos abertos/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /exportar json/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /importar json/i })).not.toBeInTheDocument();
  });
});
