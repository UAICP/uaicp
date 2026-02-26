/**
 * @uaicp/core
 * Universal Agentic Interoperability Control Protocol - TypeScript Primitives
 * Version: 0.3.0
 */

export interface EvidenceObject {
    evidence_id: string;
    evidence_type: 'TOOL_OUTPUT' | 'EXTERNAL_API' | 'HUMAN_INPUT' | 'DOCUMENT_REFERENCE';
    source: string;
    collected_at: string; // ISO 8601
    hash?: string; // SHA-256 for integrity
    parent_trace_id?: string; // v0.3: Tracking nested swarm calls
    payload: Record<string, any>;
}

export type UaicpState = 'INTAKE' | 'PLANNING' | 'EXECUTING' | 'VERIFICATION' | 'DELIVERY';

export interface UaicpRollbackAction {
    action_type: 'COMPENSATING_TOOL_CALL' | 'REVERT_API' | 'MANUAL_INTERVENTION';
    payload: Record<string, any>;
}

export interface UaicpStreaming {
    chunk_id: string;
    is_final: boolean;
    content: string;
}

export interface MessageEnvelope {
    uaicp_version: string;
    trace_id: string;
    parent_trace_id?: string; // v0.3: Tracking nested swarm calls
    state: UaicpState;

    identity: {
        agent_id: string;
        agent_type: string;
        framework: string;
        version: string;
    };

    evidence: EvidenceObject[];

    outcome?: {
        status: 'allow' | 'deny' | 'needs_review' | 'fail_safe';
        reason_code: string;
        resolution: string | null;
    };

    streaming?: UaicpStreaming; // v0.3: Safe UX partial streams
    rollback_action?: UaicpRollbackAction; // v0.3: High-risk write recovery
}

/**
 * Common Adapter Interface for enforcing UAICP gating mechanics
 */
export interface UaicpAdapter<FrameworkState, FrameworkToolCall> {
    mapToEnvelope(state: FrameworkState): MessageEnvelope;
    normalizeEvidence(toolCall: FrameworkToolCall): EvidenceObject;
    verifyGates(envelope: MessageEnvelope): Promise<boolean>;
    enforcePolicy(envelope: MessageEnvelope): Promise<{
        allowed: boolean;
        reason: string;
        requiresReview: boolean;
    }>;

    // v0.3 Streaming & Rollback hooks
    streamPartial?(chunk: any): UaicpStreaming | undefined;
    rollbackPayload?(envelope: MessageEnvelope): UaicpRollbackAction | null;
}
