# Finance Workflow Comparison

This walkthrough compares four implementations of the same high-risk finance action (`reverse_wire_transfer`).

## Workflow Input

Common input fields:

- request id
- amount and target account
- runtime identity + attestation
- evidence set (`ticketLinked`, `ledgerSnapshot`, `beneficiaryValidated`)
- optional approval token

Reference source:

- [workflow-comparison.ts](https://github.com/UAICP/uaicp-reference-impl/blob/main/src/examples/finance/workflow-comparison.ts)

## 1. Manual Workflow

Execution style:

- human checklist and approval before action

Strengths:

- explicit control and accountability

Limits:

- slower
- inconsistent across operators

## 2. Agentic Workflow (Framework-Native)

Execution style:

- orchestration runtime performs tool sequence
- decision often driven by model confidence + task flow

Strengths:

- fast and scalable

Limits:

- incomplete governance guarantees unless explicit gates are added

## 3. Agent Implementation Without UAICP

Execution style:

- automated approval path based on confidence/task success

Observed risk:

- can approve high-risk actions without complete evidence or explicit approval metadata

## 4. Agent Implementation With UAICP

Execution style:

- identity gate (`IdentityValidator`)
- policy gate (`PolicyEvaluator`)
- evidence gate (required evidence fields)
- verification gate (confidence/verification constraints)

Outcome behavior:

- `allow` only when all gates pass
- `needs_review` for high-risk writes without approval
- `reject/fail_safe` for missing evidence or invalid identity/policy conditions

## Run the Example

```bash
cd uaicp-reference-impl
npm install
npm run example:finance
```

## Why This Matters

The comparison makes one point clear: UAICP changes reliability outcomes from implicit best-effort behavior to deterministic, auditable gate semantics.
