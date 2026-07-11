import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("ReleaseShelf catalog", () => {
  it("filters curated applications by the entered search query", () => {
    render(<App />);

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "signal" },
    });

    expect(
      screen.getAllByRole("button", { name: /Signal Desktop/i }),
    ).not.toHaveLength(0);
    expect(
      screen.queryByRole("button", { name: /Obsidian/i }),
    ).toBeNull();
  });
});
