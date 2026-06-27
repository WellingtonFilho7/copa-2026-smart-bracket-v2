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
