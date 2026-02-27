---
slug: introducing-uaicp-reliability-contract
title: "UAICP v0.3 Is Live: Reliability Contract for Agentic Workflows"
authors: [uaicp_team]
tags: [uaicp, reliability, verification, orchestration, agents]
description: UAICP defines an open reliability contract for agentic workflows, with published adapters and core packages across TypeScript, Python, and Rust.
image: /img/uaicp-social-card.png
---

Agentic systems are moving from conversational assistance to autonomous workflow execution where model outputs can trigger real-world side effects.

This creates a critical gap: while models are probabilistic, **production workflows demand deterministic control**.

UAICP addresses this gap by defining standard reliability controls that are enforceable in runtime code, regardless of orchestration framework.

<!-- truncate -->

## Why UAICP Matters

Prompting an LLM to "use tools carefully" is not a safety mechanism. Frameworks like AutoGen, CrewAI, LangGraph, and the OpenAI Agents SDK are powerful orchestrators, but production reliability requires explicit gating semantics.

Common failure modes include:
- skipped tool calls or stale context assumptions
- responses delivered without concrete evidence
- unverified high-risk writes to production systems
- no replayable audit trail showing how decisions were made

**UAICP standardizes the minimum contract required for trustworthy execution.**

## Core Reliability Capabilities

UAICP enforces:
- **Deterministic state transitions:** `INTAKE -> PLANNING -> EXECUTING -> VERIFICATION -> DELIVERY`
- **Evidence-gated delivery:** outputs cannot be delivered without required evidence
- **Verifier checks before delivery:** required checks must pass before finalization
- **Policy-gated writes:** high-risk writes require explicit policy clearance and rollback coverage

## What Ships Today

Protocol version:
- `v0.3` contract, including `parent_trace_id`, safe partial streaming boundaries, and `rollback_action` requirements for `write_high_risk`.

Published packages (latest patch release `0.3.1`, published February 26, 2026):
- TypeScript: `@uaicp/core`, `@uaicp/adapter-langgraph`
- Python: `uaicp-core`, `uaicp-adapter-autogen`
- Rust: `uaicp-core`, `uaicp-adapter-rig`

Adapter validation:
- 52 passing adapter tests across TypeScript, Python, and Rust implementations.

## What UAICP is Not

UAICP is **not** another execution framework. It is a protocol contract and implementation pattern designed to sit under your existing orchestrators.

## Implementation Path

To start implementation:

- Read the [Core Specification](/docs/specification/introduction)
- Follow the [Integration Overview](/docs/integration-guides/overview)
- Implement the [Adapter Contract](/docs/integration-guides/adapter-contract)
- Review the [Finance Workflow Example](/docs/examples/finance-workflow-comparison)

## Get Involved

- Repository: https://github.com/UAICP/uaicp
- Roadmaps: [v0.4](/docs/governance/v0.4-roadmap), [v0.5](/docs/governance/v0.5-roadmap)
