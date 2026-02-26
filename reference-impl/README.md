# UAICP Reference Implementation

Reference implementation primitives for the UAICP reliability contract.

UAICP is an open-source contribution initiated by **Prismworks AI** ([prismworks.ai](https://prismworks.ai)) and developed with community contributions.

## Purpose

This repository provides concrete, composable building blocks and examples for enforcing UAICP controls under existing orchestration frameworks.

Protocol source of truth:

- [uaicp_specification](https://github.com/UAICP/uaicp_specification)

## Implemented Modules

- `src/identity`
  - schema contracts for identity and attestation
  - validator with strict/optional attestation modes
- `src/policy`
  - deterministic policy evaluator for `allow`, `deny`, `needs_review`
  - reason-coded decisions for runtime gating
- `src/examples/finance/workflow-comparison.ts`
  - side-by-side finance workflow comparison:
    - `manual`
    - `agentic`
    - `agent_without_uaicp`
    - `agent_with_uaicp`

## Finance Workflow Comparison

The included finance scenario models a high-risk write action (`reverse_wire_transfer`) and shows behavioral differences across implementation styles.

What it demonstrates:

- where unsafe approvals can happen without deterministic gates
- how explicit approval and evidence requirements change outcomes
- how UAICP identity/policy/evidence/verification gates control final delivery

Run it:

```bash
npm install
npm run example:finance
```

Run tests:

```bash
npm test
npm run build
```

## Roadmap Status

This repository uses status-based roadmap tracking, not timeline/date planning.

- complete
  - identity and attestation validation
  - policy evaluator
  - finance workflow comparison example
- in progress
  - richer verification report assembly primitives
  - audit event envelope helpers
- planned
  - framework-specific adapter walkthrough packages
  - conformance harness runner examples

Tracking:

- `ROADMAP.md`
- [Issues](https://github.com/UAICP/uaicp-reference-impl/issues)

## Local Private Notes

Use `.private/` for local-only notes or planning artifacts. Only `.private/.gitkeep` is tracked; all other files in `.private/` are ignored.

## License

Apache-2.0. See `NOTICE` for attribution.
