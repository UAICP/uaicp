# UAICP Reference Implementation Roadmap

> Current priority: [monorepo implementation plan](../IMPLEMENTATION-PLAN.md). Normalize baseline/native schemas and verify cross-language fixtures before expanding adapters. Existing completion entries refer to local primitives, not a deployed protected integration.

This roadmap is status-based and issue-driven. It does not use timeline/date commitments.

## Complete

- identity and attestation validation (`src/identity`)
- policy evaluation baseline (`src/policy`)
- finance workflow comparison example with four implementations:
  - manual
  - agentic
  - agent without UAICP
  - agent with UAICP
- invariant evaluation engine (`src/invariant`)

## In Progress

- verification report assembly helpers
- audit event envelope helpers

## Planned

- framework adapter walkthroughs with runnable fixtures
- conformance harness runner examples
- additional finance and regulated-domain workflow fixtures

## Tracking

Roadmap execution is tracked in repository issues:

- https://github.com/UAICP/uaicp/issues
