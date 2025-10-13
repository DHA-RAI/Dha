Render / Generic Deployment notes to avoid better-sqlite3 native build failures

Problem:
- The deployment log shows `better-sqlite3` failing to compile on Node 24 (v8 API changes). This repository expects Node 20.x for native add-ons compatibility.

Quick fix (apply ASAP):
1. Pin Node to 20 in the repository (done):
   - `package.json` engines: `"node": "20.x"`
   - Add `.nvmrc` / `.node-version` with `20`
   - Add `scripts/check-node-version.js` to fail early on wrong Node

2. For Render (or similar PaaS):
   - In Render dashboard > Service > Environment > Build & Start Commands, set Node version to 20 (or set the `NODE_VERSION` or `.node-version` if Render supports it).
   - If Render ignores `.nvmrc`, set the `Runtime` / `Node` version drop-down to `20.x`.

3. If builds still fail with `better-sqlite3` errors:
   - Try upgrading `better-sqlite3` to the latest v9 (already `^9.6.0`) and ensure build tools are present (gcc, make).
   - Alternatively use a pure-JS SQLite (like `sqlite3` or `@vlcn.io/wasm-sqlite`) if you can't change Node version.

Local dev:
- Use nvm to switch Node:

```bash
nvm install 20
nvm use 20
npm ci
npm run build
```

Troubleshooting checklist:
- If `node-gyp` fails, ensure build-essential is installed on the build VM and Python v3 is available.
- If `v8` API errors persist, confirm `better-sqlite3` version is compatible with Node 20; consider building an artifact locally and uploading a prebuilt binary.

Rollback:
- Revert `engines` changes and remove `.nvmrc` if you must revert to Node 24, then pin a compatible `better-sqlite3` version.

Contact:
- For persistent failing builds, capture full `npm-debug.log` or `/opt/render/.cache/_logs/*` and open an issue with more logs.
