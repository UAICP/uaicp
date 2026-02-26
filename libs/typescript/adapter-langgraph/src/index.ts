import {
    UaicpAdapter,
    MessageEnvelope,
    EvidenceObject,
    UaicpRollbackAction,
    UaicpStreaming
} from '@uaicp/core';

// Typical LangGraph state representation
export interface BasicLangGraphState {
    messages: any[];
    verifications?: string[];
    swarms?: string[];
    streaming_chunk?: any;
}

export class LangGraphAdapter implements UaicpAdapter<BasicLangGraphState, any> {
    private agentId: string;
    private version: string;

    constructor(agentId: string, version: string = '0.3.0') {
        this.agentId = agentId;
        this.version = version;
    }

    /**
     * Required V0.3 Mapping: Takes native graph state and projects it to a strict UAICP Envelope
     */
    mapToEnvelope(state: BasicLangGraphState): MessageEnvelope {
        const parentTraceId = this.extractParentTrace(state);

        return {
            uaicp_version: "0.3.0",
            trace_id: "lg-trace-" + Date.now().toString(),
            parent_trace_id: parentTraceId, // v0.3 Swarm Hierarchy mapping
            state: "EXECUTING",
            identity: {
                agent_id: this.agentId,
                agent_type: "langgraph",
                framework: "langchain",
                version: this.version
            },
            evidence: this.extractEvidence(state.messages),
            streaming: this.streamPartial(state.streaming_chunk),
            rollback_action: this.rollbackPayload(state as any) || undefined // Typecast for skeleton
        };
    }

    normalizeEvidence(toolCall: any): EvidenceObject {
        return {
            evidence_id: `ev-${Date.now()}`,
            evidence_type: "TOOL_OUTPUT",
            source: "langchain_tool",
            collected_at: new Date().toISOString(),
            payload: { output: toolCall }
        };
    }

    /**
     * Enforces Gate 1: Deterministic Verification (Checks if evidence supports delivery)
     */
    async verifyGates(envelope: MessageEnvelope): Promise<boolean> {
        if (!envelope.evidence || envelope.evidence.length === 0) {
            console.warn("UAICP Verification Failed: No evidence collected.");
            return false;
        }
        return true; // Simplified for skeleton
    }

    /**
     * Enforces Gate 2: Policy (High Risk Write checks + Rollback Enforcement)
     */
    async enforcePolicy(envelope: MessageEnvelope): Promise<{ allowed: boolean; reason: string; requiresReview: boolean; }> {
        // Implement standard logic: if intent is WRITING but no rollback exists -> block.
        if (!envelope.rollback_action) {
            return {
                allowed: false,
                reason: "[UAICP Policy Deny] - High risk operation requested with no acceptable rollback_action defined.",
                requiresReview: false
            };
        }

        return { allowed: true, reason: "Policy cleared", requiresReview: false };
    }

    // --- v0.3 Advanced Primitives Hooks --- //

    private extractParentTrace(state: BasicLangGraphState): string | undefined {
        // Logic to crawl sub-graph message metadata for parent LangGraph run ID
        return undefined;
    }

    private extractEvidence(messages: any[]): EvidenceObject[] {
        return [];
    }

    streamPartial(chunk: any): UaicpStreaming | undefined {
        if (!chunk) return undefined;
        return {
            chunk_id: "chunk-" + Math.random(),
            is_final: false,
            content: JSON.stringify(chunk)
        };
    }

    rollbackPayload(envelope: MessageEnvelope): UaicpRollbackAction | null {
        // By default, map the LangGraph undo node context here.
        return {
            action_type: "MANUAL_INTERVENTION",
            payload: { note: "Operator manually resolves langgraph sub-graph" }
        };
    }
}
