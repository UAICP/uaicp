//! # uaicp-core
//!
//! Universal Agentic Interoperability Control Protocol — Rust Primitives
//! Version: 0.3.0
//!
//! Provides the canonical types, enums, and trait interface for building
//! UAICP-compliant adapters in the Rust ecosystem.

use async_trait::async_trait;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// ============================================================
// v0.3 Core Enumerations
// ============================================================

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum EvidenceType {
    ToolOutput,
    ExternalApi,
    HumanInput,
    DocumentReference,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum UaicpState {
    Intake,
    Planning,
    Executing,
    Verification,
    Delivery,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum RollbackActionType {
    CompensatingToolCall,
    RevertApi,
    ManualIntervention,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum PolicyOutcomeStatus {
    Allow,
    Deny,
    NeedsReview,
    FailSafe,
}

// ============================================================
// v0.3 Core Data Models
// ============================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvidenceObject {
    pub evidence_id: String,
    pub evidence_type: EvidenceType,
    pub source: String,
    pub collected_at: String, // ISO 8601
    #[serde(skip_serializing_if = "Option::is_none")]
    pub hash: Option<String>, // SHA-256
    #[serde(skip_serializing_if = "Option::is_none")]
    pub parent_trace_id: Option<String>, // v0.3: Swarm hierarchy
    pub payload: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UaicpRollbackAction {
    pub action_type: RollbackActionType,
    pub payload: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UaicpStreaming {
    pub chunk_id: String,
    pub is_final: bool,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentIdentity {
    pub agent_id: String,
    pub agent_type: String,
    pub framework: String,
    pub version: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PolicyOutcome {
    pub status: PolicyOutcomeStatus,
    pub reason_code: String,
    pub resolution: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessageEnvelope {
    pub uaicp_version: String,
    pub trace_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub parent_trace_id: Option<String>, // v0.3: Swarm hierarchy
    pub state: UaicpState,
    pub identity: AgentIdentity,
    pub evidence: Vec<EvidenceObject>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub outcome: Option<PolicyOutcome>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub streaming: Option<UaicpStreaming>, // v0.3: UX partial streams
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rollback_action: Option<UaicpRollbackAction>, // v0.3: High-risk recovery
}

// ============================================================
// v0.3 Policy Result
// ============================================================

#[derive(Debug, Clone)]
pub struct PolicyResult {
    pub allowed: bool,
    pub reason: String,
    pub requires_review: bool,
}

// ============================================================
// v0.3 Adapter Trait
// ============================================================

#[async_trait]
pub trait UaicpAdapter: Send + Sync {
    type FrameworkState;
    type FrameworkToolCall;

    /// Map framework-native state to a strict UAICP MessageEnvelope.
    fn map_to_envelope(&self, state: &Self::FrameworkState) -> MessageEnvelope;

    /// Normalize a framework tool call/output into a UAICP EvidenceObject.
    fn normalize_evidence(&self, tool_call: &Self::FrameworkToolCall) -> EvidenceObject;

    /// Gate 1: Deterministic verification — does evidence support delivery?
    async fn verify_gates(&self, envelope: &MessageEnvelope) -> bool;

    /// Gate 2: Policy enforcement — high-risk write checks + rollback presence.
    async fn enforce_policy(&self, envelope: &MessageEnvelope) -> PolicyResult;

    /// v0.3: Map a streaming chunk to UAICP format (optional).
    fn stream_partial(&self, chunk: &serde_json::Value) -> Option<UaicpStreaming> {
        let _ = chunk;
        None
    }

    /// v0.3: Generate a rollback action for high-risk operations (optional).
    fn rollback_payload(&self, envelope: &MessageEnvelope) -> Option<UaicpRollbackAction> {
        let _ = envelope;
        None
    }
}

/// Utility: Return current UTC time as ISO 8601 string.
pub fn now_iso() -> String {
    Utc::now().to_rfc3339()
}
