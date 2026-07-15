import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button, ProgressBar, StatPill } from "@sediment/ui";
import { Zap } from "lucide-react";

describe("Button", () => {
  it("renders its label and responds to clicks", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Send to Restoration</Button>);
    const button = screen.getByRole("button", { name: "Send to Restoration" });
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire onClick when disabled", () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Finish Restoration
      </Button>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Finish Restoration" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("ProgressBar", () => {
  it("clamps a value above 100 down to 100% width", () => {
    render(<ProgressBar value={140} />);
    expect(screen.getByTestId("progress-fill")).toHaveStyle({ width: "100%" });
  });

  it("clamps a negative value up to 0% width", () => {
    render(<ProgressBar value={-20} />);
    expect(screen.getByTestId("progress-fill")).toHaveStyle({ width: "0%" });
  });

  it("shows the percentage label when showPercent is set", () => {
    render(<ProgressBar value={63} showPercent />);
    expect(screen.getByText("63%")).toBeInTheDocument();
  });
});

describe("StatPill", () => {
  it("renders the add button and calls onAdd when clicked", () => {
    const onAdd = vi.fn();
    render(<StatPill icon={<Zap size={16} />} value="86/100" tone="energy" onAdd={onAdd} />);
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("omits the add button when onAdd is not provided", () => {
    render(<StatPill icon={<Zap size={16} />} value="86/100" tone="energy" />);
    expect(screen.queryByRole("button", { name: "Add" })).not.toBeInTheDocument();
  });
});
