"""
Comprehensive test suite for uaicp-adapter-autogen.
Validates full UAICP v0.3 specification compliance:
  - Swarm hierarchy tracking (parent_trace_id)
  - Deep evidence parsing (TOOL_OUTPUT, EXTERNAL_API, HUMAN_INPUT)
  - Envelope invariants (version, state, identity)
  - Gate 1: Deterministic verification
  - Gate 2: Policy enforcement with rollback presence
  - Streaming chunk normalization
  - Rollback payload generation
"""

import pytest

from uaicp_core import (
    EvidenceType,
    MessageEnvelope,
    UaicpState,
    AgentIdentity,
    RollbackActionType,
)
from uaicp_adapter_autogen import AutoGenAdapter, AutoGenState


@pytest.fixture
def adapter() -> AutoGenAdapter:
    return AutoGenAdapter(agent_id="agent-py-001", version="1.0.0")


# ============================================================
# Swarm Tracking Hierarchy (parent_trace_id)
# ============================================================

class TestSwarmTracking:
    def test_extracts_parent_trace_from_state_attribute(self, adapter: AutoGenAdapter):
        state = AutoGenState(
            messages=[],
            parent_trace_id="swarm-direct-abc",
        )
        envelope = adapter.map_to_envelope(state)
        assert envelope.parent_trace_id == "swarm-direct-abc"

    def test_extracts_parent_trace_from_message_metadata(self, adapter: AutoGenAdapter):
        state = AutoGenState(
            messages=[
                {
                    "role": "assistant",
                    "content": "routing",
                    "metadata": {"uaicp_parent_trace_id": "swarm-meta-xyz"},
                }
            ],
        )
        envelope = adapter.map_to_envelope(state)
        assert envelope.parent_trace_id == "swarm-meta-xyz"

    def test_extracts_parent_trace_from_handoff_message(self, adapter: AutoGenAdapter):
        state = AutoGenState(
            messages=[
                {
                    "role": "handoff",
                    "content": {"parent_trace_id": "swarm-handoff-999"},
                }
            ],
        )
        envelope = adapter.map_to_envelope(state)
        assert envelope.parent_trace_id == "swarm-handoff-999"

    def test_extracts_parent_trace_from_state_metadata(self, adapter: AutoGenAdapter):
        state = AutoGenState(
            messages=[],
            metadata={"parent_trace_id": "swarm-statemeta-42"},
        )
        envelope = adapter.map_to_envelope(state)
        assert envelope.parent_trace_id == "swarm-statemeta-42"

    def test_defaults_to_none_when_no_swarm_context(self, adapter: AutoGenAdapter):
        state = AutoGenState(messages=[])
        envelope = adapter.map_to_envelope(state)
        assert envelope.parent_trace_id is None


# ============================================================
# Deep Evidence Parsing
# ============================================================

class TestEvidenceParsing:
    def test_captures_tool_role_messages_as_tool_output(self, adapter: AutoGenAdapter):
        state = AutoGenState(
            messages=[
                {
                    "role": "tool",
                    "tool_call_id": "call-001",
                    "name": "calculator",
                    "content": "42",
                }
            ],
        )
        envelope = adapter.map_to_envelope(state)
        assert len(envelope.evidence) == 1
        ev = envelope.evidence[0]
        assert ev.evidence_type == EvidenceType.TOOL_OUTPUT
        assert ev.source == "calculator"
        assert ev.payload["tool_call_id"] == "call-001"
        assert ev.payload["output"] == "42"

    def test_captures_function_role_messages_as_tool_output(self, adapter: AutoGenAdapter):
        state = AutoGenState(
            messages=[
                {
                    "role": "function",
                    "name": "web_search",
                    "content": '{"results": []}',
                }
            ],
        )
        envelope = adapter.map_to_envelope(state)
        assert len(envelope.evidence) == 1
        assert envelope.evidence[0].evidence_type == EvidenceType.TOOL_OUTPUT
        assert envelope.evidence[0].source == "web_search"

    def test_captures_assistant_tool_calls_as_external_api_intent(
        self, adapter: AutoGenAdapter
    ):
        state = AutoGenState(
            messages=[
                {
                    "role": "assistant",
                    "content": "",
                    "tool_calls": [
                        {
                            "id": "call-xyz",
                            "function": {
                                "name": "fetch_user_data",
                                "arguments": '{"userId": 1}',
                            },
                        }
                    ],
                }
            ],
        )
        envelope = adapter.map_to_envelope(state)
        assert len(envelope.evidence) == 1
        ev = envelope.evidence[0]
        assert ev.evidence_type == EvidenceType.EXTERNAL_API
        assert ev.source == "fetch_user_data"
        assert ev.evidence_id == "call-xyz"
        assert ev.payload["intent"] == "TOOL_INVOCATION"

    def test_captures_user_messages_as_human_input(self, adapter: AutoGenAdapter):
        state = AutoGenState(
            messages=[{"role": "user", "content": "Please summarize the report."}],
        )
        envelope = adapter.map_to_envelope(state)
        assert len(envelope.evidence) == 1
        ev = envelope.evidence[0]
        assert ev.evidence_type == EvidenceType.HUMAN_INPUT
        assert ev.source == "user"
        assert ev.payload["content"] == "Please summarize the report."

    def test_handles_mixed_message_types(self, adapter: AutoGenAdapter):
        state = AutoGenState(
            messages=[
                {"role": "user", "content": "Go"},
                {
                    "role": "assistant",
                    "content": "",
                    "tool_calls": [
                        {"id": "c1", "function": {"name": "search", "arguments": "{}"}}
                    ],
                },
                {"role": "tool", "tool_call_id": "c1", "name": "search", "content": "ok"},
            ],
        )
        envelope = adapter.map_to_envelope(state)
        assert len(envelope.evidence) == 3  # HUMAN_INPUT + EXTERNAL_API + TOOL_OUTPUT
        types = {ev.evidence_type for ev in envelope.evidence}
        assert types == {
            EvidenceType.HUMAN_INPUT,
            EvidenceType.EXTERNAL_API,
            EvidenceType.TOOL_OUTPUT,
        }


