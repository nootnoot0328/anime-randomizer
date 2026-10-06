# Anime Fusion rooms server

A small Cloudflare Worker that lets two phones play a PK match together (Random, Budget or Auction).

## How it works

- Each room is one **Durable Object**: a small, strongly consistent mailbox for one room code. Both phones connect to it with a WebSocket.
- **The host's phone runs the match** with the normal game code. After every move it sends the match state to the room, and the room passes it to the friend.
- **The friend's taps are sent to the host as moves.** The host checks them with the same rules as local play, so the server never needs its own copy of the rules.
- The room keeps two copies of the state. The host gets the **full** copy back after a page reload. The friend only ever receives the **public** copy, which leaves out the auction's hidden deck order.
- Rooms are deleted 48 hours after the last activity. Idle rooms use WebSocket hibernation, so they cost nothing while nobody is moving.

It is separate from your Setpoint Worker on purpose. Anyone with a room link can connect to this server, and it holds no keys and no personal data.

## Cost

Durable Objects are on Cloudflare's free plan (100,000 requests a day, SQLite storage). A whole auction is a few dozen messages, and only the first connection counts as a full request.

## One-time setup (about 5 minutes, no installs)

1. **Cloudflare API token:** Cloudflare dashboard → *My Profile → API Tokens → Create Token* → use the **Edit Cloudflare Workers** template → *Continue to summary → Create Token*. Copy it.
2. **Account ID:** Cloudflare dashboard → *Workers & Pages*. The Account ID is in the right-hand column.
3. **Add both to GitHub:** repository *Settings → Secrets and variables → Actions → New repository secret*:
   - `CLOUDFLARE_API_TOKEN`: the token
   - `CLOUDFLARE_ACCOUNT_ID`: the account ID
4. **Deploy:** repository *Actions → Deploy rooms server → Run workflow*. When it finishes, the run summary shows the server address, something like `https://anime-fusion-rooms.<you>.workers.dev`.
5. **In Anime Fusion:** *Settings → Online play*, paste the address, and tap **Test & save**.

After that, every change to `rooms/` merged into `main` redeploys automatically. Before the secrets exist, automatic runs just skip.

## Playing

- **Host:** PK setup → choose a mode and series → **Online friend** → **Open room** → **Share link**. When your friend shows as joined, tap **Start match**. You are Player 1.
- **Friend:** open the link. Nothing to install or set up; the server address travels inside the link.
- **If a phone drops** (screen locked, bad signal), it reconnects by itself and gets the current board back. Reloading the host's page also brings the match back.
- **The AI referee** runs on the host's phone with the host's key, and the verdict appears on both phones.

## Limits worth knowing

- The host's phone holds the hidden auction order, so a host who opened the browser's developer tools could peek. That's fine between friends. A cheat-proof version would need the rules running on the server.
- One friend per room. A second phone can only take the seat while it's empty.
- There's no automatic forfeit. If your friend leaves for good, start a new room.

## Files

- `worker.js`: the deployed entry point (HTTP routes and the `Room` Durable Object)
- `core.js`: room logic without the Workers runtime, unit-tested in `tests/rooms.test.mjs`
- `wrangler.json`: name, Durable Object binding, allowed pages (`ALLOWED_ORIGINS`) and room lifetime
