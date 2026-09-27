# Introduction to UAICP

UAICP is the **Universal Agentic Interoperability Control Protocol**.

UAICP defines a reliability contract for agentic workflows so systems are:

- evidence-gated
- verification-driven
- policy-controlled
- auditable

UAICP is framework-neutral and model-neutral.

## What UAICP Is

- a protocol contract for reliable orchestration
- schemas for envelope, evidence, and verification outputs
- conformance expectations for runtime behavior
- a decoupled reliability layer that sits under existing frameworks

## What UAICP Is Not

- a replacement for existing agent frameworks
- a model provider
- a promise of autonomous correctness without verification

## Operational Risk Coverage

UAICP defines requirements for protected workflow paths:

- required evidence before delivery
- explicit verification results and uncertainty reasons
- policy and approval checks before high-risk writes
- attributable execution records

Implementations must enforce these requirements at the actual execution boundary. Agent-provided metadata alone cannot establish identity, approval, or authority.

## Core Reliability Outcome

A conforming runtime delivers when required evidence and verifier checks pass. When they do not, it returns explicit uncertainty and applies the specified fail-safe behavior.

Verification establishes what the configured checks demonstrate. It does not guarantee factual correctness, prevent bypass through unmediated tools, or reverse completed side effects.
