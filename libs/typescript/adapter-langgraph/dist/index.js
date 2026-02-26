"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LangGraphAdapter = void 0;
class LangGraphAdapter {
    agentId;
    version;
    constructor(agentId, version = '0.3.0') {
        this.agentId = agentId;
        this.version = version;
    }
    /**
     * Required V0.3 Mapping: Takes native graph state and projects it to a strict UAICP Envelope
     */
    mapToEnvelope(state) {
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
            rollback_action: this.rollbackPayload(state) || undefined // Typecast for skeleton
        };
    }
    normalizeEvidence(toolCall) {
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
    async verifyGates(envelope) {
        if (!envelope.evidence || envelope.evidence.length === 0) {
            console.warn("UAICP Verification Failed: No evidence collected.");
            return false;
        }
        return true; // Simplified for skeleton
    }
    /**
     * Enforces Gate 2: Policy (High Risk Write checks + Rollback Enforcement)
     */
    async enforcePolicy(envelope) {
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
    extractParentTrace(state) {
        // Logic to crawl sub-graph message metadata for parent LangGraph run ID
        return undefined;
    }
    extractEvidence(messages) {
        return [];
    }
    streamPartial(chunk) {
        if (!chunk)
            return undefined;
        return {
            chunk_id: "chunk-" + Math.random(),
            is_final: false,
            content: JSON.stringify(chunk)
        };
    }
    rollbackPayload(envelope) {
        // By default, map the LangGraph undo node context here.
        return {
            action_type: "MANUAL_INTERVENTION",
            payload: { note: "Operator manually resolves langgraph sub-graph" }
        };
    }
}
exports.LangGraphAdapter = LangGraphAdapter;
