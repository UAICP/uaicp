# Integration Overview

UAICP integrates as a reliability control layer under your existing orchestration runtime.

This website provides complete integration guidance for `v0.3` implementation.

## Polyglot Support

UAICP provides official adapters in three languages:

| Language | Framework | Package | Tests |
|----------|-----------|---------|-------|
| TypeScript | LangGraph | `@uaicp/adapter-langgraph` | 12 |
| Python | Microsoft AutoGen v0.4 | `uaicp-adapter-autogen` | 23 |
| Rust | Rig | `uaicp-adapter-rig` | 17 |

## Integration Target

You keep your existing framework for orchestration and tool execution.

UAICP adds deterministic gates for:

1. identity validation
2. evidence gating
3. verification gating
4. policy-gated write actions with **rollback safety**
5. **multi-agent swarm hierarchy tracking**
6. **secure read-only UX streaming**
7. replayable audit context

## Canonical Integration Flow

```text
framework request/context
  -> map to UAICP envelope (include parent_trace_id if swarm)
  -> flush UX partial streams safely (if applicable)
  -> execute tools and collect evidence objects
  -> run verifier checks (verifyGates)
  -> run policy gate (enforcePolicy - must include rollback_action for writes)
  -> deliver OR fail_safe (execute rollback)
```

## Visual Architecture References

For component and framework-level diagrams, see:

- [Architecture Diagrams](./architecture-diagrams)

## Quick Start

Choose your language:

### TypeScript

```bash
cd libs/typescript
npm install
npm test
```

### Python

```bash
cd libs/python
pip install -e core/ -e adapter-autogen/
pytest adapter-autogen/tests/
```

### Rust

```bash
cd libs/rust
cargo test --workspace
```

## Definition of Complete Adapter Integration

An adapter is complete when it can:

- map framework state to UAICP envelope fields, including `parent_trace_id` for nested swarms.
- enforce the `streamPartial` boundaries to ensure UI streaming works without exposing write operations.
- persist required evidence objects before delivery.
- block delivery on failed verification or missing evidence.
- enforce policy gate semantics on high-risk writes by enforcing `rollback_action`.
- emit reason-coded outcomes (`allow`, `deny`, `needs_review`).

## Implementation Locations

- [libs/typescript/](https://github.com/UAICP/uaicp/tree/main/libs/typescript)
- [libs/python/](https://github.com/UAICP/uaicp/tree/main/libs/python)
- [libs/rust/](https://github.com/UAICP/uaicp/tree/main/libs/rust)

## Contributor Links

Post-`v0.3` enhancements are tracked in:

- [UAICP Issues](https://github.com/UAICP/uaicp/issues)
