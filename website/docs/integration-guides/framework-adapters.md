# Framework Adapters

UAICP uses one reliability contract pattern across multiple frameworks.

## Common Adapter Responsibilities

Every framework adapter must provide these control points:

- envelope mapping
- evidence normalization
- verifier invocation
- policy-gated write checks
- audit event emission

## LangGraph-Style Mapping

A LangGraph-style workflow typically maps as:

- graph state -> UAICP envelope
- node outputs -> evidence objects
- verification node -> verifier + policy gates
- terminal node -> `deliver` only when gates pass

See: [LangGraph Adapter Example](./langgraph-adapter-example.md).

## AutoGen / CrewAI / OpenAI Agents SDK Mapping

The same contract applies even when orchestration APIs differ:

- wrap tool execution events as evidence
- run explicit verify gate before final response
- enforce policy gate before any high-risk write
- return `fail_safe` with reason codes when gates fail

See examples:

- [AutoGen Adapter Example](./autogen-adapter-example.md)
- [CrewAI Adapter Example](./crewai-adapter-example.md)
- [OpenAI Agents SDK Adapter Example](./openai-agents-sdk-adapter-example.md)

## Practical Validation

An adapter is valid when it produces the same gate outcomes as the reference behavior for equivalent inputs.

Use this finance workflow comparison as a baseline fixture:

- [workflow-comparison.ts](https://github.com/UAICP/uaicp-reference-impl/blob/main/src/examples/finance/workflow-comparison.ts)
