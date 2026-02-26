import { EvidenceObject, VerificationReport } from '../types/core';

export type WriteRiskTier = 'read_only' | 'write_low_risk' | 'write_high_risk';

export interface TaskDefinition {
    taskId: string;
    requiredEvidenceSources: string[];
    requiredVerifierIds: string[];
    writeRiskTier: WriteRiskTier;
}

export interface InvariantContext {
    evidences: EvidenceObject[];
    reports: VerificationReport[];
    policyApproved: boolean;
    approvalTokenPresent?: boolean;
}

export interface EvaluationResult {
    canDeliver: boolean;
    reasons: string[];
    transitionsTo: 'deliver' | 'fail_safe';
}

/**
 * The InvariantEvaluator enforces the strictly defined UAICP state transitions.
 * It determines if an Orchestrator has met all invariant conditions required
 * to transition from the `verify` state to the `deliver` state.
 */
export class InvariantEvaluator {

    static evaluate(task: TaskDefinition, context: InvariantContext): EvaluationResult {
        const reasons: string[] = [];

        // 1. Evidence Gating
        for (const requiredSource of task.requiredEvidenceSources) {
            const hasEvidence = context.evidences.some(e => e.source === requiredSource);
            if (!hasEvidence) {
                reasons.push(`Missing required evidence from source: '${requiredSource}'`);
            }
        }

        // 2. Verification Gating
        for (const verifierId of task.requiredVerifierIds) {
            const report = context.reports.find(r => r.verifier_id === verifierId);
            if (!report) {
                reasons.push(`Missing verification report from required verifier: '${verifierId}'`);
            } else if (report.status !== 'pass') {
                reasons.push(`Required verifier '${verifierId}' did not pass. Status: '${report.status}'`);
            }
        }

        // 3. Policy-Gated Writes
        if (task.writeRiskTier === 'write_low_risk' || task.writeRiskTier === 'write_high_risk') {
            if (!context.policyApproved) {
                reasons.push(`Policy approval required for '${task.writeRiskTier}' actions but policy evaluation was rejected or missing.`);
            }
        }

        if (task.writeRiskTier === 'write_high_risk') {
            // In a real system, we'd also cryptographically verify the token.
            // For the invariant engine, we ensure it's provided in the context.
            if (!context.approvalTokenPresent) {
                reasons.push(`High risk write operations require an explicit approval token.`);
            }
        }

        const canDeliver = reasons.length === 0;

        return {
            canDeliver,
            reasons,
            transitionsTo: canDeliver ? 'deliver' : 'fail_safe'
        };
    }
}
