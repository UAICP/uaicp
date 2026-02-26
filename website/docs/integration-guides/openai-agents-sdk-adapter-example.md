# OpenAI Agents SDK Adapter Example

Use UAICP as an explicit reliability wrapper around agent run lifecycle events.

## Integration Skeleton

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
    writeRisk: classifyWriteRisk(input),
    approvalToken: input.approvalToken,
  });

  if (policy.decision !== 'allow') {
    return failSafe('POLICY_BLOCKED', policy.reasons);
  }

  return deliver(run.outputText);
}
```

## Required Event Handling

- tool execution events must be persisted as evidence objects
- verifier must execute before final output publication
- policy gate must run before high-risk write actions

## Reference Fixture

- [workflow-comparison.ts](https://github.com/UAICP/uaicp-reference-impl/blob/main/src/examples/finance/workflow-comparison.ts)
