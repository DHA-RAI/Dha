# Pin Node.js to v20.x for better-sqlite3 compatibility

## Changes Made
- Added Node version enforcement (preinstall script checks for Node 20)
- Set `engines.node` to `20.x` in package.json
- Added `.nvmrc` and `.node-version` for Node version managers
- Added GitHub Action to verify build with Node 20
- Added deployment notes and troubleshooting guide

## Why
The build was failing due to better-sqlite3 native addon compilation errors on Node 24:
- V8 API incompatibilities between Node 24 and better-sqlite3@9.6.0
- Pinning to Node 20 ensures native addons compile successfully
- Added CI verification to catch potential issues early

## Testing Done
- [x] Verified better-sqlite3 builds under Node 20
- [x] Added GitHub Action for automated verification
- [x] Documented Render deployment steps
- [x] Created rollback instructions

## Deployment Instructions
1. After merging, in Render dashboard:
   - Set Node runtime to 20.x
   - Or ensure Render reads `.nvmrc`/`.node-version`
2. Trigger a new deployment
3. Monitor build logs for successful native addon compilation

## Local Development
```bash
# Using nvm:
nvm use 20
npm install

# Or using npx:
npx --yes node@20 -e "require('child_process').spawnSync('npm',['install'],{stdio:'inherit'})"
```

## Reviewer Checklist
- [ ] Confirm Node version enforcement works (`npm install` fails on wrong Node version)
- [ ] Verify GitHub Action passes
- [ ] Review deployment documentation
- [ ] Check Render settings follow the guide

## Related Issues
- Fixes #XYZ (better-sqlite3 build failures)