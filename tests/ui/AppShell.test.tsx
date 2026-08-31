import { render, screen } from "@testing-library/react";
import { App } from "../../src/App";

describe("AppShell", () => {
  it("shows the simulator title and ten floor labels", () => {
    render(<App />);
    expect(screen.getByText("Elevator Dispatch Simulator")).toBeInTheDocument();
    for (let floor = 1; floor <= 10; floor += 1) {
      expect(screen.getAllByText(String(floor)).length).toBeGreaterThan(0);
    }
  });
});
