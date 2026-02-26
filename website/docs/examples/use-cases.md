# Use Cases

UAICP is designed for workflows where incorrect delivery or uncontrolled writes are high impact.

## Primary Use Cases

- regulated finance operations with high-risk write actions
- compliance-sensitive data operations requiring replayable audit traces
- enterprise agent workflows that must fail safe under uncertainty

## Complete Walkthrough: Finance Workflow Comparison

Use this full comparison for practical onboarding:

- [Finance Workflow Comparison](./finance-workflow-comparison.md)

It shows the same workflow implemented as:

1. manual workflow
2. framework-level agentic workflow
3. agent implementation without UAICP gates
4. agent implementation with UAICP gates

## Source Code Link

Reference implementation source:

- [workflow-comparison.ts](https://github.com/UAICP/uaicp-reference-impl/blob/main/src/examples/finance/workflow-comparison.ts)
