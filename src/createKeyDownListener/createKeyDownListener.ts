/**
 * Create a keydown event listener to capture regular character inputs and other key presses (ie. Backspace, Enter).
 * It manages and transforms an internal string representing the input.
 *
 * One reason to use this function instead of `addEventListener('keydown', ...)` is to handle key combinations (ex. Shift+alphabet).
 *
 * The order of execution: `onKeyEvent`, `specialKeyHandlers`, `onInputUpdate`.
 *
 * @param onInputUpdate - A callback function that gets called with the current state of the input string when a regular key is down. `updatedInput` is the last key input (not accumulated input) that may have been transformed (ie. uppercase) by the internal logic.
 * @param specialKeyHandlers - Add callback functions for any special keys to handle differently. The callback function for each special key must return the updated input string as a result of the callback. By default, special keys such as Ctrl, Alt, Meta are ignored unless handled here.
 * @param onKeyEvent - An optional callback function that gets called with the raw `KeyboardEvent` for every keydown event.
 * @param validCharacterRegex - An optional regular expression that defines the white-list or the range(s) of keys to process. The default `/^[ -~\u3130-\u318f]$/` covers ASCII 32(space) to 126(tilde) + Hangul compatability Jamo
 *
 * @example
 * let keyInput = "";
 *
 * const listener = createKeyDownListener(
 *   (updatedInput) => (keyInput = updatedInput),
 *   {
 *     Backspace: (currentInput, event) => {
 *       event.preventDefault();
 *       return currentInput.length > 0
 *         ? currentInput.slice(0, -1)
 *         : currentInput;
 *     },
 *     Enter: (currentInput, event) => {
 *       event.preventDefault();
 *       return currentInput + "\n";
 *     },
 *   },
 *   (event) => console.log("Raw Key Event:", event.key),
 *   /^[ -~\u3130-\u318f]$/, // latin alphabet, symbols and compat jamo range
 * );
 */
export const createKeyDownListener = (
  onInputUpdate: (updatedInput: string) => void,
  specialKeyHandlers?: {
    [key: string]: (currentInput: string, event: KeyboardEvent) => string;
  },
  onKeyEvent?: (event: KeyboardEvent) => void,
  validCharacterRegex?: RegExp,
) => {
  let internalKeyInput = "";

  // matches any single character from ASCII 32 (space) to ASCII 126 (tilde) plus Korean Hangul compatability Jamo
  const defaultValidCharRegex = /^[ -~\u3130-\u318f]$/;
  const currentValidCharRegex =
    validCharacterRegex instanceof RegExp
      ? validCharacterRegex
      : defaultValidCharRegex;

  return (event: KeyboardEvent) => {
    const pressedKey = event.key;

    // check for modifier keys that should prevent input (Ctrl, Alt, Meta)
    const isModifierCombination =
      event.ctrlKey || event.altKey || event.metaKey;

    // whitelist check for regular printable characters using the configurable regex
    const isRegularPrintableCharacter = currentValidCharRegex.test(pressedKey);

    let inputChanged = false; // flag to track if internalKeyInput was modified
    let newInternalKeyInput = internalKeyInput;

    if (onKeyEvent) {
      onKeyEvent(event);
    }

    if (specialKeyHandlers && specialKeyHandlers[pressedKey]) {
      const result = specialKeyHandlers[pressedKey](internalKeyInput, event);
      if (result !== internalKeyInput) {
        // check if the handler actually changed the input
        newInternalKeyInput = result;
        // only call when result changed
        // inputChanged = true;
      }
      // need to call even if result hasn't changed to be able to change `updatedInput` when Backspace is pressed for example.
      inputChanged = true;
    }
    // handle regular printable characters (including uppercase and symbols from Shift)
    else if (!isModifierCombination && isRegularPrintableCharacter) {
      event.preventDefault();
      newInternalKeyInput = pressedKey;
      inputChanged = true;
    }

    if (inputChanged) {
      internalKeyInput = newInternalKeyInput;
      onInputUpdate(internalKeyInput);
    }
  };
};
