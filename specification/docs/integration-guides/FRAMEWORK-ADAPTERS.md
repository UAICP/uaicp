# Framework Adapters

UAICP uses one reliability pattern across multiple frameworks.

## Shared Responsibilities

Every adapter must provide:

- envelope mapping
- evidence normalization
- verifier invocation
- policy-gated write checks
- audit event emission

## Framework Mapping Notes

- **LangGraph & Vercel AI SDK (Streaming Run-loops):** Map token streaming boundaries to `streamPartial` and wrap `is_final` triggers with the main verify/policy node before terminal delivery.
- **OpenAI Swarm & AutoGen (Multi-Agent Hierarchies):** Explicitly map the orchestrator's recursive calls into the `parent_trace_id` of the UaicpEnvelope. Wrap swarm handoff events and final task completion with verifier and policy gates.
- **CrewAI or Tool-Calling Agents:** Gate task completion and high-risk side effects with UAICP decisions. Enforce `rollback_action` structures on all high-risk writes.
- **Anthropic Computer Use:** Treat screenshot diff outputs or stdout logs as opaque Evidence payloads (with semantic hashes) to be graded by the Verification Gate.

## Validation Expectation

Adapter behavior is valid when equivalent inputs produce equivalent gate outcomes (`allow`, `deny`, `needs_review`) as defined by UAICP contracts.

Reference fixture:

- [workflow-comparison.ts](https://github.com/UAICP/uaicp/blob/main/reference-impl/src/examples/finance/workflow-comparison.ts)
