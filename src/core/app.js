// Hooks the UI layer installs at boot. Game logic calls these instead of touching the
// DOM, which keeps src/core and src/game importable from Node tests.
export const app = {
  render() {},
  toast(_msg) {},
  go(_screen, _opts) {},
  haptic(_kind) {},
  /** Called once when a PK match finishes, with the match. */
  matchComplete(_pk) {},
  /** Online friend's phone: send a move to the host (installed by src/online/room.js). */
  sendAction(_action) {},
  /** Called after every render (the online host uses it to send the latest state). */
  afterRender() {},
};
