# CrewAI Adapter Example

```ts
async function finalizeCrewTask(taskCtx: CrewTaskContext) {
  const crewResult = await runCrew(taskCtx);

  const envelope = mapEnvelope(taskCtx);
  const evidence = normalizeCrewEvidence(crewResult.steps);
  const verification = runVerifier(envelope, evidence);

  if (!verification.required_checks_passed) {
    return failSafe('VERIFICATION_FAILED', verification.reason_codes);
  }

  const gate = runPolicyGate({
    envelope,
    verification,
    action: taskCtx.action,
    resource: taskCtx.resource,
    writeRisk: taskCtx.writeRisk,
    approvalToken: taskCtx.approvalToken,
  });

  if (gate.decision !== 'allow') {
    return failSafe('POLICY_BLOCKED', gate.reasons);
  }

  return deliver(crewResult.output);
}
```

Reference fixture:

- [workflow-comparison.ts](https://github.com/UAICP/uaicp/blob/main/reference-impl/src/examples/finance/workflow-comparison.ts)
