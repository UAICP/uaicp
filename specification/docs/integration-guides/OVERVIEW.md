# Integration Overview

UAICP integrates as a reliability control layer under your existing orchestration runtime.

This website provides complete integration guidance for `v0.3` implementation.

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
  -> run verifier checks
  -> run policy gate (must include rollback_action for writes)
  -> deliver OR fail_safe (execute rollback)
```

## Visual Architecture References

For component and framework-level diagrams, see:

- [Architecture Diagrams](./architecture-diagrams)

## Reference Implementation Link

Use the concrete finance comparison implementation:

- source: [workflow-comparison.ts](https://github.com/UAICP/uaicp/blob/main/reference-impl/src/examples/finance/workflow-comparison.ts)
- runner: [run-comparison.ts](https://github.com/UAICP/uaicp/blob/main/reference-impl/src/examples/finance/run-comparison.ts)

Run locally:

```bash
cd reference-impl/
npm install
npm run example:finance
```

## Definition of Complete Adapter Integration

An adapter is complete when it can:

- map framework state to UAICP envelope fields, including `parent_trace_id` for nested swarms.
- enforce the `streamPartial` boundaries to ensure UI streaming works without exposing write operations.
- persist required evidence objects before delivery.
- block delivery on failed verification or missing evidence.
- enforce policy gate semantics on high-risk writes by enforcing `rollback_action`.
- emit reason-coded outcomes (`allow`, `deny`, `needs_review`).

## Contributor Links

Post-`v0.3` enhancements are tracked in:

- [UAICP Issues](https://github.com/UAICP/uaicp/issues)
