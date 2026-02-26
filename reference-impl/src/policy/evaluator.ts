import { AgentIdentity, ControlClass } from '../types/core';

export type WriteRisk = 'read_only' | 'write_low_risk' | 'write_high_risk';
export type PolicyDecision = 'allow' | 'deny' | 'needs_review';

export interface PolicyEvaluationInput {
  identity: AgentIdentity;
  action: string;
  resource: string;
  writeRisk?: WriteRisk;
  approvalToken?: string;
  allowedControlClasses?: ControlClass[];
  trustTierAllowlist?: string[];
  verificationStatus?: 'pass' | 'fail' | 'partial';
  // Backward-compatible aliases
  write_risk?: WriteRisk;
  approval_token?: string;
  allowed_control_classes?: ControlClass[];
  trust_tier_allowlist?: string[];
}

export interface PolicyEvaluationResult {
  decision: PolicyDecision;
  reasons: string[];
}

export class PolicyEvaluator {
  static evaluate(input: PolicyEvaluationInput): PolicyEvaluationResult {
    const reasons: string[] = [];
    const writeRisk = input.writeRisk ?? input.write_risk;
    const approvalToken = input.approvalToken ?? input.approval_token;
    const allowedControlClasses = input.allowedControlClasses ?? input.allowed_control_classes;
    const trustTierAllowlist = input.trustTierAllowlist ?? input.trust_tier_allowlist;

    if (!input.action || !input.resource) {
      return {
        decision: 'deny',
        reasons: ['MISSING_ACTION_OR_RESOURCE']
      };
    }

    if (allowedControlClasses?.length) {
      if (!allowedControlClasses.includes(input.identity.control_class)) {
        reasons.push('CONTROL_CLASS_BLOCKED');
      }
    }

    if (trustTierAllowlist?.length) {
      const trustTier = input.identity.attestation?.trust_tier;
      if (!trustTier || !trustTierAllowlist.includes(trustTier)) {
        reasons.push('TRUST_TIER_BLOCKED');
      }
    }

    if (writeRisk === 'write_high_risk' && !approvalToken) {
      reasons.push('APPROVAL_REQUIRED');
      return {
        decision: 'needs_review',
        reasons
      };
    }

    if (reasons.length > 0) {
      return {
        decision: 'deny',
        reasons
      };
    }

    return {
      decision: 'allow',
      reasons: []
    };
  }
}
