# AutoGen Adapter Example

```ts
async function runAutogenTaskWithUaicp(task: TaskInput) {
  const runtime = await autogen.run(task);

  const envelope = mapEnvelopeFromTask(task, runtime);
  const evidence = normalizeToolEvents(runtime.toolEvents);
  const verification = runVerifier(envelope, evidence);

  if (!verification.required_checks_passed) {
    return failSafe('VERIFICATION_FAILED', verification.reason_codes);
  }

  const policy = runPolicyGate({
    envelope,
    verification,
    action: 'reverse_wire_transfer',
    resource: task.destinationAccount,
    writeRisk: classifyWriteRisk(task),
    approvalToken: task.approvalToken,
  });

  if (policy.decision !== 'allow') {
    return failSafe('POLICY_BLOCKED', policy.reasons);
  }

  return deliver(runtime.finalAnswer);
}
```

Reference fixture:

- [workflow-comparison.ts](https://github.com/UAICP/uaicp-reference-impl/blob/main/src/examples/finance/workflow-comparison.ts)
