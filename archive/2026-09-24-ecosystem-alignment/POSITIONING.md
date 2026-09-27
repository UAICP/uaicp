# Historical planning snapshot

Archived 2026-09-24. Superseded for new investment by the current strategy and implementation plan. Retained for prior requirements and implementation history; claims and estimates below are not revalidated.

# UAICP positioning

Canonical name: **Universal Agentic Interoperability Control Protocol (UAICP)**.

Public description: **Open controls for agent reliability.**

UAICP defines a vendor-neutral reliability contract for AI agent workflows: evidence objects, verification results, policy gates, and traceable execution. Core libraries and reference adapters help implement that contract within agent runtimes.

## Project identity

Prismworks AI initiated UAICP as an open-source contribution. The project welcomes community participation under its published contribution and governance process. This attribution does not imply an independent standards body, universal adoption, or certification by a third party.

Use the canonical name in new documentation, package descriptions, and website assets. Earlier “Universal Agent Integrity & Control Protocol” and “Universal AI Communication Protocol” names are superseded. Package names, API identifiers, protocol versions, and published artifacts are unchanged by this editorial alignment.

## Ecosystem role

- UAICP: portable contracts, conformance expectations, reference primitives, and adapters.
- MCP: connectivity between agents and tools; UAICP can complement that connectivity with reliability controls.
- Databridle: Prismworks’ commercial product direction for enterprise authorization, enforcement, and operational evidence.
- Customer runtimes and tools: perform the work through explicit execution boundaries.

Databridle integration is an implementation workstream, not a claim that a deployed integration already exists. UAICP remains usable with other platforms and without a commercial subscription. Keep vendor-specific configuration and commercial features outside the normative protocol contract.

## Claims and scope

Describe concrete controls and supported adapters. Distinguish reference code, guidance, conformance checks, and deployed integrations. An approval metadata field is not proof of authenticated approval; enterprise implementations must validate the approver, request binding, expiry, and replay behavior. Passing verifier checks is evidence of the checks performed, not a guarantee of factual correctness or prevention of every harmful action.

The protocol does not replace identity systems, credential isolation, network enforcement, or the customer’s execution perimeter. State which paths are mediated and what happens when context, evidence, or downstream results are missing.

## Licensing and maintenance

Existing licenses remain in force: Apache-2.0 for code; CC BY 4.0 for specification, schema, and documentation content. Preserve notices. Protocol changes follow the existing compatibility and conformance process. Commercial priorities do not redefine protocol conformance.
