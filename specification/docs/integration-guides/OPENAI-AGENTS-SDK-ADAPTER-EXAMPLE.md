# OpenAI Agents SDK Adapter Example

```ts
async function runWithUaicp(input: AgentInput) {
  const run = await agent.run(input);

  const envelope = mapEnvelope(input, run);
  const evidence = collectRunEvidence(run.toolCalls, run.messages);
  const verification = runVerifier(envelope, evidence);

  if (!verification.required_checks_passed) {
    return failSafe('VERIFICATION_FAILED', verification.reason_codes);
  }

  const policy = runPolicyGate({
    envelope,
    verification,
    action: input.action,
    resource: input.resource,
    writeRisk: classifyWriteRisk(input),
    approvalToken: input.approvalToken,
  });

  if (policy.decision !== 'allow') {
    return failSafe('POLICY_BLOCKED', policy.reasons);
  }

  return deliver(run.outputText);
}
```

Reference fixture:

- [workflow-comparison.ts](https://github.com/UAICP/uaicp-reference-impl/blob/main/src/examples/finance/workflow-comparison.ts)
