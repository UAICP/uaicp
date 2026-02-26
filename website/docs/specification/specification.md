# UAICP Specification (v0.3)

## 1. Purpose

UAICP defines a reliability contract for agentic workflow execution.

The contract ensures that systems either:

- complete actions with required evidence and verification, or
- fail safe with explicit uncertainty

UAICP is framework-neutral. It standardizes control semantics that can be embedded under existing orchestration frameworks.

## 2. Roles

- **Orchestrator**: deterministic runtime that owns state and transitions.
- **Model**: untrusted planner/summarizer constrained by schemas.
- **Tool**: deterministic side-effecting or read-only function returning evidence objects.
- **Verifier**: mechanical validator that emits structured verification results.

## 3. Data Flow

The required data flow defines how roles interact within the state machine:

1. **Model** generates a plan or tool calls based on the prompt.
2. **Orchestrator** captures the intent and invokes the requested **Tools**.
3. **Tools** execute and yield **Evidence** objects.
4. **Verifiers** consume the **Evidence** objects and evaluate them against required invariants, yielding **Verification Reports**.
5. **Orchestrator** evaluates the **Verification Reports** to gate the `deliver` transition.

## 3. Execution States

Required state machine phases:

1. `intake`
2. `plan`
3. `execute`
4. `verify`
5. `deliver`
6. `fail_safe`

### 4.1 Transition Rules

- `deliver` is forbidden unless all required invariants evaluate true.
- Any invariant failure in `execute` or `verify` must transition to `fail_safe`, **unless** a defined retry policy allows bounded repair.
- **Bounded Repair Loop**: If an invariant fails, the Orchestrator may transition from `verify` back to `plan` or `execute` to attempt repair, provided the retry count is bounded and logged.
- Valid final terminal states are only `deliver` or `fail_safe`.

### 4.2 Concurrency and Streaming

- Execution phases may run concurrently (e.g., executing multiple tools in parallel), but the state transitions remain synchronous.
- If an implementation supports UX streaming, partial `deliver` chunks may only be streamed if they are read-only and explicitly marked as unverified, or if the system implements partial verification streams. Final commitment to the `deliver` state must await full graph resolution.

## 5. Required Invariants

### 5.1 Evidence Gating

If task class requires evidence type `X` produced by a Tool, no deliverable may be produced without valid evidence objects of `X`.

### 5.2 Verification Gating

Required verifiers for task class must complete, evaluate the evidence, and report `pass` before `deliver`.

### 5.3 Policy-Gated Writes

Write operations must be categorized by a risk tier, which must be declared by the Tool definition and enforced by the Orchestrator.

- `read_only`: auto-allowed
- `write_low_risk`: allowed with policy checks
- `write_high_risk`: requires a cryptographically verifiable approval token (or explicitly traced human/system authority in the audit log) and rollback metadata.

### 5.4 Auditability

Every state transition and tool invocation must include:

- `request_id` (UUID format recommended)
- `trace_id` (W3C standard recommended)
- `timestamp` (ISO 8601 / RFC 3339 formatted)
- `actor identity` (Explicitly distinguishing between system identities, orchestration agents, and human users)
- `outcome`

## 6. Contracts

Normative schema set:

- `schema/message-envelope.schema.json`
- `schema/evidence-object.schema.json`
- `schema/verification-report.schema.json`

Implementations may extend schemas with namespaced fields but must not break required fields.

## 7. Fail-Safe Behavior

When invariants are unmet, systems must:

- mark response as `uncertain`
- include missing-evidence reason codes
- avoid unverified side effects

## 8. Conformance

A system is UAICP-conformant at baseline if it:

- implements required state phases
- enforces required invariants before deliver
- emits valid contract objects
- passes baseline checks in `tests/COMPLIANCE-TESTS.md`

## 9. Versioning

- major: breaking contract changes
- minor: backward-compatible contract extensions
- patch: clarifications and errata

## 10. Relationship to Framework Runtimes

UAICP is a decoupled governance layer, not an orchestration framework.

- Framework runtimes own graph/task execution and tool routing.
- UAICP owns invariant enforcement, evidence contracts, verification contracts, and policy gates.
- Implementations may use any model vendor and orchestration stack as long as UAICP conformance is preserved.

This separation is required for portability across enterprise environments with mixed tooling.
