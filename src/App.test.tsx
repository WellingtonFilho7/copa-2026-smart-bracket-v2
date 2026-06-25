import { render, screen } from "@testing-library/react";

import App from "./App";

describe("App shell", () => {
  it("shows the product heading", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: /copa 2026 smart bracket/i }),
    ).toBeInTheDocument();
  });
});
