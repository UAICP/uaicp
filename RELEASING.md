# Releasing UAICP Packages

This runbook is the source of truth for publishing UAICP packages to npm, PyPI, and crates.io.

## Scope

Packages released from this monorepo:

- npm: `@uaicp/core`, `@uaicp/adapter-langgraph`, `@uaicp/uaicp-reference-impl`, `@uaicp/uaicp_specification`
- PyPI: `uaicp-core`, `uaicp-adapter-autogen`
- crates.io: `uaicp-core`, `uaicp-adapter-rig`

## Prerequisites

1. Bump versions in manifests first.
2. Ensure git is clean and `main` is pushed.
3. Ensure `/Users/rishirandhawa/projects/uaicp/uaicp/.env.publish` contains:
   - `NPM_TOKEN`
   - `TWINE_USERNAME`
   - `TWINE_PASSWORD`
   - `CARGO_REGISTRY_TOKEN`
4. Never commit `.env.publish` or any secrets.

## Load Credentials (Always Use Absolute Path)

```bash
cd /Users/rishirandhawa/projects/uaicp/uaicp
set -a
source /Users/rishirandhawa/projects/uaicp/uaicp/.env.publish
set +a
```

Do not rely on `source .env.publish` from subdirectories.

## Preflight Checks

```bash
git status --short
npm whoami --//registry.npmjs.org/:_authToken="$NPM_TOKEN"
python3 -m twine --version
cargo login --help >/dev/null
```

## Publish Order

Publish in this order to satisfy dependencies:

1. npm `@uaicp/core`
2. npm `@uaicp/adapter-langgraph`
3. PyPI `uaicp-core`
4. PyPI `uaicp-adapter-autogen`
5. crates `uaicp-core`
6. crates `uaicp-adapter-rig`
7. npm `@uaicp/uaicp-reference-impl`
8. npm `@uaicp/uaicp_specification`

### npm

Use explicit token on every command. This avoids failures caused by stale global npm auth config.

```bash
cd /Users/rishirandhawa/projects/uaicp/uaicp/libs/typescript/core
npm publish --access public --//registry.npmjs.org/:_authToken="$NPM_TOKEN"

cd /Users/rishirandhawa/projects/uaicp/uaicp/libs/typescript/adapter-langgraph
npm publish --access public --//registry.npmjs.org/:_authToken="$NPM_TOKEN"

cd /Users/rishirandhawa/projects/uaicp/uaicp/reference-impl
npm publish --access public --//registry.npmjs.org/:_authToken="$NPM_TOKEN"

cd /Users/rishirandhawa/projects/uaicp/uaicp/specification
npm publish --access public --//registry.npmjs.org/:_authToken="$NPM_TOKEN"
```

### PyPI

```bash
cd /Users/rishirandhawa/projects/uaicp/uaicp/libs/python/core
python3 -m build
python3 -m twine upload --non-interactive -u "$TWINE_USERNAME" -p "$TWINE_PASSWORD" dist/*

cd /Users/rishirandhawa/projects/uaicp/uaicp/libs/python/adapter-autogen
python3 -m build
python3 -m twine upload --non-interactive -u "$TWINE_USERNAME" -p "$TWINE_PASSWORD" dist/*
```

### crates.io

```bash
cd /Users/rishirandhawa/projects/uaicp/uaicp/libs/rust/core
cargo publish --token "$CARGO_REGISTRY_TOKEN"

cd /Users/rishirandhawa/projects/uaicp/uaicp/libs/rust/adapter-rig
cargo publish --token "$CARGO_REGISTRY_TOKEN"
```

## Post-Release Verification

### npm (authoritative)

```bash
npm dist-tag ls @uaicp/core --//registry.npmjs.org/:_authToken="$NPM_TOKEN"
npm dist-tag ls @uaicp/adapter-langgraph --//registry.npmjs.org/:_authToken="$NPM_TOKEN"
npm dist-tag ls @uaicp/uaicp-reference-impl --//registry.npmjs.org/:_authToken="$NPM_TOKEN"
npm dist-tag ls @uaicp/uaicp_specification --//registry.npmjs.org/:_authToken="$NPM_TOKEN"
```

### PyPI

```bash
curl -s https://pypi.org/pypi/uaicp-core/json | jq -r '.releases | has("0.3.1")'
curl -s https://pypi.org/pypi/uaicp-adapter-autogen/json | jq -r '.releases | has("0.3.1")'
```

### crates.io

```bash
curl -s https://crates.io/api/v1/crates/uaicp-core | jq -r '.crate.max_version'
curl -s https://crates.io/api/v1/crates/uaicp-adapter-rig | jq -r '.crate.max_version'
```

## Known Failure Modes

1. `npm whoami` or `npm view` says token expired even after setting `NPM_TOKEN`.
   - Cause: stale global npm auth config.
   - Fix: always pass `--//registry.npmjs.org/:_authToken="$NPM_TOKEN"` per npm command.
2. `source .env.publish` fails.
   - Cause: command run outside repo root.
   - Fix: source the absolute path `/Users/rishirandhawa/projects/uaicp/uaicp/.env.publish`.
3. npm package appears published but not visible immediately.
   - Check: `npm dist-tag ls <package> --//registry.npmjs.org/:_authToken="$NPM_TOKEN"`.
   - If needed, check visibility: `npm access get status <package> --//registry.npmjs.org/:_authToken="$NPM_TOKEN"`.
