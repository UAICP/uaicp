# UAICP Workstream Map

This document maps active workstreams and acceptance criteria. It is status-based and has no date/timeline commitments.

## Authority ecosystem alignment — 2026-09-27

PrismWorks builds authority infrastructure for autonomous AI. Databridle's first commercial package is delegated financial operations in existing ERP/payment environments. Its core object is a business mandate with authenticated delegation rights, trusted purpose/business objects, attenuated child grants, shared limits, expiry and revocation. Engineering/IT and security response expand the same core after the initial package is repeatable. This direction supersedes engineering-first or security-platform positioning in earlier planning.

**UAICP's boundary:** Portable reliability/evidence contracts and independent conformance. Databridle authority references are optional evidence bindings, not UAICP-issued authority.

**Required implementation change:** Map mandate/grant/reservation/decision/execution references without inventing verified identity or equating authorization with completion; preserve uncertain outcomes and schema compatibility. Publish optional financial-workflow fixtures only after the adapter passes; core conformance must run without Databridle.

Carry mandate/root/parent/grant and current-authority revision through a versioned adapter, with exact request digest and reservation reference when applicable. Databridle's runtime Authority Graph and transactional reservation ledger are authoritative; no accelerator keeps a competing writable copy. Workflow/evidence dependencies do not grant authority. Child grants cannot multiply aggregate limits or silently combine permissions.

**Acceptance before claiming integration:** issuer has the right to delegate; changed beneficiary/resource/request rejected; cross-tenant references rejected; concurrent descendants cannot overrun a shared root limit; accepted-but-timed-out writes remain unknown and reserved until reconciled; revoked/stale authority cannot authorize the next protected use. Apply each check at the component's advertised boundary and use explicit substitution fixtures for responsibilities owned elsewhere. No real financial transaction is required.

**Scope removed or deferred:** independent enterprise authority platform, graph administration/federation ahead of runtime correctness, and any mandatory all-accelerator installation. Preserve existing useful behavior, licenses, ownership and independent use. These are planned adapter requirements, not a claim of deployed capabilities. Existing remediation and migration checks below remain prerequisites.

## 1) Specification (`workstream/spec`)

Complete:

- baseline state machine and invariant sections

In progress:

- finalize invariant ID convention
- finalize reason-code taxonomy

## 2) Schema (`workstream/schema`)

Complete:

- baseline `message-envelope`, `evidence-object`, `verification-report` schemas

In progress:

- compatibility fixtures
- extension guidance examples

## 3) Conformance (`workstream/conformance`)

Complete:

- baseline compliance categories

In progress:

- machine-readable harness contract
- sample conformance report artifact format

## 4) Adapters (`workstream/adapters`)

Complete:

- adapter contract and initial framework examples

In progress:

- adapter conformance walkthroughs with reproducible fixtures

## 5) Docs and Ops (`workstream/docs`)

Complete:

- public roadmap and contribution entry points

In progress:

- external adopter runbook and conformance publication model

## Tracking

- [Specification Issues](https://github.com/UAICP/uaicp/issues)
