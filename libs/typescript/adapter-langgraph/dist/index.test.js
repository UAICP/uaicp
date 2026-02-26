"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const index_1 = require("./index");
(0, vitest_1.describe)('LangGraphAdapter - UAICP v0.3 Core Coverage', () => {
    let adapter;
    (0, vitest_1.beforeEach)(() => {
        adapter = new index_1.LangGraphAdapter('agent-123', '1.0.0');
    });
    (0, vitest_1.describe)('Swarm Tracking Hierarchy Mapping (parent_trace_id)', () => {
        (0, vitest_1.it)('extracts parent_trace_id directly from the basic state representation', () => {
            const state = {
                messages: [],
                parent_trace_id: 'swarm-trace-a1b2'
            }; // Typecast because BasicLangGraphState might be strictly typed
            const envelope = adapter.mapToEnvelope(state);
            (0, vitest_1.expect)(envelope.parent_trace_id).toBe('swarm-trace-a1b2');
        });
        (0, vitest_1.it)('extracts parent_trace_id from initial Langchain message additional_kwargs', () => {
            const state = {
                messages: [
                    {
                        content: 'test',
                        additional_kwargs: {
                            uaicp_parent_trace_id: 'swarm-metadata-c3d4'
                        }
                    }
                ]
            };
            const envelope = adapter.mapToEnvelope(state);
            (0, vitest_1.expect)(envelope.parent_trace_id).toBe('swarm-metadata-c3d4');
        });
        (0, vitest_1.it)('defaults to undefined when swarm tracking is not present', () => {
            const state = { messages: [] };
            const envelope = adapter.mapToEnvelope(state);
            (0, vitest_1.expect)(envelope.parent_trace_id).toBeUndefined();
        });
    });
    (0, vitest_1.describe)('Deep Evidence Parsing', () => {
        (0, vitest_1.it)('captures LangChain ToolMessages correctly as TOOL_OUTPUT evidence', () => {
            const state = {
                messages: [
                    {
                        _getType: () => 'tool',
                        id: 'msg-555',
                        name: 'calculator_tool',
                        tool_call_id: 'call-999',
                        content: '42'
                    }
                ]
            };
            const envelope = adapter.mapToEnvelope(state);
            (0, vitest_1.expect)(envelope.evidence).toHaveLength(1);
            (0, vitest_1.expect)(envelope.evidence[0]).toMatchObject({
                evidence_type: 'TOOL_OUTPUT',
                source: 'calculator_tool',
                evidence_id: 'msg-555',
                payload: {
                    tool_call_id: 'call-999',
                    output: '42'
                }
            });
            (0, vitest_1.expect)(envelope.evidence[0].collected_at).toBeDefined();
        });
        (0, vitest_1.it)('captures AIMessage tool usage intent as EXTERNAL_API evidence', () => {
            const state = {
                messages: [
                    {
                        _getType: () => 'ai',
                        additional_kwargs: {
                            tool_calls: [
                                {
                                    id: 'call-xyz',
                                    function: {
                                        name: 'fetch_user_data',
                                        arguments: '{"userId": 1}'
                                    }
                                }
                            ]
                        }
                    }
                ]
            };
            const envelope = adapter.mapToEnvelope(state);
            (0, vitest_1.expect)(envelope.evidence).toHaveLength(1);
            (0, vitest_1.expect)(envelope.evidence[0]).toMatchObject({
                evidence_type: 'EXTERNAL_API',
                source: 'fetch_user_data',
                evidence_id: 'call-xyz',
                payload: {
                    intent: 'TOOL_INVOCATION',
                    arguments: '{"userId": 1}'
                }
            });
        });
    });
    (0, vitest_1.describe)('v0.3 Strict Typing Capabilities', () => {
        (0, vitest_1.it)('preserves envelope specification invariants', () => {
            const envelope = adapter.mapToEnvelope({ messages: [] });
            (0, vitest_1.expect)(envelope.uaicp_version).toBe('0.3.0');
            (0, vitest_1.expect)(envelope.state).toBe('EXECUTING');
            (0, vitest_1.expect)(envelope.trace_id).toMatch(/^lg-trace-\d+$/);
            (0, vitest_1.expect)(envelope.identity).toEqual({
                agent_id: 'agent-123',
                agent_type: 'langgraph',
                framework: 'langchain',
                version: '1.0.0'
            });
        });
        (0, vitest_1.it)('handles optional streaming logic correctly', () => {
            const chunk = { test: 123 };
            const state = {
                messages: [],
                streaming_chunk: chunk
            };
            const envelope = adapter.mapToEnvelope(state);
            (0, vitest_1.expect)(envelope.streaming).toBeDefined();
            (0, vitest_1.expect)(envelope.streaming?.content).toBe(JSON.stringify(chunk));
            (0, vitest_1.expect)(envelope.streaming?.is_final).toBe(false);
        });
        (0, vitest_1.it)('produces valid rollback safety placeholders', () => {
            const envelope = adapter.mapToEnvelope({ messages: [] });
            (0, vitest_1.expect)(envelope.rollback_action).toMatchObject({
                action_type: 'MANUAL_INTERVENTION'
            });
        });
    });
    (0, vitest_1.describe)('Gate Security Enforcements', () => {
        (0, vitest_1.it)('denies verification gate if no evidence is found', async () => {
            const envelope = adapter.mapToEnvelope({ messages: [] });
            const isVerified = await adapter.verifyGates(envelope);
            (0, vitest_1.expect)(isVerified).toBe(false);
        });
        (0, vitest_1.it)('allows verification if evidence exists', async () => {
            const envelope = adapter.mapToEnvelope({
                messages: [
                    {
                        _getType: () => 'tool',
                        name: 'dummy',
                        content: '1'
                    }
                ]
            });
            const isVerified = await adapter.verifyGates(envelope);
            (0, vitest_1.expect)(isVerified).toBe(true);
        });
        (0, vitest_1.it)('fails policy gate if a dangerous write requires rollback but one is missing', async () => {
            const envelope = adapter.mapToEnvelope({ messages: [] });
            delete envelope.rollback_action; // Simulate a missing rollback action on a critical envelope
            const policyResult = await adapter.enforcePolicy(envelope);
            (0, vitest_1.expect)(policyResult.allowed).toBe(false);
            (0, vitest_1.expect)(policyResult.reason).toContain('rollback_action');
        });
        (0, vitest_1.it)('passes policy gate when rollback fallback is correctly attached by default', async () => {
            const envelope = adapter.mapToEnvelope({ messages: [] });
            // By default, our adapter always attaches MANUAL_INTERVENTION
            const policyResult = await adapter.enforcePolicy(envelope);
            (0, vitest_1.expect)(policyResult.allowed).toBe(true);
        });
    });
});
