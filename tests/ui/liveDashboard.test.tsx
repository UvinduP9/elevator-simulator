import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../../src/App";

describe("live dashboard", () => {
  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", () => 1);
    vi.stubGlobal("cancelAnimationFrame", () => undefined);
  });

  it("creates a hall call and shows it in Active Requests (US-L3)", () => {
    render(<App />);
    fireEvent.click(screen.getByTestId("hall-call-5-up"));
    const panel = screen.getByTestId("active-requests-panel");
    expect(within(panel).getByText("F5")).toBeInTheDocument();
    expect(screen.getByTestId("elevator-car-A")).toBeInTheDocument();
  });

  it("+ Add request injects a row (US-L4 wiring)", () => {
    render(<App />);
    fireEvent.click(screen.getByTestId("control-add-request-button"));
    const panel = screen.getByTestId("active-requests-panel");
    expect(within(panel).queryByText("No active requests")).not.toBeInTheDocument();
  });

  it("pause and resume update header status (US-L6)", () => {
    render(<App />);
    expect(screen.getByTestId("app-header-status")).toHaveTextContent("Running");
    fireEvent.click(screen.getByTestId("control-pause-button"));
    expect(screen.getByTestId("app-header-status")).toHaveTextContent("Paused");
    expect(screen.getByTestId("control-pause-button")).toHaveTextContent("Resume");
    fireEvent.click(screen.getByTestId("control-pause-button"));
    expect(screen.getByTestId("app-header-status")).toHaveTextContent("Running");
  });

  it("reset clears requests and the event log (US-L6, US-O5)", () => {
    render(<App />);
    fireEvent.click(screen.getByTestId("hall-call-4-up"));
    fireEvent.click(screen.getByTestId("control-reset-button"));
    expect(screen.getByText("No active requests")).toBeInTheDocument();
    expect(screen.getByText("No events")).toBeInTheDocument();
  });

  it("filters the event log by type (US-O5)", () => {
    render(<App />);
    fireEvent.click(screen.getByTestId("hall-call-6-up"));
    const log = screen.getByTestId("event-log-panel");
    fireEvent.change(screen.getByTestId("event-log-filter"), { target: { value: "REQUEST" } });
    expect(within(log).getByText(/created/)).toBeInTheDocument();
    fireEvent.change(screen.getByTestId("event-log-filter"), { target: { value: "PASSENGER" } });
    expect(within(log).getByText("No events")).toBeInTheDocument();
  });
});
