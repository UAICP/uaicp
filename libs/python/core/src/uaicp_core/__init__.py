"""
uaicp-core
Universal Agentic Interoperability Control Protocol — Python Primitives
Version: 0.3.0
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


# --- v0.3 Core Enumerations ---

class EvidenceType(str, Enum):
    TOOL_OUTPUT = "TOOL_OUTPUT"
    EXTERNAL_API = "EXTERNAL_API"
    HUMAN_INPUT = "HUMAN_INPUT"
    DOCUMENT_REFERENCE = "DOCUMENT_REFERENCE"


class UaicpState(str, Enum):
    INTAKE = "INTAKE"
    PLANNING = "PLANNING"
    EXECUTING = "EXECUTING"
    VERIFICATION = "VERIFICATION"
    DELIVERY = "DELIVERY"


class RollbackActionType(str, Enum):
    COMPENSATING_TOOL_CALL = "COMPENSATING_TOOL_CALL"
    REVERT_API = "REVERT_API"
    MANUAL_INTERVENTION = "MANUAL_INTERVENTION"


class PolicyOutcomeStatus(str, Enum):
    ALLOW = "allow"
    DENY = "deny"
    NEEDS_REVIEW = "needs_review"
    FAIL_SAFE = "fail_safe"


# --- v0.3 Core Data Models ---

class EvidenceObject(BaseModel):
    evidence_id: str
    evidence_type: EvidenceType
    source: str
    collected_at: str  # ISO 8601
    hash: Optional[str] = None  # SHA-256 for integrity
    parent_trace_id: Optional[str] = None  # v0.3: Swarm hierarchy
    payload: dict[str, Any] = Field(default_factory=dict)


class UaicpRollbackAction(BaseModel):
    action_type: RollbackActionType
    payload: dict[str, Any] = Field(default_factory=dict)


class UaicpStreaming(BaseModel):
    chunk_id: str
    is_final: bool
    content: str


class AgentIdentity(BaseModel):
    agent_id: str
    agent_type: str
    framework: str
    version: str


class PolicyOutcome(BaseModel):
    status: PolicyOutcomeStatus
    reason_code: str
    resolution: Optional[str] = None


class MessageEnvelope(BaseModel):
    uaicp_version: str = "0.3.0"
    trace_id: str
    parent_trace_id: Optional[str] = None  # v0.3: Swarm hierarchy
    state: UaicpState

    identity: AgentIdentity
    evidence: list[EvidenceObject] = Field(default_factory=list)
    outcome: Optional[PolicyOutcome] = None
    streaming: Optional[UaicpStreaming] = None  # v0.3: UX partial streams
    rollback_action: Optional[UaicpRollbackAction] = None  # v0.3: High-risk recovery


# --- v0.3 Adapter Interface ---

class PolicyResult(BaseModel):
    allowed: bool
    reason: str
    requires_review: bool = False


class UaicpAdapter(ABC):
    """Common Adapter Interface for enforcing UAICP gating mechanics."""

    @abstractmethod
    def map_to_envelope(self, state: Any) -> MessageEnvelope:
        """Map framework-native state to a strict UAICP MessageEnvelope."""
        ...

    @abstractmethod
    def normalize_evidence(self, tool_call: Any) -> EvidenceObject:
        """Normalize a framework tool call/output into a UAICP EvidenceObject."""
        ...

    @abstractmethod
    async def verify_gates(self, envelope: MessageEnvelope) -> bool:
        """Gate 1: Deterministic verification — does collected evidence support delivery?"""
        ...

    @abstractmethod
    async def enforce_policy(self, envelope: MessageEnvelope) -> PolicyResult:
        """Gate 2: Policy enforcement — high-risk write checks + rollback presence."""
        ...

    # v0.3 Streaming & Rollback hooks (optional)
    def stream_partial(self, chunk: Any) -> Optional[UaicpStreaming]:
        """Map a framework streaming chunk into UAICP streaming format."""
        return None

    def rollback_payload(self, envelope: MessageEnvelope) -> Optional[UaicpRollbackAction]:
        """Generate a rollback action for high-risk operations."""
        return None
