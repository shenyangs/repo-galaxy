# A02 — RepoGalaxy

Build a visually stunning interactive constellation of ACTUAL GitHub repository files and imports. Read ./AGENTS.md first. One 110-minute focused MVP, only in this directory.

## Stack / sources
- React + TypeScript + `@xyflow/react` and `dagre` or other preinstalled layout package, Express API. Graph may look 2.5D; do not claim WebGL/3D if it isn't.
- Query GitHub's public REST repo metadata and Git tree; determine default branch, fetch at most 60 TS/JS files up to 100KB each (or a total 1MB). Follow only `github.com`, `api.github.com`, or `raw.githubusercontent.com` HTTPS; validate owner/repo with allowlisted characters. Timeouts, concurrency max 4, caching 5 minutes, handle API rate-limit.
- Parse actual relative import specifiers with TypeScript source parser (`ts.preProcessFile` or static AST), resolve local target paths only. Each graph edge MUST correspond to an observed import. No fake dependencies.
- If GitHub unavailable, allow explicit labelled `EXAMPLE FIXTURE` with a small included mini-repo source fixture.

## P0 happy path
1. Paste a GitHub public repository URL into top input and press 'Map repository'.
2. Render interactive force/level graph: source modules as bright nodes and import links as directional edges; pan/zoom, hover highlights, click displays exact file path and imports.
3. Top badges show real file count, edge count, selected source. Subtle moving lines or star particles; keep frame rate sane with 60 nodes.
4. A `Load sample` action uses a clearly named real fixture. Proper loading/errors and rate-limit state.

## Must prove
- Unit test fixture: `a.ts` imports `./b`; exactly one resolved edge, no edge for a non-existent file.
- E2E: click sample, graph appears; click module -> exact path and import names visible; negative test invalid GitHub URL rejected.
- `tests/demo.spec.ts` records loading the fixture and navigating actual graph and screenshot/video.
- README explicitly says only TS/JS static relative imports in MVP; GitHub API may be rate limited.

## X demo narrative
0–2s: paste URL; 2–7s: starfield explodes into repo map; 7–16s: hover module and all dependencies light up; 16–23s: source paths displayed. Tagline 'A GitHub repo, as a galaxy.'


Execute within this directory only. Run npm install, implement, then build/test/e2e/demo. Preserve real logs and status.json.

This is an authorized independent sprint execution. Start implementing now, no confirmation. Do not spawn subagents. All writes limited to this app directory; use npm install --cache .npm-cache and keep .npm-cache ignored. Existing Playwright browsers may be read from ~/Library/Caches/ms-playwright; if install required use PLAYWRIGHT_BROWSERS_PATH inside this project. Install dependencies, replace starter tests with meaningful behavior tests, run build/test/e2e/demo and preserve actual logs, screenshot and video. Do not read user credentials or other project data. Missing model keys: runnable clearly labelled fixture and PARTIAL status. Add LICENSE. Verify and finish, not merely plan.
