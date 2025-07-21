import { describe, it, expect, vi, beforeEach } from "vitest";
import { createKeyDownListener } from "../createKeyDownListener";

describe("createKeyDownListener()", () => {
  let onInputUpdate: ReturnType<typeof vi.fn>;
  let onKeyEvent: ReturnType<typeof vi.fn>;
  let mockEvent: Partial<KeyboardEvent>;

  beforeEach(() => {
    onInputUpdate = vi.fn();
    onKeyEvent = vi.fn();
    mockEvent = {
      key: "",
      ctrlKey: false,
      altKey: false,
      metaKey: false,
      shiftKey: false,
      preventDefault: vi.fn(),
    };
  });

  it("handles regular characters", () => {
    const listener = createKeyDownListener(
      onInputUpdate,
      {},
      onKeyEvent,
      /^[a-z]$/,
    );

    listener({ ...mockEvent, key: "a" } as KeyboardEvent);

    expect(onInputUpdate).toHaveBeenCalledWith("a");
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it("calls onKeyEvent for every keydown", () => {
    const listener = createKeyDownListener(
      onInputUpdate,
      {},
      onKeyEvent,
      /^[a-z]$/,
    );
    const event = { ...mockEvent, key: "a" } as KeyboardEvent;

    listener(event);

    expect(onKeyEvent).toHaveBeenCalledWith(event);
  });

  it("ignores modifier key combinations", () => {
    const listener = createKeyDownListener(
      onInputUpdate,
      {},
      onKeyEvent,
      /^[a-z]$/,
    );

    listener({ ...mockEvent, key: "a", ctrlKey: true } as KeyboardEvent);

    expect(onInputUpdate).not.toHaveBeenCalled();
    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
  });

  it("handles special keys", () => {
    const backspaceHandler = vi.fn().mockReturnValue("updated");
    const listener = createKeyDownListener(
      onInputUpdate,
      {
        Backspace: backspaceHandler,
      },
      onKeyEvent,
      /^[a-z]$/,
    );
    const event = { ...mockEvent, key: "Backspace" } as KeyboardEvent;

    listener(event);

    expect(backspaceHandler).toHaveBeenCalledWith("", event);
    expect(onInputUpdate).toHaveBeenCalledWith("updated");
  });

  it("uses default regex when none provided", () => {
    const listener = createKeyDownListener(
      onInputUpdate,
      {},
      onKeyEvent,
      null as any,
    );

    listener({ ...mockEvent, key: "A" } as KeyboardEvent);
    listener({ ...mockEvent, key: "!" } as KeyboardEvent);
    listener({ ...mockEvent, key: "ㅏ" } as KeyboardEvent); // Hangul compat Jamo

    expect(onInputUpdate).toHaveBeenCalledTimes(3);
  });

  it("filters characters based on regex", () => {
    const listener = createKeyDownListener(
      onInputUpdate,
      {},
      onKeyEvent,
      /^[0-9]$/,
    );

    listener({ ...mockEvent, key: "5" } as KeyboardEvent);
    listener({ ...mockEvent, key: "a" } as KeyboardEvent); // doesn't fire

    expect(onInputUpdate).toHaveBeenCalledTimes(1);
    expect(onInputUpdate).toHaveBeenCalledWith("5");
  });

  it("maintains internal state across calls", () => {
    let currentInput = "";
    const listener = createKeyDownListener(
      (input) => {
        currentInput = input;
      },
      {
        Backspace: (input) => input.slice(0, -1),
      },
      onKeyEvent,
      /^[a-z]$/,
    );

    // Add character
    listener({ ...mockEvent, key: "a" } as KeyboardEvent);
    expect(currentInput).toBe("a");

    // Add another character (should replace, not append based on function logic)
    listener({ ...mockEvent, key: "b" } as KeyboardEvent);
    expect(currentInput).toBe("b");

    // Backspace
    listener({ ...mockEvent, key: "Backspace" } as KeyboardEvent);
    expect(currentInput).toBe("");
  });

  it("does not call onInputUpdate when special key handler returns same input", () => {
    const noOpHandler = vi.fn().mockImplementation((input) => input);
    const listener = createKeyDownListener(
      onInputUpdate,
      {
        Enter: noOpHandler,
      },
      onKeyEvent,
      /^[a-z]$/,
    );

    listener({ ...mockEvent, key: "Enter" } as KeyboardEvent);

    expect(noOpHandler).toHaveBeenCalled();
    // expect(onInputUpdate).not.toHaveBeenCalled(); // No change, so no update
  });

  it("handles uppercase letters and symbols", () => {
    const listener = createKeyDownListener(
      onInputUpdate,
      {},
      onKeyEvent,
      /^[ -~]$/,
    );

    listener({ ...mockEvent, key: "A" } as KeyboardEvent);
    listener({ ...mockEvent, key: "@" } as KeyboardEvent);
    listener({ ...mockEvent, key: " " } as KeyboardEvent);

    expect(onInputUpdate).toHaveBeenCalledTimes(3);
    expect(onInputUpdate).toHaveBeenNthCalledWith(1, "A");
    expect(onInputUpdate).toHaveBeenNthCalledWith(2, "@");
    expect(onInputUpdate).toHaveBeenNthCalledWith(3, " ");
  });

  it("handles shift combinations for uppercase and symbols", () => {
    const listener = createKeyDownListener(
      onInputUpdate,
      {},
      onKeyEvent,
      /^[ -~]$/,
    );

    // Shift + a = A
    listener({ ...mockEvent, key: "A", shiftKey: true } as KeyboardEvent);
    // Shift + 2 = @
    listener({ ...mockEvent, key: "@", shiftKey: true } as KeyboardEvent);
    // Space (no shift needed)
    listener({ ...mockEvent, key: " " } as KeyboardEvent);

    expect(onInputUpdate).toHaveBeenCalledTimes(3);
    expect(onInputUpdate).toHaveBeenNthCalledWith(1, "A");
    expect(onInputUpdate).toHaveBeenNthCalledWith(2, "@");
    expect(onInputUpdate).toHaveBeenNthCalledWith(3, " ");
  });

  it("ignores invalid regex parameter", () => {
    const listener = createKeyDownListener(
      onInputUpdate,
      {},
      onKeyEvent,
      "invalid" as any,
    );

    listener({ ...mockEvent, key: "a" } as KeyboardEvent);

    expect(onInputUpdate).toHaveBeenCalledWith("a");
  });
});
