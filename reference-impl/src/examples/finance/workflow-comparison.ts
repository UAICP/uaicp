import { IdentityValidator } from '../../identity/validator';
import { PolicyEvaluator } from '../../policy/evaluator';
import { AgentIdentity, EvidenceObject, VerificationReport } from '../../types/core';
import { InvariantEvaluator, TaskDefinition, InvariantContext } from '../../invariant/evaluator';

export type WorkflowMode =
  | 'manual'
  | 'agentic'
  | 'agent_without_uaicp'
  | 'agent_with_uaicp';

export type WorkflowDecision = 'approved' | 'rejected' | 'needs_review';

export interface FinanceEvidence {
  ticketLinked: boolean;
  ledgerSnapshot: boolean;
  beneficiaryValidated: boolean;
}

export interface FinanceWorkflowInput {
  requestId: string;
  amountUsd: number;
  sourceAccount: string;
  destinationAccount: string;
  modelConfidence: number;
  evidence: FinanceEvidence;
  approvalToken?: string;
  identity: AgentIdentity;
}

export interface WorkflowResult {
  mode: WorkflowMode;
  decision: WorkflowDecision;
  reasons: string[];
  notes: string[];
}

export interface WorkflowComparisonResult {
  manual: WorkflowResult;
  agentic: WorkflowResult;
  agent_without_uaicp: WorkflowResult;
  agent_with_uaicp: WorkflowResult;
}

export function runManualWorkflow(input: FinanceWorkflowInput): WorkflowResult {
  const reasons: string[] = [];

  if (!input.evidence.ticketLinked) reasons.push('CHECKLIST_MISSING_TICKET');
  if (!input.evidence.ledgerSnapshot) reasons.push('CHECKLIST_MISSING_LEDGER_SNAPSHOT');
  if (!input.evidence.beneficiaryValidated) reasons.push('CHECKLIST_MISSING_BENEFICIARY_VALIDATION');
  if (!input.approvalToken) reasons.push('CHECKLIST_MISSING_APPROVAL');

  return {
    mode: 'manual',
    decision: reasons.length === 0 ? 'approved' : 'rejected',
    reasons,
    notes: ['Human checklist gate before executing finance write action'],
  };
}

export function runAgenticWorkflow(input: FinanceWorkflowInput): WorkflowResult {
  const reasons: string[] = [];

  if (input.modelConfidence < 0.65) reasons.push('LOW_MODEL_CONFIDENCE');
  if (!input.evidence.ticketLinked) reasons.push('MISSING_TICKET_LINK');

  return {
    mode: 'agentic',
    decision: reasons.length === 0 ? 'approved' : 'rejected',
    reasons,
    notes: [
      'Framework-native orchestration without explicit policy gate semantics',
      'Evidence is partially considered but not fully enforced',
    ],
  };
}

export function runAgentWorkflowWithoutUaicp(input: FinanceWorkflowInput): WorkflowResult {
  if (input.modelConfidence >= 0.55) {
    return {
      mode: 'agent_without_uaicp',
      decision: 'approved',
      reasons: [],
      notes: [
        'Decision made from model confidence and task success',
        'No deterministic evidence gate or high-risk approval gate',
      ],
    };
  }

  return {
    mode: 'agent_without_uaicp',
    decision: 'rejected',
    reasons: ['LOW_MODEL_CONFIDENCE'],
    notes: ['Rejected due to confidence threshold, not governance controls'],
  };
}

