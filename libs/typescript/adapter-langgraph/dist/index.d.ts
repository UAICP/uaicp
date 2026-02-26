import { UaicpAdapter, MessageEnvelope, EvidenceObject, UaicpRollbackAction, UaicpStreaming } from '@uaicp/core';
export interface BasicLangGraphState {
    messages: any[];
    verifications?: string[];
    swarms?: string[];
    streaming_chunk?: any;
}
export declare class LangGraphAdapter implements UaicpAdapter<BasicLangGraphState, any> {
    private agentId;
    private version;
    constructor(agentId: string, version?: string);
    /**
     * Required V0.3 Mapping: Takes native graph state and projects it to a strict UAICP Envelope
     */
    mapToEnvelope(state: BasicLangGraphState): MessageEnvelope;
    normalizeEvidence(toolCall: any): EvidenceObject;
    /**
     * Enforces Gate 1: Deterministic Verification (Checks if evidence supports delivery)
     */
    verifyGates(envelope: MessageEnvelope): Promise<boolean>;
    /**
     * Enforces Gate 2: Policy (High Risk Write checks + Rollback Enforcement)
     */
    enforcePolicy(envelope: MessageEnvelope): Promise<{
        allowed: boolean;
        reason: string;
        requiresReview: boolean;
    }>;
    private extractParentTrace;
    private extractEvidence;
    streamPartial(chunk: any): UaicpStreaming | undefined;
    rollbackPayload(envelope: MessageEnvelope): UaicpRollbackAction | null;
}
