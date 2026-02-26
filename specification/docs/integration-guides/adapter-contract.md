# Adapter Contract

Adapters connect framework-native runtime behavior to UAICP reliability controls.

## Required Adapter Interface

The v0.3 adapter interface is implemented consistently across TypeScript, Python, and Rust:

### TypeScript

```ts
interface UaicpAdapter<TState, TToolCall> {
  mapToEnvelope(state: TState): MessageEnvelope;
  normalizeEvidence(toolCall: TToolCall): EvidenceObject;
  verifyGates(envelope: MessageEnvelope): Promise<boolean>;
  enforcePolicy(envelope: MessageEnvelope): Promise<PolicyResult>;
  streamPartial?(chunk: unknown): UaicpStreaming | null;
  rollbackPayload?(envelope: MessageEnvelope): UaicpRollbackAction | null;
}
```

### Python

```python
class UaicpAdapter(Protocol[TState, TToolCall]):
    def map_to_envelope(self, state: TState) -> MessageEnvelope: ...
    def normalize_evidence(self, tool_call: TToolCall) -> EvidenceObject: ...
    async def verify_gates(self, envelope: MessageEnvelope) -> bool: ...
    async def enforce_policy(self, envelope: MessageEnvelope) -> PolicyResult: ...
    def stream_partial(self, chunk: Any) -> Optional[UaicpStreaming]: ...
    def rollback_payload(self, envelope: MessageEnvelope) -> Optional[UaicpRollbackAction]: ...
```

### Rust

```rust
#[async_trait]
pub trait UaicpAdapter: Send + Sync {
    type FrameworkState;
    type FrameworkToolCall;

    fn map_to_envelope(&self, state: &Self::FrameworkState) -> MessageEnvelope;
    fn normalize_evidence(&self, tool_call: &Self::FrameworkToolCall) -> EvidenceObject;
    async fn verify_gates(&self, envelope: &MessageEnvelope) -> bool;
    async fn enforce_policy(&self, envelope: &MessageEnvelope) -> PolicyResult;
    fn stream_partial(&self, chunk: &serde_json::Value) -> Option<UaicpStreaming>;
    fn rollback_payload(&self, envelope: &MessageEnvelope) -> Option<UaicpRollbackAction>;
}
```

## Required Gate Order

```text
mapToEnvelope -> normalizeEvidence -> verifyGates -> enforcePolicy -> deliver/fail_safe
```

No delivery should occur before required gates complete.

## Core Types

All adapters work with these core types:

- **MessageEnvelope** — the UAICP unit of accountability
- **EvidenceObject** — evidence produced by tool execution
- **PolicyResult** — outcome of policy gate evaluation
- **UaicpStreaming** — UX partial stream chunk
- **UaicpRollbackAction** — high-risk operation recovery plan

## Minimum Outcome Codes

- `EVIDENCE_MISSING`
- `VERIFICATION_FAILED`
- `POLICY_BLOCKED`
- `APPROVAL_REQUIRED`
- `IDENTITY_INVALID`
- `TOOL_TIMEOUT`

## Required High-Risk Write Rule

For high-risk write actions, when approval metadata or rollback metadata is absent:

- return `PolicyResult { allowed: false }`
- include reason `APPROVAL_REQUIRED` or `ROLLBACK_REQUIRED`
- block side effects

If `verifyGates` returns `false`, adapter policy enforcement must not return `allowed: true`.

## Reference Implementations

Official adapters with comprehensive tests:

- [libs/typescript/](https://github.com/UAICP/uaicp/tree/main/libs/typescript) — 12 tests
- [libs/python/adapter-autogen/](https://github.com/UAICP/uaicp/tree/main/libs/python/adapter-autogen) — 23 tests
- [libs/rust/adapter-rig/](https://github.com/UAICP/uaicp/tree/main/libs/rust/adapter-rig) — 17 tests
