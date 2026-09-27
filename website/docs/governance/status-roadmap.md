# Implementation status and roadmap

Reviewed 2026-09-24 from the local monorepo. UAICP provides open, vendor-neutral reliability contracts, schemas, libraries and reference primitives. Public registry publication and the previously reported 52-adapter-test total were not reverified in this review.

## Verified locally

- Reference implementation: 21 passing tests, including existing invariant primitives.
- Baseline specification conformance runner: 12 passing fixtures.
- Native TypeScript envelopes and the baseline schema differ in state names, required identity/timestamp fields and outcome semantics. Passing separate suites does not establish interchangeability.

## Next release priorities

1. Specify explicit native-to-baseline mappings; preserve missing identity as invalid or unknown rather than inventing it.
2. Share positive and negative fixtures across TypeScript, Python and Rust; distinguish policy verdicts from execution outcomes.
3. Demonstrate authenticated approval and exact-request binding through an optional host adapter. Metadata presence alone is not enforcement.
4. Verify package builds, releases and supported framework versions before publishing a compatibility matrix.

Databridle is an optional consumer. It is not required for UAICP conformance, and commercial policy stays outside the normative protocol.

Start with the [core specification](../specification/specification.md), [adapter contract](../integration-guides/adapter-contract.md) and [adapter matrix](../integration-guides/adapter-matrix.md). The repository-root `IMPLEMENTATION-PLAN.md` owns delivery scope.
