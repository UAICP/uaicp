import { InvariantEvaluator, TaskDefinition, InvariantContext } from './evaluator';

describe('InvariantEvaluator', () => {
    it('should deliver when all requirements met (read-only)', () => {
        const task: TaskDefinition = {
            taskId: 'task-1',
            requiredEvidenceSources: ['internal_wiki'],
            requiredVerifierIds: ['v-fact-checker'],
            writeRiskTier: 'read_only'
        };

        const context: InvariantContext = {
            evidences: [
                {
                    evidence_id: 'ev-1',
                    evidence_type: 'source_citation',
                    source: 'internal_wiki',
                    hash: 'abc',
                    collected_at: '2026-01-01T00:00:00Z'
                }
            ],
            reports: [
                {
                    report_id: 'rep-1',
                    request_id: 'req-1',
                    verifier_id: 'v-fact-checker',
                    status: 'pass',
                    checks: [],
                    generated_at: '2026-01-01T00:01:00Z'
                }
            ],
            policyApproved: true // doesn't matter for read_only
        };

        const result = InvariantEvaluator.evaluate(task, context);
        expect(result.canDeliver).toBe(true);
        expect(result.transitionsTo).toBe('deliver');
    });

    it('should transition to fail_safe if evidence missing', () => {
        const task: TaskDefinition = {
            taskId: 'task-2',
            requiredEvidenceSources: ['calculator', 'approval'],
            requiredVerifierIds: [],
            writeRiskTier: 'read_only'
        };

        const context: InvariantContext = {
            evidences: [
                {
                    evidence_id: 'ev-1',
                    evidence_type: 'tool_result',
                    source: 'calculator',
                    hash: 'abc',
                    collected_at: '2026-01-01T00:00:00Z'
                }
            ],
            reports: [],
            policyApproved: true
        };

        const result = InvariantEvaluator.evaluate(task, context);
        expect(result.canDeliver).toBe(false);
        expect(result.reasons[0]).toContain('approval');
        expect(result.transitionsTo).toBe('fail_safe');
    });

    it('should transition to fail_safe if verifier failed', () => {
        const task: TaskDefinition = {
            taskId: 'task-3',
            requiredEvidenceSources: [],
            requiredVerifierIds: ['v-security'],
            writeRiskTier: 'read_only'
        };

        const context: InvariantContext = {
            evidences: [],
            reports: [
                {
                    report_id: 'rep-2',
                    request_id: 'req-2',
                    verifier_id: 'v-security',
                    status: 'fail',
                    checks: [],
                    generated_at: '2026-01-01T00:01:00Z'
                }
            ],
            policyApproved: true
        };

        const result = InvariantEvaluator.evaluate(task, context);
        expect(result.canDeliver).toBe(false);
        expect(result.transitionsTo).toBe('fail_safe');
    });

    it('should transition to fail_safe if high risk write without token', () => {
        const task: TaskDefinition = {
            taskId: 'task-4',
            requiredEvidenceSources: [],
            requiredVerifierIds: [],
            writeRiskTier: 'write_high_risk'
        };

        const context: InvariantContext = {
            evidences: [],
            reports: [],
            policyApproved: true,
            approvalTokenPresent: false // Missing the token
        };

        const result = InvariantEvaluator.evaluate(task, context);
        expect(result.canDeliver).toBe(false);
        expect(result.transitionsTo).toBe('fail_safe');
        expect(result.reasons).toContain('High risk write operations require an explicit approval token.');
    });
});
