import { fireEvent, render, screen, within } from "@testing-library/react";
import { App } from "../../src/App";

describe("live dashboard integration", () => {
  it("creates and evaluates a hall request through the UI", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Hall up floor 4" }));

    expect(within(screen.getByTestId("active-requests-panel")).getByText("F4")).toBeInTheDocument();
    expect(screen.getByText("Dispatch Evaluation - Request #001")).toBeInTheDocument();
    expect(screen.getByText(/Selected: Elevator/)).toBeInTheDocument();
  });

  it("wires pause, speed, traffic, add request, and reset controls", () => {
    render(<App />);
    fireEvent.click(screen.getByTestId("control-pause-button"));
    expect(screen.getByTestId("app-header-status")).toHaveTextContent("Paused");
    expect(screen.getByTestId("control-pause-button")).toHaveTextContent("Resume");

    fireEvent.click(screen.getByTestId("control-speed-5"));
    expect(screen.getByTestId("app-header-speed-select")).toHaveValue("5");
    fireEvent.change(screen.getByTestId("control-traffic-select"), { target: { value: "Busy" } });
    expect(screen.getByTestId("control-traffic-select")).toHaveValue("Busy");

    fireEvent.click(screen.getByTestId("control-add-request-button"));
    expect(screen.getByText("Dispatch Evaluation - Request #001")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("control-reset-button"));
    expect(screen.getByText("Create or select a request to inspect its dispatch score.")).toBeInTheDocument();
    expect(within(screen.getByTestId("active-requests-panel")).queryByText(/^F\d+$/)).not.toBeInTheDocument();
  });

  it("filters the live event log by event type", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Hall down floor 8" }));
    const log = screen.getByTestId("event-log-panel");
    expect(within(log).getByText("REQUEST", { selector: "span" })).toBeInTheDocument();
    expect(within(log).getByText("DISPATCH", { selector: "span" })).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("event-log-filter"), { target: { value: "REQUEST" } });
    expect(within(log).getByText("REQUEST", { selector: "span" })).toBeInTheDocument();
    expect(within(log).queryByText("DISPATCH", { selector: "span" })).not.toBeInTheDocument();
  });
});
