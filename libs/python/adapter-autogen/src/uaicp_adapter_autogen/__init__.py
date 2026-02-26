"""
uaicp-adapter-autogen
UAICP v0.3 Reliability Protocol Adapter for Microsoft AutoGen
Provides strict UAICP envelope mapping for AutoGen multi-agent conversations.
"""

from __future__ import annotations

import time
import uuid
from typing import Any, Optional

from uaicp_core import (
    EvidenceObject,
    EvidenceType,
    MessageEnvelope,
    AgentIdentity,
    PolicyResult,
    RollbackActionType,
    UaicpAdapter,
    UaicpRollbackAction,
    UaicpState,
    UaicpStreaming,
)


class AutoGenState:
    """
    Represents the native AutoGen conversation state that the adapter consumes.
    AutoGen v0.4 uses ChatResult / TaskResult with a messages list and metadata.
    """

    def __init__(
        self,
        messages: list[dict[str, Any]],
        *,
        parent_trace_id: str | None = None,
        streaming_chunk: dict[str, Any] | None = None,
        metadata: dict[str, Any] | None = None,
    ):
        self.messages = messages
        self.parent_trace_id = parent_trace_id
        self.streaming_chunk = streaming_chunk
        self.metadata = metadata or {}


class AutoGenAdapter(UaicpAdapter):
    """
    Full UAICP v0.3 adapter for Microsoft AutoGen.

    Maps AutoGen's multi-agent conversation events (tool calls, function results,
    swarm handoffs) into strict UAICP MessageEnvelopes with:
    - Swarm hierarchy tracking via parent_trace_id
    - Deep evidence parsing from tool_calls and function_call results
    - Deterministic verification gates
    - Policy enforcement with rollback presence checks
    - Streaming chunk normalization
    """

    def __init__(self, agent_id: str, version: str = "0.3.0"):
        self._agent_id = agent_id
        self._version = version

    # ------------------------------------------------------------------ #
    # Core UAICP Interface
    # ------------------------------------------------------------------ #

    def map_to_envelope(self, state: Any) -> MessageEnvelope:
        """Map AutoGen conversation state → strict UAICP v0.3 MessageEnvelope."""
        if not isinstance(state, AutoGenState):
            raise TypeError(f"Expected AutoGenState, got {type(state).__name__}")

        parent_trace = self._extract_parent_trace(state)
        evidence = self._extract_evidence(state.messages)

        return MessageEnvelope(
            uaicp_version="0.3.0",
            trace_id=f"ag-trace-{int(time.time() * 1000)}",
            parent_trace_id=parent_trace,
            state=UaicpState.EXECUTING,
            identity=AgentIdentity(
                agent_id=self._agent_id,
                agent_type="autogen",
                framework="microsoft-autogen",
                version=self._version,
            ),
            evidence=evidence,
            streaming=self.stream_partial(state.streaming_chunk),
            rollback_action=self.rollback_payload(
                MessageEnvelope(
                    trace_id="temp",
                    state=UaicpState.EXECUTING,
                    identity=AgentIdentity(
                        agent_id=self._agent_id,
                        agent_type="autogen",
                        framework="microsoft-autogen",
                        version=self._version,
                    ),
                )
            ),
        )

    def normalize_evidence(self, tool_call: Any) -> EvidenceObject:
        """Normalize a single AutoGen tool call dict into an EvidenceObject."""
        return EvidenceObject(
            evidence_id=tool_call.get("id", f"ev-{uuid.uuid4().hex[:8]}"),
            evidence_type=EvidenceType.TOOL_OUTPUT,
            source=tool_call.get("name", "unknown_tool"),
            collected_at=_now_iso(),
            payload={"output": tool_call.get("content", tool_call)},
        )

    async def verify_gates(self, envelope: MessageEnvelope) -> bool:
        """Gate 1: Deterministic verification — reject if no evidence exists."""
        if not envelope.evidence:
            return False
        return True

    async def enforce_policy(self, envelope: MessageEnvelope) -> PolicyResult:
        """Gate 2: Policy — block high-risk writes without rollback."""
        if envelope.rollback_action is None:
            return PolicyResult(
                allowed=False,
                reason=(
                    "[UAICP Policy Deny] High-risk operation with no "
                    "rollback_action defined."
                ),
            )
        return PolicyResult(allowed=True, reason="Policy cleared")

    # ------------------------------------------------------------------ #
    # v0.3 Advanced Primitives
    # ------------------------------------------------------------------ #

    def stream_partial(self, chunk: Any) -> Optional[UaicpStreaming]:
        """Map an AutoGen streaming chunk to a UAICP streaming object."""
        if chunk is None:
            return None
        return UaicpStreaming(
            chunk_id=f"chunk-{uuid.uuid4().hex[:8]}",
            is_final=bool(chunk.get("is_final", False)),
            content=str(chunk.get("content", chunk)),
        )

    def rollback_payload(
        self, envelope: MessageEnvelope
    ) -> Optional[UaicpRollbackAction]:
        """Default rollback: MANUAL_INTERVENTION for AutoGen workflows."""
        return UaicpRollbackAction(
            action_type=RollbackActionType.MANUAL_INTERVENTION,
            payload={"note": "Operator manually resolves AutoGen swarm sub-task"},
        )

    # ------------------------------------------------------------------ #
    # Swarm & Evidence Extraction Internals
    # ------------------------------------------------------------------ #

    def _extract_parent_trace(self, state: AutoGenState) -> str | None:
        """
        v0.3 Swarm Tracking.

        AutoGen v0.4 Swarms use handoff messages between agents. The adapter
        checks:
        1. Explicit parent_trace_id on the state (set by parent orchestrator).
        2. A `handoff` message in the conversation carrying a
           `uaicp_parent_trace_id` metadata key.
        3. The `metadata` dict on the state itself.
        """
        # 1. Direct state attribute
        if state.parent_trace_id:
            return state.parent_trace_id

        # 2. Scan messages for swarm handoff metadata
        for msg in state.messages:
            meta = msg.get("metadata", {})
            if isinstance(meta, dict) and "uaicp_parent_trace_id" in meta:
                return meta["uaicp_parent_trace_id"]

            # AutoGen swarm handoffs carry a "handoff" role
            if msg.get("role") == "handoff":
                content = msg.get("content", "")
                if isinstance(content, dict) and "parent_trace_id" in content:
                    return content["parent_trace_id"]

        # 3. State-level metadata
        if "parent_trace_id" in state.metadata:
            return state.metadata["parent_trace_id"]

        return None

    def _extract_evidence(
        self, messages: list[dict[str, Any]]
    ) -> list[EvidenceObject]:
        """
        Parse AutoGen conversation messages into UAICP EvidenceObjects.

        Handles:
        - tool/function role messages → TOOL_OUTPUT evidence
        - assistant messages with tool_calls → EXTERNAL_API intent evidence
        - user messages → HUMAN_INPUT evidence
        """
        evidence: list[EvidenceObject] = []

        for msg in messages:
            role = msg.get("role", "")

            # AutoGen tool/function execution results
            if role in ("tool", "function"):
                evidence.append(
                    EvidenceObject(
                        evidence_id=msg.get(
                            "tool_call_id",
                            f"ev-tool-{uuid.uuid4().hex[:8]}",
                        ),
                        evidence_type=EvidenceType.TOOL_OUTPUT,
                        source=msg.get("name", "unknown_tool"),
                        collected_at=_now_iso(),
                        payload={
                            "tool_call_id": msg.get("tool_call_id"),
                            "output": msg.get("content"),
                        },
                    )
                )

            # Assistant calling tools (intent tracking)
            elif role == "assistant" and "tool_calls" in msg:
                for tc in msg["tool_calls"]:
                    fn = tc.get("function", {})
                    evidence.append(
                        EvidenceObject(
                            evidence_id=tc.get(
                                "id", f"ev-intent-{uuid.uuid4().hex[:8]}"
                            ),
                            evidence_type=EvidenceType.EXTERNAL_API,
                            source=fn.get("name", "llm_agent"),
                            collected_at=_now_iso(),
                            payload={
                                "intent": "TOOL_INVOCATION",
                                "arguments": fn.get("arguments"),
                            },
                        )
                    )

            # Human input messages
            elif role == "user":
                evidence.append(
                    EvidenceObject(
                        evidence_id=f"ev-human-{uuid.uuid4().hex[:8]}",
                        evidence_type=EvidenceType.HUMAN_INPUT,
                        source="user",
                        collected_at=_now_iso(),
                        payload={"content": msg.get("content", "")},
                    )
                )

        return evidence


def _now_iso() -> str:
    """Return current UTC time in ISO 8601 format."""
    from datetime import datetime, timezone

    return datetime.now(timezone.utc).isoformat()
