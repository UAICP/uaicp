# Contributing to UAICP Reference Implementation

## Scope

This repository hosts reusable runtime primitives for the UAICP contract.

Protocol-level behavior changes must be coordinated in:
- [specification/](https://github.com/UAICP/uaicp/tree/main/specification)

## Workflow

1. Open an issue.
2. Link the issue in your PR.
3. Include tests for behavior changes.
4. Document compatibility impact.

## Local Validation

```bash
npm ci
npm run lint
npm test -- --runInBand
npm run build
npm run example:finance
```

## Definition of Done

- CI checks pass
- Tests updated where required
- PR includes clear validation notes

## Local Private Notes

Use `.private/` for local-only working notes. Only `.private/.gitkeep` is tracked.
