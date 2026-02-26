# Adapter Matrix

| Framework | Contract Coverage | Implementation Depth | Primary Reference |
|---|---|---|---|
| LangGraph-style runtimes | Envelope, Evidence, Verify, Policy | Complete walkthrough + runnable fixture alignment | [LangGraph Adapter Example](./langgraph-adapter-example.md) |
| Microsoft Agent Framework style runtimes | Envelope, Evidence, Verify, Policy | Contract mapping guidance | [Adapter Contract](./adapter-contract.md) |
| AutoGen | Envelope, Evidence, Verify, Policy | Adapter skeleton and gate sequence | [AutoGen Adapter Example](./autogen-adapter-example.md) |
| CrewAI | Envelope, Evidence, Verify, Policy | Adapter skeleton and gate sequence | [CrewAI Adapter Example](./crewai-adapter-example.md) |
| OpenAI Agents SDK | Envelope, Evidence, Verify, Policy | Adapter skeleton and gate sequence | [OpenAI Agents SDK Adapter Example](./openai-agents-sdk-adapter-example.md) |

## Shared Verification Anchor

All entries above align to the same finance workflow comparison fixture:

- [workflow-comparison.ts](https://github.com/UAICP/uaicp-reference-impl/blob/main/src/examples/finance/workflow-comparison.ts)
