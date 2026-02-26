# UAICP Compliance Tests (Baseline)

Baseline compliance is executable in this repository via:

```bash
npm test
```

This runs `tests/run-conformance.cjs` and generates:

- `tests/conformance-report.json`

## Test Categories

1. **State Machine Compliance**
- required state enum contains all UAICP phases
- `state` is required in message envelope schema
- valid/invalid message envelope fixtures validate as expected

2. **Evidence Gating Compliance**
- valid/invalid evidence object fixtures validate as expected
- evidence enum includes `tool_result`

3. **Verification Compliance**
- valid/invalid verification report fixtures validate as expected

4. **Policy Gate Compliance**
- adapter contract includes policy gate input/output requirements
- high-risk write rule requires `APPROVAL_REQUIRED` + `needs_review`

5. **Audit Compliance**
- envelope schema requires `request_id`, `trace_id`, `timestamp`, `identity`

## Pass Criteria

Baseline conformance requires 100% pass rate across all executable checks.

## Reporting

`tests/conformance-report.json` includes:

- generation timestamp
- protocol version
- total checks / failed checks
- pass/fail per check with details on failures
