# AutoGen Adapter Example

This example wraps AutoGen task completion with UAICP verify/policy gates.

## Integration Skeleton

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
    writeRisk: classifyWriteRisk(task),
    approvalToken: task.approvalToken,
  });

  if (policy.decision !== 'allow') {
    return failSafe('POLICY_BLOCKED', policy.reasons);
  }

  return deliver(runtime.finalAnswer);
}
```

## Required Checks

- tool outputs are normalized into evidence objects
- verification runs before final answer delivery
- high-risk writes require approval metadata
- blocked paths return reason-coded fail-safe output

## Reference Fixture

- [workflow-comparison.ts](https://github.com/UAICP/uaicp-reference-impl/blob/main/src/examples/finance/workflow-comparison.ts)
