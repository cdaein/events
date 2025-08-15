type MouseListenerCallbacks = {
  onDown?: (e: MouseEvent, mouse: number[], pmouse: number[]) => void;
  onMove?: (e: MouseEvent, mouse: number[], pmouse: number[]) => void;
  onUp?: (e: MouseEvent, mouse: number[], pmouse: number[]) => void;
};

/**
 * Create mouse event listeners and attach to the `element`. Use `dispose` to remove the side effects.
 *
 * @param element - HTML element that need listeners attached to
 * @param handlers - callback functions for each mouse event. Currently, `mousedown`, `mousemove` and `mouseup`
 */
export const createMouseListeners = (
  element: HTMLElement,
  handlers: MouseListenerCallbacks = {},
) => {
  const mouse: number[] = [0, 0];
  const pmouse: number[] = [0, 0];

  const handleMouseDown = (e: MouseEvent) => {
    mouse[0] = e.offsetX;
    mouse[1] = e.offsetY;
    handlers.onDown?.(e, mouse, pmouse);
  };

  const handleMouseMove = (e: MouseEvent) => {
    pmouse[0] = mouse[0];
    pmouse[1] = mouse[1];
    mouse[0] = e.offsetX;
    mouse[1] = e.offsetY;
    handlers.onMove?.(e, mouse, pmouse);
  };

  const handleMouseUp = (e: MouseEvent) => {
    handlers.onUp?.(e, mouse, pmouse);
  };

  element.addEventListener("mousedown", handleMouseDown);
  element.addEventListener("mousemove", handleMouseMove);
  element.addEventListener("mouseup", handleMouseUp);

  const dispose = () => {
    element.removeEventListener("mousedown", handleMouseDown);
    element.removeEventListener("mousemove", handleMouseMove);
    element.removeEventListener("mouseup", handleMouseUp);
  };

  return { mouse, pmouse, dispose };
};
