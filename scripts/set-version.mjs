// Usage: node scripts/set-version.mjs 1.0.1
// Writes the version everywhere it lives and regenerates the import map in index.html,
// so every module URL carries ?v=<version>. Browsers then never combine a cached old
// module with a new one after an update. Run with no argument to just refresh the map.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = f => path.join(root, f);
const current = JSON.parse(fs.readFileSync(file("version.json"), "utf8")).version;
const next = process.argv[2] || current;
if (!/^\d+\.\d+\.\d+(-[\w.-]+)?$/.test(next)) { console.error("bad version", next); process.exit(1); }

fs.writeFileSync(file("version.json"), JSON.stringify({ version: next }, null, 2) + "\n");
const pkg = JSON.parse(fs.readFileSync(file("package.json"), "utf8")); pkg.version = next;
fs.writeFileSync(file("package.json"), JSON.stringify(pkg, null, 2) + "\n");
const statePath = file("src/core/state.js");
fs.writeFileSync(statePath, fs.readFileSync(statePath, "utf8").replace(/export const VERSION = "[^"]+";/, `export const VERSION = "${next}";`));

function listModules() {
  const modules = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p); else if (e.name.endsWith(".js")) modules.push(path.relative(root, p).split(path.sep).join("/"));
    }
  })(file("src"));
  return modules.sort();
}
const modules = listModules();
const map = { imports: Object.fromEntries(modules.map(m => [`./${m}`, `./${m}?v=${next}`])) };
let html = fs.readFileSync(file("index.html"), "utf8");
html = html.replace(/(<!-- import-map:start[^>]*-->)[\s\S]*?(\s*<!-- import-map:end -->)/, `$1\n  <script type="importmap">\n${JSON.stringify(map, null, 2).replace(/^/gm, "  ")}\n  </script>$2`);
html = html.replace(/(styles\.css|logic\.js|src\/main\.js)\?v=[^"]+/g, `$1?v=${next}`);
fs.writeFileSync(file("index.html"), html);
console.log(`version ${next}; import map lists ${modules.length} modules`);
