import { render, screen, within } from "@testing-library/react";

import App from "./App";

describe("App shell", () => {
  it("shows the new poster-style home framing", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: /copa 2026 smart bracket/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/acompanhe a chave/i)).toBeInTheDocument();
    const summary = screen.getByLabelText(/resumo da home/i);
    expect(within(summary).getByText(/placares/i)).toBeInTheDocument();
    expect(within(summary).getByText(/manuais/i)).toBeInTheDocument();
    expect(within(summary).getByText(/da api/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /grupos classificados/i })).toBeInTheDocument();
  });
});
