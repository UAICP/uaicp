# UAICP product strategy

Canonical name: **Universal Agentic Interoperability Control Protocol (UAICP)**. Public description: **Open controls for agent reliability.** PrismWorks initiated the project; this is not a claim of independent standards-body certification. Earlier expanded names are superseded; package identifiers remain unchanged.

Effective: 2026-09-24. Active direction for new work. Implementation is tracked in the [plan](IMPLEMENTATION-PLAN.md); proposed additions are not shipped features.

## Purpose and boundary

**Open, vendor-neutral reliability contracts, conformance fixtures and reference libraries for agent workflows.**

Own protocol semantics and conformance through the existing governance process. Do not require Databridle, RabbitLock, VybeCode, a commercial subscription or PrismWorks identity. Enterprise enforcement, verified identity and credential isolation belong to implementing systems.

## Current repository evidence

Review of the local working tree, including pre-existing changes; source presence is not deployment evidence.

| Source | Observation |
| --- | --- |
| [specification/schema/message-envelope.schema.json](specification/schema/message-envelope.schema.json) | Baseline requires request_id, timestamp, identity owner/control class, lower-case workflow state and string outcome. |
| [libs/typescript/core/src/index.ts](libs/typescript/core/src/index.ts) | Native model uses upper-case states, different identity fields and object policy outcome; not directly baseline-compatible. |
| [libs/typescript/adapter-langgraph/src/index.ts](libs/typescript/adapter-langgraph/src/index.ts) | Adapter emits native envelopes; gate checks are simplified and rollback metadata is not authenticated authority. |
| [libs/python/core/src/uaicp_core/__init__.py](libs/python/core/src/uaicp_core/__init__.py) | Python core is a separate representation requiring parity review. |
| [libs/rust/core/src/lib.rs](libs/rust/core/src/lib.rs) | Rust core is a separate representation requiring parity review. |
| [reference-impl/src/invariant/evaluator.ts](reference-impl/src/invariant/evaluator.ts) | Reference invariant implementation exists; old plans still call it future work. |

Verification this review: Baseline conformance passed 12/12 checks; reference implementation passed 21 tests. These independently passing suites do not show native envelopes conform to baseline schemas or that real approvals are authenticated.

## Retain

Retain working behavior, user data, existing integrations, tests, licensing and independent use within the boundary above. Maintain existing support obligations. Preserve local changes from other work; this review does not release or deploy code.

## Remove or defer

- Remove stale implement-invariant-engine priority where code already exists.
- Remove implication that evidence presence, rollback metadata, self-asserted identity or passing a schema establishes secure authorization.
- Defer maturity-level certification, broad framework expansion and commercial-specific fields in the normative core.

## Modify

- Resolve native/baseline state, identity, required-field and outcome differences through an explicit versioned normalization/migration design, not silent loosening of schemas.
- Separate authorization decision from workflow outcome and verification result; maintain provenance and unknown states.
- Make TS/Python/Rust fixtures equivalent and reject missing authoritative identity instead of fabricating owner/control-class defaults.
- Keep website/specification documentation mirrors aligned and preserve Apache-2.0 code / CC BY 4.0 content licensing.

## Add

- Cross-language canonical positive/negative fixtures and native-to-baseline conformance tests.
- An optional enterprise-action evidence mapping example, with authenticated-approval responsibilities explicitly external.
- Version negotiation, migration guide, compatibility matrix and isolated optional Databridle example.

## Integration rules

This is the target integration design, not a claim of an existing Databridle adapter. Components communicate through versioned contracts and keep independent storage. No shared database, forced cloud account or mandatory all-product installation.

The host proposes work; Databridle decides protected enterprise actions; the credential provider enforces its own access conditions; the executor performs only the bound action. Local restrictions can deny but cannot widen an enterprise grant. Human software acceptance and credential approval remain distinct from exact-action security approval.

Carry tenant/principal/delegation/task/run/action identifiers, policy revision, exact request digest, expiry and decision/receipt references through authenticated adapters. Treat client-supplied identity and trace fields as untrusted until bound by the trusted host. Keep secrets and raw sensitive payloads out of default logs, prompts and project memory. Distinguish allow/deny from executed/failed/unknown and from independent verification.

Protected mode stops on missing authority or unavailable required controls; it cannot silently invoke an unprotected path. Retries need idempotency or reconciliation. Revocation of future access does not undo completed work or erase credentials already delivered. Record actual transport, version and bypass coverage before describing an integration as supported.

## Investment and success

Prioritize a supported, reusable protected workflow over feature breadth. Measure integration effort, correctly completed work, denied unauthorized operations, evidence completeness and ongoing maintenance. This component's role does not create a new license, transfer IP or approve a pricing/partnership claim.

Prior planning is preserved in a [historical snapshot](archive/2026-09-24-ecosystem-alignment/POSITIONING.md); it does not govern new investment.

## License and protocol governance

Existing licenses remain in force: Apache-2.0 for code; CC BY 4.0 for specification, schema and documentation content. Preserve notices and existing compatibility governance. Commercial priorities do not redefine protocol conformance. UAICP works independently of Databridle and other PrismWorks products.