# ============================================================
# Envelope Invariants
# ============================================================

class TestEnvelopeInvariants:
    def test_version_is_0_3_0(self, adapter: AutoGenAdapter):
        envelope = adapter.map_to_envelope(AutoGenState(messages=[]))
        assert envelope.uaicp_version == "0.3.0"

    def test_state_is_executing(self, adapter: AutoGenAdapter):
        envelope = adapter.map_to_envelope(AutoGenState(messages=[]))
        assert envelope.state == UaicpState.EXECUTING

    def test_trace_id_format(self, adapter: AutoGenAdapter):
        envelope = adapter.map_to_envelope(AutoGenState(messages=[]))
        assert envelope.trace_id.startswith("ag-trace-")

    def test_identity_fields(self, adapter: AutoGenAdapter):
        envelope = adapter.map_to_envelope(AutoGenState(messages=[]))
        assert envelope.identity.agent_id == "agent-py-001"
        assert envelope.identity.agent_type == "autogen"
        assert envelope.identity.framework == "microsoft-autogen"
        assert envelope.identity.version == "1.0.0"


# ============================================================
# Gate Security Enforcements
# ============================================================

class TestGateSecurity:
    @pytest.mark.asyncio
    async def test_verification_gate_denies_without_evidence(
        self, adapter: AutoGenAdapter
    ):
        envelope = adapter.map_to_envelope(AutoGenState(messages=[]))
        # Remove any evidence that might have been generated
        envelope.evidence = []
        result = await adapter.verify_gates(envelope)
        assert result is False

    @pytest.mark.asyncio
    async def test_verification_gate_allows_with_evidence(
        self, adapter: AutoGenAdapter
    ):
        state = AutoGenState(
            messages=[
                {"role": "tool", "name": "calc", "content": "1", "tool_call_id": "t1"}
            ],
        )
        envelope = adapter.map_to_envelope(state)
        result = await adapter.verify_gates(envelope)
        assert result is True

    @pytest.mark.asyncio
    async def test_policy_gate_denies_without_rollback(
        self, adapter: AutoGenAdapter
    ):
        envelope = adapter.map_to_envelope(AutoGenState(messages=[]))
        envelope.rollback_action = None  # Simulate a missing rollback
        result = await adapter.enforce_policy(envelope)
        assert result.allowed is False
        assert "rollback_action" in result.reason

    @pytest.mark.asyncio
    async def test_policy_gate_allows_with_default_rollback(
        self, adapter: AutoGenAdapter
    ):
        envelope = adapter.map_to_envelope(AutoGenState(messages=[]))
        result = await adapter.enforce_policy(envelope)
        assert result.allowed is True


# ============================================================
# Streaming & Rollback
# ============================================================

class TestStreamingAndRollback:
    def test_streaming_returns_none_for_no_chunk(self, adapter: AutoGenAdapter):
        result = adapter.stream_partial(None)
        assert result is None

    def test_streaming_normalizes_chunk(self, adapter: AutoGenAdapter):
        chunk = {"content": "partial response...", "is_final": False}
        result = adapter.stream_partial(chunk)
        assert result is not None
        assert result.content == "partial response..."
        assert result.is_final is False
        assert result.chunk_id.startswith("chunk-")

    def test_streaming_handles_final_chunk(self, adapter: AutoGenAdapter):
        chunk = {"content": "done", "is_final": True}
        result = adapter.stream_partial(chunk)
        assert result is not None
        assert result.is_final is True

    def test_rollback_produces_manual_intervention(self, adapter: AutoGenAdapter):
        envelope = adapter.map_to_envelope(AutoGenState(messages=[]))
        assert envelope.rollback_action is not None
        assert (
            envelope.rollback_action.action_type
            == RollbackActionType.MANUAL_INTERVENTION
        )

    def test_envelope_streaming_populated_from_state(self, adapter: AutoGenAdapter):
        state = AutoGenState(
            messages=[],
            streaming_chunk={"content": "streaming...", "is_final": False},
        )
        envelope = adapter.map_to_envelope(state)
        assert envelope.streaming is not None
        assert envelope.streaming.content == "streaming..."
