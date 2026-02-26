# UAICP Monorepo

This repository contains:

- `specification/` - canonical protocol docs, schemas, and conformance assets
- `libs/` - official adapters and core libraries (TypeScript, Python, Rust)
- `reference-impl/` - informative reference implementation
- `website/` - Docusaurus docs site and governance pages

## Documentation Source of Truth

- Canonical technical docs live in `specification/docs/`.
- Website docs in `website/docs/{specification,integration-guides,examples}` are synced mirrors.
- Sync command: `cd website && npm run sync:docs`.
- Release runbook: `RELEASING.md`.
