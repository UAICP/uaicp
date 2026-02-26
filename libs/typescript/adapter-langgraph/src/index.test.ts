import { describe, it, expect, beforeEach } from 'vitest';
import { LangGraphAdapter, BasicLangGraphState } from './index';

describe('LangGraphAdapter - UAICP v0.3 Core Coverage', () => {
    let adapter: LangGraphAdapter;

    beforeEach(() => {
        adapter = new LangGraphAdapter('agent-123', '1.0.0');
    });

    describe('Swarm Tracking Hierarchy Mapping (parent_trace_id)', () => {
        it('extracts parent_trace_id directly from the basic state representation', () => {
            const state: BasicLangGraphState = {
                messages: [],
                parent_trace_id: 'swarm-trace-a1b2'
            } as any; // Typecast because BasicLangGraphState might be strictly typed

            const envelope = adapter.mapToEnvelope(state);
            expect(envelope.parent_trace_id).toBe('swarm-trace-a1b2');
        });

        it('extracts parent_trace_id from initial Langchain message additional_kwargs', () => {
            const state: BasicLangGraphState = {
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
            expect(envelope.parent_trace_id).toBe('swarm-metadata-c3d4');
        });

        it('defaults to undefined when swarm tracking is not present', () => {
            const state: BasicLangGraphState = { messages: [] };
            const envelope = adapter.mapToEnvelope(state);
            expect(envelope.parent_trace_id).toBeUndefined();
        });
    });

    describe('Deep Evidence Parsing', () => {
        it('captures LangChain ToolMessages correctly as TOOL_OUTPUT evidence', () => {
            const state: BasicLangGraphState = {
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
            expect(envelope.evidence).toHaveLength(1);
            expect(envelope.evidence[0]).toMatchObject({
                evidence_type: 'TOOL_OUTPUT',
                source: 'calculator_tool',
                evidence_id: 'msg-555',
                payload: {
                    tool_call_id: 'call-999',
                    output: '42'
                }
            });
            expect(envelope.evidence[0].collected_at).toBeDefined();
        });

        it('captures AIMessage tool usage intent as EXTERNAL_API evidence', () => {
            const state: BasicLangGraphState = {
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
            expect(envelope.evidence).toHaveLength(1);
            expect(envelope.evidence[0]).toMatchObject({
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

    describe('v0.3 Strict Typing Capabilities', () => {
        it('preserves envelope specification invariants', () => {
            const envelope = adapter.mapToEnvelope({ messages: [] });
            expect(envelope.uaicp_version).toBe('0.3.0');
            expect(envelope.state).toBe('EXECUTING');
            expect(envelope.trace_id).toMatch(/^lg-trace-\d+$/);
            expect(envelope.identity).toEqual({
                agent_id: 'agent-123',
                agent_type: 'langgraph',
                framework: 'langchain',
                version: '1.0.0'
            });
        });

        it('handles optional streaming logic correctly', () => {
            const chunk = { test: 123 };
            const state: BasicLangGraphState = {
                messages: [],
                streaming_chunk: chunk
            };
            const envelope = adapter.mapToEnvelope(state);
            expect(envelope.streaming).toBeDefined();
            expect(envelope.streaming?.content).toBe(JSON.stringify(chunk));
            expect(envelope.streaming?.is_final).toBe(false);
        });

        it('produces valid rollback safety placeholders', () => {
            const envelope = adapter.mapToEnvelope({ messages: [] });
            expect(envelope.rollback_action).toMatchObject({
                action_type: 'MANUAL_INTERVENTION'
            });
        });
    });

    describe('Gate Security Enforcements', () => {
        it('denies verification gate if no evidence is found', async () => {
            const envelope = adapter.mapToEnvelope({ messages: [] });
            const isVerified = await adapter.verifyGates(envelope);
            expect(isVerified).toBe(false);
        });

        it('allows verification if evidence exists', async () => {
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
            expect(isVerified).toBe(true);
        });

        it('fails policy gate if a dangerous write requires rollback but one is missing', async () => {
            const envelope = adapter.mapToEnvelope({ messages: [] });
            delete envelope.rollback_action; // Simulate a missing rollback action on a critical envelope

            const policyResult = await adapter.enforcePolicy(envelope);
            expect(policyResult.allowed).toBe(false);
            expect(policyResult.reason).toContain('rollback_action');
        });

        it('passes policy gate when rollback fallback is correctly attached by default', async () => {
            const envelope = adapter.mapToEnvelope({ messages: [] });
            // By default, our adapter always attaches MANUAL_INTERVENTION
            const policyResult = await adapter.enforcePolicy(envelope);
            expect(policyResult.allowed).toBe(true);
        });
    });
});
