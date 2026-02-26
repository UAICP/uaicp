# UAICP Core Specification (v0.2)

UAICP is a decoupled reliability layer that can be embedded under existing orchestration frameworks.

## Execution Model

UAICP requires this state flow:

1. `intake`
2. `plan`
3. `execute`
4. `verify`
5. `deliver`
6. `fail_safe`

## Mandatory Invariants

### Evidence gating

No `deliver` transition without required evidence objects.

### Verification gating

No `deliver` transition unless required verification checks pass.

### Policy-gated writes

Write actions must be classified and controlled by risk tier.

- `read_only`
- `write_low_risk`
- `write_high_risk`

High-risk writes require explicit approval metadata.

### Auditability

All transitions must include request and trace identifiers plus outcome metadata.

## Contracts

UAICP standardizes:

- envelope contract
- evidence contract
- verification report contract

Implementations can extend fields but cannot omit required base fields.

## Relationship to Frameworks

Frameworks such as LangGraph, Microsoft Agent Framework style runtimes, AutoGen, CrewAI, and OpenAI Agents SDK own orchestration behavior.

UAICP owns:

- reliability invariants
- evidence and verification contracts
- policy gate semantics
- conformance expectations

## Fail-Safe Rule

If invariants are unmet, outputs must be marked uncertain and unsafe actions must be blocked.
