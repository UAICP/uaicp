# Open Source and Enterprise Deployment

UAICP is an open-source initiative started by **Prismworks AI**. It provides portable evidence, verification, and policy contracts for agent workflows, with reference libraries and framework adapters.

## An independently usable protocol

Use UAICP with your own agent runtime, policy system, and execution environment. Implementing the protocol requires no Prismworks product or commercial subscription. The normative contract remains vendor-neutral; commercial integrations must preserve interoperability.

UAICP and MCP address complementary concerns. MCP connects agents and tools. UAICP defines reliability contracts around evidence, verification, and policy gates within the workflow.

## Prismworks and Databridle

[Prismworks](https://prismworks.ai) builds enterprise security for autonomous AI. Its flagship, [Databridle](https://prismworks.ai/products/databridle/), focuses on delegated agent authority, controls at the point of action, and evidence of execution outcomes.

Prismworks’ integration direction is to map UAICP evidence and verification contracts into Databridle’s enterprise authorization and operating model. This is a product integration direction, not a statement that every UAICP adapter already connects to Databridle.

Enterprise deployments must establish authenticated identity, exact-action approvals, credential and execution boundaries, policy administration, evidence handling, and operational support. The reference libraries are building blocks for those deployments; they do not establish those boundaries by installation alone.

## Contributions and licensing

Code is available under Apache-2.0; specification, schema, and documentation content is available under CC BY 4.0. Existing notices and attribution apply. Contributions follow the [governance process](overview.md) and [contribution guidance](contributing.md).

Protocol evolution is reviewed for compatibility and conformance. Product-specific extensions and commercial services remain separate from the core contract.
