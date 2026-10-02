// Hooks the UI layer installs at boot. Game logic calls these instead of touching the
// DOM, which keeps src/core and src/game importable from Node tests.
export const app = {
  render() {},
  toast(_msg) {},
  go(_screen, _opts) {},
  haptic(_kind) {},
  /** Called once when a PK match finishes, with the match. */
  matchComplete(_pk) {},
};
