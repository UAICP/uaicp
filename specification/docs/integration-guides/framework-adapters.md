# Framework Adapters

UAICP uses one reliability contract pattern across multiple frameworks and languages.

## Polyglot Ecosystem

UAICP v0.3 provides official adapters in three languages:

| Language | Framework | Package | Tests |
|----------|-----------|---------|-------|
| TypeScript | LangGraph | `@uaicp/adapter-langgraph` | 12 |
| Python | Microsoft AutoGen v0.4 | `uaicp-adapter-autogen` | 23 |
| Rust | Rig | `uaicp-adapter-rig` | 17 |

For visual component architecture and per-framework flow diagrams, see:

- [Architecture Diagrams](./architecture-diagrams)

## Common Adapter Responsibilities

Every framework adapter must provide these control points:

- envelope mapping (including `parent_trace_id` for nested swarms)
- evidence normalization
- verifier invocation (`verify_gates`)
- policy-gated write checks (enforcing `rollback_action` structures)
- audit event emission
- UX streaming boundary enforcement (`streamPartial`)

## Language-Specific Implementation

### TypeScript / LangGraph

```typescript
import { UaicpAdapter } from '@uaicp/core';
import { LangGraphAdapter } from '@uaicp/adapter-langgraph';

const adapter = new LangGraphAdapter('agent-id');
const envelope = adapter.mapToEnvelope(graphState);
await adapter.verifyGates(envelope);
await adapter.enforcePolicy(envelope);
```

See: [LangGraph Adapter Example](./langgraph-adapter-example.md).

### Python / AutoGen

```python
from uaicp_core import UaicpAdapter, MessageEnvelope
from uaicp_adapter_autogen import AutoGenAdapter, AutoGenState

adapter = AutoGenAdapter(agent_id="agent-id")
envelope = adapter.map_to_envelope(AutoGenState(messages=[]))
await adapter.verify_gates(envelope)
await adapter.enforce_policy(envelope)
```

### Rust / Rig

```rust
use uaicp_core::UaicpAdapter;
use uaicp_adapter_rig::{RigAdapter, RigState};

let adapter = RigAdapter::new("agent-id".to_string(), "0.3.0");
let envelope = adapter.map_to_envelope(&state);
adapter.verify_gates(&envelope).await;
adapter.enforce_policy(&envelope).await;
```

## AutoGen / CrewAI / OpenAI Agents SDK Mapping

The same contract applies even when orchestration APIs differ:

- wrap tool execution events as evidence
- run explicit verify gate before final response
- enforce policy gate before any high-risk write, demanding `rollback_action` structures
- map hierarchy handoff events to nested envelopes using `parent_trace_id`
- return `fail_safe` with reason codes when gates fail

See examples:

- [AutoGen Adapter Example](./autogen-adapter-example.md)
- [CrewAI Adapter Example](./crewai-adapter-example.md)
- [OpenAI Agents SDK Adapter Example](./openai-agents-sdk-adapter-example.md)

## Implementation Locations

- [libs/typescript/](https://github.com/UAICP/uaicp/tree/main/libs/typescript)
- [libs/python/](https://github.com/UAICP/uaicp/tree/main/libs/python)
- [libs/rust/](https://github.com/UAICP/uaicp/tree/main/libs/rust)

## Practical Validation

An adapter is valid when it produces the same gate outcomes as the reference behavior for equivalent inputs.

Each adapter includes comprehensive test suites that validate:
- Swarm hierarchy tracking via `parent_trace_id`
- Evidence extraction from framework-specific message types
- Gate enforcement (verification + policy)
- Streaming normalization
- Rollback payload generation
