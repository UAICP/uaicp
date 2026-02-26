import {
  FinanceWorkflowInput,
  runAgentWorkflowWithUaicp,
  runAgentWorkflowWithoutUaicp,
  runManualWorkflow,
  runWorkflowComparison,
} from './workflow-comparison';

const baseInput: FinanceWorkflowInput = {
  requestId: 'fin-req-test-001',
  amountUsd: 45000,
  sourceAccount: 'ops-usd-001',
  destinationAccount: 'vendor-usd-879',
  modelConfidence: 0.8,
  evidence: {
    ticketLinked: true,
    ledgerSnapshot: true,
    beneficiaryValidated: true,
  },
  approvalToken: 'approval-123',
  identity: {
    agent_id: 'agent:finance/approval-bot',
    owner_id: 'org:uaicp-demo',
    control_class: 'human-directed',
    attestation: {
      issuer: 'uaicp-verifier',
      evidence: 'signed-token',
      issued_at: new Date().toISOString(),
      trust_tier: 'high',
    },
  },
};

function buildInput(
  overrides: Omit<Partial<FinanceWorkflowInput>, 'evidence'> & {
    evidence?: Partial<FinanceWorkflowInput['evidence']>;
  } = {},
): FinanceWorkflowInput {
  return {
    ...baseInput,
    ...overrides,
    evidence: {
      ...baseInput.evidence,
      ...(overrides.evidence ?? {}),
    },
  };
}

describe('finance workflow comparison', () => {
  test('agent without UAICP can approve high-risk action without explicit approval', () => {
    const input = buildInput({ approvalToken: undefined });
    const result = runAgentWorkflowWithoutUaicp(input);

    expect(result.decision).toBe('approved');
  });

  test('agent with UAICP requires approval for high-risk write actions', () => {
    const input = buildInput({ approvalToken: undefined });
    const result = runAgentWorkflowWithUaicp(input);

    expect(result.decision).toBe('needs_review');
    expect(result.reasons).toContain('APPROVAL_REQUIRED');
  });

  test('agent with UAICP rejects when required evidence is missing', () => {
    const input = buildInput({
      evidence: { beneficiaryValidated: false },
    });
    const result = runAgentWorkflowWithUaicp(input);

    expect(result.decision).toBe('rejected');
    expect(result.reasons).toContain('EVIDENCE_MISSING:beneficiaryValidated');
  });

  test('manual workflow rejects when checklist is incomplete', () => {
    const input = buildInput({
      evidence: { ledgerSnapshot: false },
    });
    const result = runManualWorkflow(input);

    expect(result.decision).toBe('rejected');
    expect(result.reasons).toContain('CHECKLIST_MISSING_LEDGER_SNAPSHOT');
  });

  test('comparison shows all four workflow modes', () => {
    const result = runWorkflowComparison(buildInput());

    expect(result.manual.mode).toBe('manual');
    expect(result.agentic.mode).toBe('agentic');
    expect(result.agent_without_uaicp.mode).toBe('agent_without_uaicp');
    expect(result.agent_with_uaicp.mode).toBe('agent_with_uaicp');
  });
});
