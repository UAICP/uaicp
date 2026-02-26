# Quick Start

## 1. Read the Contract

Start with the core specification:

- [Introduction](./introduction.md)
- [Core Specification](./specification.md)

## 2. Choose an Integration Path

Before implementing, review the integration model and adapter contract:

- [Integration Overview](../integration-guides/overview.md)
- [Adapter Contract](../integration-guides/adapter-contract.md)

## 3. Implement Envelope + Evidence

Adopt UAICP schemas in your orchestrator runtime:

- message envelope
- evidence object
- verification report

## 4. Wire Invariants

Before final output, enforce:

- required evidence exists
- required verification checks pass
- write policy gates are satisfied

## 5. Integrate an Adapter

Use an adapter pattern for your framework:

- LangGraph
- AutoGen
- CrewAI
- OpenAI Agents SDK

## 6. Run Conformance

Validate behavior against the reference fixture:

- [Finance Workflow Comparison](../examples/finance-workflow-comparison.md)
