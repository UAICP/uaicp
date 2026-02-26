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

- LangGraph-style runtimes: use an explicit verify/policy node before terminal delivery.
- AutoGen: wrap task completion with verifier and policy gates.
- CrewAI: gate task completion and high-risk side effects with UAICP decisions.
- OpenAI Agents SDK: wrap run lifecycle events and block delivery on failed gates.

## Validation Expectation

Adapter behavior is valid when equivalent inputs produce equivalent gate outcomes (`allow`, `deny`, `needs_review`) as defined by UAICP contracts.

Reference fixture:

- [workflow-comparison.ts](https://github.com/UAICP/uaicp/blob/main/reference-impl/src/examples/finance/workflow-comparison.ts)
