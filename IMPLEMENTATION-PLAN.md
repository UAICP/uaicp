# UAICP implementation plan

Effective: 2026-09-27. Source-review evidence below retains its original review date, 2026-09-24. Status: planned integration work, not a completed release. Governed by [product strategy](POSITIONING.md). Owner: component maintainer; cross-product authorization changes also require review by the Databridle security owner. These are accountable roles, not assumed hires.

## Authority ecosystem alignment — 2026-09-27

PrismWorks builds authority infrastructure for autonomous AI. Databridle's first commercial package is delegated financial operations in existing ERP/payment environments. Its core object is a business mandate with authenticated delegation rights, trusted purpose/business objects, attenuated child grants, shared limits, expiry and revocation. Engineering/IT and security response expand the same core after the initial package is repeatable. This direction supersedes engineering-first or security-platform positioning in earlier planning.

**UAICP's boundary:** Portable reliability/evidence contracts and independent conformance. Databridle authority references are optional evidence bindings, not UAICP-issued authority.

**Required implementation change:** Map mandate/grant/reservation/decision/execution references without inventing verified identity or equating authorization with completion; preserve uncertain outcomes and schema compatibility. Publish optional financial-workflow fixtures only after the adapter passes; core conformance must run without Databridle.

Carry mandate/root/parent/grant and current-authority revision through a versioned adapter, with exact request digest and reservation reference when applicable. Databridle's runtime Authority Graph and transactional reservation ledger are authoritative; no accelerator keeps a competing writable copy. Workflow/evidence dependencies do not grant authority. Child grants cannot multiply aggregate limits or silently combine permissions.

**Acceptance before claiming integration:** issuer has the right to delegate; changed beneficiary/resource/request rejected; cross-tenant references rejected; concurrent descendants cannot overrun a shared root limit; accepted-but-timed-out writes remain unknown and reserved until reconciled; revoked/stale authority cannot authorize the next protected use. Apply each check at the component's advertised boundary and use explicit substitution fixtures for responsibilities owned elsewhere. No real financial transaction is required.

**Scope removed or deferred:** independent enterprise authority platform, graph administration/federation ahead of runtime correctness, and any mandatory all-accelerator installation. Preserve existing useful behavior, licenses, ownership and independent use. These are planned adapter requirements, not a claim of deployed capabilities. Existing remediation and migration checks below remain prerequisites.

## Baseline

Baseline conformance passed 12/12 checks; reference implementation passed 21 tests. These independently passing suites do not show native envelopes conform to baseline schemas or that real approvals are authenticated. Existing code and user changes are preserved. New checks below are required acceptance work, not claims that those checks already pass.

## Ordered backlog

| ID | Priority | Change | Deliverable | Dependency | Acceptance evidence |
| --- | --- | --- | --- | --- | --- |
| UA-01 | P0 | Modify | Specify native/baseline normalization and version migration. | Existing schema + core/adapter implementations. | Review all required fields/states/outcomes; invalid or absent security context rejected, no invented authority. |
| UA-02 | P0 | Add | Run one fixture corpus across TS/Python/Rust and baseline validators. | Mapping decision. | Every advertised adapter emits or normalizes to the stated schema; negative fixtures demonstrate rejection. |
| UA-03 | P1 | Modify | Separate skeleton reference gates from enforcing adapters and authenticated approvals. | Capability/evidence semantics. | Docs and examples show limits; no allow verdict becomes execution success. |
| UA-04 | P1 | Add | Publish optional enterprise workflow example and standalone conformance release. | Databridle G1/G2 for that optional example only. | Core tests run with no proprietary service; contributor governance and licensing unchanged. |
| UA-05 | P2 | Defer | Additional frameworks and maturity/certification schemes. | Complete baseline interoperability first. | Each adapter has an owner and real versioned fixtures. |

P0 establishes correctness and scope; P1 completes a supported integration; P2 is conditional expansion. Work may run concurrently once interface dependencies are agreed. No calendar duration or production availability is implied.

## Contract acceptance

- Pin supported component, profile and transport versions; reject unsupported security semantics.
- Verify tenant/principal/resource binding, changed arguments, expiry, replay, revocation, retries and missing context on every advertised protected path.
- Keep authorization verdict, execution result and independent verification distinct; interrupted or unobserved effects remain unknown.
- Keep credentials out of prompts/logs/general memory; test redaction and controlled evidence access.
- Demonstrate independent use and supported replacement components; fail closed in protected mode when required controls are unavailable.

## Migration and removal

Before executable code removal, inventory consumers and stored data; add replacement/version migration and compatibility tests; communicate deprecation; ship export/restore and rollback instructions. Do not delete historical evidence, encrypted secrets or user data as documentation cleanup. No published package/API identifier or license changes without a separate compatibility and ownership decision.

## Release definition

Record exact commit/version, supported paths, test commands/results, known limits, installer/upgrade steps and accountable maintainer. Mock tests and schema checks are not production security evidence. Update README and compatibility documentation from the passing report, not from planned checkboxes. No universal integrated/production-ready claim until the relevant execution path passes the complete acceptance matrix.

## Dependency gate reference

G1 freezes proposed profile 0.2 and mandate/grant/reservation fixtures. G2 implements the mandate, shared-limit, execution/reconciliation and revocation path. G3 connects an existing financial host; VybeCode is optional engineering expansion. G4 validates RabbitLock credential delivery. G5 proves interoperability and replacement hosts/providers. G6 packages a supported release. References to these gates are dependencies, not claims of completion; standalone open-source use remains independent.
