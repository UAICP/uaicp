# UAICP

## PrismWorks ecosystem role — September 2026

Open, vendor-neutral reliability contracts, conformance fixtures and reference libraries for agent workflows. See the [current strategy](POSITIONING.md) and [implementation plan](IMPLEMENTATION-PLAN.md) for source evidence, boundaries and remove/modify/add work. Databridle integration is planned unless a versioned passing report establishes otherwise. These documents supersede older expansion and maturity claims below; existing setup/API instructions remain reference material.


**UAICP (Universal Agentic Interoperability Control Protocol)** is an open reliability contract for AI agent workflows.

[![Protocol](https://img.shields.io/badge/protocol-v0.3-1f6feb)](https://uaicp.org/docs/specification)
[![Latest Release](https://img.shields.io/github/v/release/UAICP/uaicp?sort=semver)](https://github.com/UAICP/uaicp/releases)
[![Docs](https://img.shields.io/badge/docs-uaicp.org-1a7f37)](https://uaicp.org)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](LICENSE)

UAICP gives orchestration runtimes deterministic controls for:

- evidence-gated delivery
- policy-gated high-risk writes
- rollback requirements for risky operations
- verifier checks before finalization
- traceable multi-agent hierarchy via `parent_trace_id`

UAICP is an open-source initiative started by **Prismworks AI**, with community contributions. The protocol remains vendor-neutral and can be implemented independently of Prismworks products.

## Current Status

- Protocol contract: `v0.3`
- Local package line: `0.3.1`; public registry publication was not reverified in this review
- Official adapter suites: TypeScript, Python, and Rust; see the [validation status](website/docs/governance/status-roadmap.md) for reproducible checks.
- Website: https://uaicp.org

## Package coordinates

| Ecosystem | Package | Documented version |
|---|---|---|
| npm | [`@uaicp/core`](https://www.npmjs.com/package/@uaicp/core) | `0.3.1` |
| npm | [`@uaicp/adapter-langgraph`](https://www.npmjs.com/package/@uaicp/adapter-langgraph) | `0.3.1` |
| npm | [`@uaicp/uaicp-reference-impl`](https://www.npmjs.com/package/@uaicp/uaicp-reference-impl) | `0.3.1` |
| npm | [`@uaicp/uaicp_specification`](https://www.npmjs.com/package/@uaicp/uaicp_specification) | `0.3.1` |
| PyPI | [`uaicp-core`](https://pypi.org/project/uaicp-core/) | `0.3.1` |
| PyPI | [`uaicp-adapter-autogen`](https://pypi.org/project/uaicp-adapter-autogen/) | `0.3.1` |
| crates.io | [`uaicp-core`](https://crates.io/crates/uaicp-core) | `0.3.1` |
| crates.io | [`uaicp-adapter-rig`](https://crates.io/crates/uaicp-adapter-rig) | `0.3.1` |

## Quick Start

### 1) Read the Contract

- Specification intro: https://uaicp.org/docs/specification/introduction
- Core spec: https://uaicp.org/docs/specification
- Adapter contract: https://uaicp.org/docs/integration-guides/adapter-contract

### 2) Install by Ecosystem

```bash
# TypeScript
npm install @uaicp/core @uaicp/adapter-langgraph

# Python
pip install uaicp-core uaicp-adapter-autogen

# Rust
cargo add uaicp-core uaicp-adapter-rig
```

### 3) Validate Behavior

- Conformance assets: [`specification/tests/`](specification/tests/)
- Finance workflow example: [`reference-impl/src/examples/finance/workflow-comparison.ts`](reference-impl/src/examples/finance/workflow-comparison.ts)

## Repository Structure

- [`specification/`](specification/) - canonical protocol docs, schemas, and conformance assets
- [`libs/`](libs/) - official adapters and core packages (TypeScript, Python, Rust)
- [`reference-impl/`](reference-impl/) - reference primitives and workflow comparison
- [`website/`](website/) - Docusaurus documentation site
- [`RELEASING.md`](RELEASING.md) - release runbook for npm/PyPI/crates

## Relationship to Prismworks and Databridle

UAICP defines portable evidence, verification, and policy contracts. Databridle is Prismworks’ commercial enterprise agent-security product, focused on delegated authority, action enforcement, and operational evidence. Prismworks’ integration direction is to map UAICP contracts into Databridle while keeping the protocol independently usable.

UAICP adoption requires no Databridle subscription. The protocol and reference libraries do not themselves supply an enterprise enforcement perimeter, credential isolation, or a hosted control plane. Conformance depends on the implementation and protected execution paths.

See [project positioning](POSITIONING.md) and the [open-source and commercial boundary](website/docs/governance/ecosystem.md).

For integration planning, review the [validation scope and envelope mapping work](website/docs/governance/status-roadmap.md#next-release-priorities). Adapter unit tests do not establish direct wire compatibility with the baseline JSON schemas.

## Documentation Source of Truth

- Canonical docs live in `specification/docs/`
- Website mirrors live in `website/docs/{specification,integration-guides,examples}`
- Sync command:

```bash
cd website
npm run sync:docs
```

## Governance and Contribution

- Governance overview: https://uaicp.org/docs/governance/overview
- Release status and roadmap: https://uaicp.org/docs/governance/status-roadmap
- Issues: https://github.com/UAICP/uaicp/issues
- Discussions: https://github.com/UAICP/uaicp/discussions

## Security

- [`specification/SECURITY.md`](specification/SECURITY.md)
- [`reference-impl/SECURITY.md`](reference-impl/SECURITY.md)
- [`website/SECURITY.md`](website/SECURITY.md)

## License

- Repository code/assets: Apache-2.0
- Specification, schema, and docs content: CC BY 4.0
- Attribution details: [`NOTICE`](NOTICE) and [`LICENSE-CONTENT.md`](LICENSE-CONTENT.md)