export function runAgentWorkflowWithUaicp(input: FinanceWorkflowInput): WorkflowResult {
  const identityResult = IdentityValidator.validate(input.identity, true);
  if (!identityResult.valid || !identityResult.identity) {
    return {
      mode: 'agent_with_uaicp',
      decision: 'rejected',
      reasons: (identityResult.errors ?? []).map((err) => `IDENTITY_INVALID:${err}`),
      notes: ['UAICP identity gate blocked execution'],
    };
  }

  const policyResult = PolicyEvaluator.evaluate({
    identity: identityResult.identity,
    action: 'reverse_wire_transfer',
    resource: input.destinationAccount,
    writeRisk: 'write_high_risk',
    approvalToken: input.approvalToken,
    allowedControlClasses: ['human-supervised', 'human-directed'],
    trustTierAllowlist: ['high'],
  });

  if (policyResult.decision === 'needs_review') {
    return {
      mode: 'agent_with_uaicp',
      decision: 'needs_review',
      reasons: policyResult.reasons,
      notes: ['UAICP policy gate requires explicit approval before high-risk write'],
    };
  }

  if (policyResult.decision === 'deny') {
    return {
      mode: 'agent_with_uaicp',
      decision: 'rejected',
      reasons: policyResult.reasons,
      notes: ['UAICP policy gate denied execution'],
    };
  }

  // 3. Map inputs to UAICP Evidence Objects
  const evidences: EvidenceObject[] = [];
  const now = new Date().toISOString();

  if (input.evidence.ticketLinked) {
    evidences.push({ evidence_id: 'ev-tick', evidence_type: 'tool_result', source: 'jira_plugin', hash: 'abc', collected_at: now });
  }
  if (input.evidence.ledgerSnapshot) {
    evidences.push({ evidence_id: 'ev-ledg', evidence_type: 'tool_result', source: 'ledger_snapshot', hash: 'def', collected_at: now });
  }
  if (input.evidence.beneficiaryValidated) {
    evidences.push({ evidence_id: 'ev-ben', evidence_type: 'tool_result', source: 'beneficiary_kyc', hash: 'xyz', collected_at: now });
  }

  // 4. Map Confidence to a Verification Report
  const reports: VerificationReport[] = [
    {
      report_id: 'rep-conf',
      request_id: input.requestId,
      verifier_id: 'model-confidence-checker',
      status: input.modelConfidence >= 0.55 ? 'pass' : 'fail',
      checks: [
        { check_id: 'CONFIDENCE_THRESHOLD', result: input.modelConfidence >= 0.55 ? 'pass' : 'fail' }
      ],
      generated_at: now
    }
  ];

  // 5. Evaluate Invariants for the State Transition
  const taskDef: TaskDefinition = {
    taskId: 'wire-reversal',
    requiredEvidenceSources: ['jira_plugin', 'ledger_snapshot', 'beneficiary_kyc'],
    requiredVerifierIds: ['model-confidence-checker'],
    writeRiskTier: 'write_high_risk'
  };

  const context: InvariantContext = {
    evidences,
    reports,
    policyApproved: policyResult.decision === 'allow',
    approvalTokenPresent: !!input.approvalToken
  };

  const evalResult = InvariantEvaluator.evaluate(taskDef, context);

  if (!evalResult.canDeliver) {
    return {
      mode: 'agent_with_uaicp',
      decision: 'rejected',
      reasons: evalResult.reasons,
      notes: ['UAICP invariant gate blocked delivery', `Transitioning to: ${evalResult.transitionsTo}`],
    };
  }

  return {
    mode: 'agent_with_uaicp',
    decision: 'approved',
    reasons: [],
    notes: ['All UAICP gates passed: identity, policy, evidence, and verification'],
  };
}

export function runWorkflowComparison(input: FinanceWorkflowInput): WorkflowComparisonResult {
  return {
    manual: runManualWorkflow(input),
    agentic: runAgenticWorkflow(input),
    agent_without_uaicp: runAgentWorkflowWithoutUaicp(input),
    agent_with_uaicp: runAgentWorkflowWithUaicp(input),
  };
}

export function createSampleFinanceWorkflowInput(): FinanceWorkflowInput {
  return {
    requestId: 'fin-req-1001',
    amountUsd: 125000,
    sourceAccount: 'ops-usd-001',
    destinationAccount: 'vendor-usd-879',
    modelConfidence: 0.82,
    evidence: {
      ticketLinked: true,
      ledgerSnapshot: true,
      beneficiaryValidated: false,
    },
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
}
