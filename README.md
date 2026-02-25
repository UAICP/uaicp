# UAICP Specification

UAICP stands for **Universal Agent Integrity & Control Protocol**.

UAICP is an open reliability contract for agentic workflow execution. It standardizes a control layer that forces systems to be **correct or explicitly uncertain**.

UAICP is an open-source contribution initiated by **Prismworks AI** ([prismworks.ai](https://prismworks.ai)) and developed with community contributions.

## What Is Complete

- baseline specification and invariant model
- schema contracts for envelope, evidence, and verification report
- compliance test categories
- adapter contract and framework integration guidance
- reference implementation primitives and finance workflow comparison

## What Is Tracked as Ongoing

Enhancements are tracked in roadmap/issues, not hidden in incomplete docs.

- roadmap tracker: https://github.com/UAICP/uaicp_specification/issues/16
- roadmap document: [PROJECT-ROADMAP.md](PROJECT-ROADMAP.md)
- implementation workstream map: [docs/specification/implementation-plan.md](docs/specification/implementation-plan.md)

Roadmap policy:

- status-based tracking (`complete`, `in_progress`, `planned`)
- no timeline/date commitments

## Why UAICP Is a Separate Layer

UAICP is intentionally decoupled from frameworks such as LangGraph, Microsoft Agent Framework style runtimes, AutoGen, CrewAI, and OpenAI Agents SDK.

Frameworks handle orchestration mechanics. UAICP handles deterministic reliability governance.

## How UAICP Integrates

1. map framework context into UAICP envelope
2. normalize runtime artifacts into evidence objects
3. run verifier checks
4. run policy gate checks before high-risk writes
5. deliver only when required gates pass

Start in:

- [docs/integration-guides/ADAPTER-CONTRACT.md](docs/integration-guides/ADAPTER-CONTRACT.md)
- [docs/integration-guides/LANGGRAPH-ADAPTER-EXAMPLE.md](docs/integration-guides/LANGGRAPH-ADAPTER-EXAMPLE.md)

## Repository Layout

- `docs/specification/` - protocol specification and rationale
- `docs/integration-guides/` - adapter contract and framework examples
- `docs/examples/` - workflow examples
- `schema/` - JSON schema contracts
- `tests/` - conformance test definitions

## License

- Code and repository artifacts: Apache-2.0
- Specification docs and schema content: CC BY 4.0
- Attribution details: see `NOTICE`
