//! # uaicp-adapter-rig
//!
//! UAICP v0.3 Reliability Protocol Adapter for Rig
//! (Rust-native AI Agent Framework)
//!
//! Provides strict UAICP envelope mapping for Rig multi-agent conversations,
//! swarm handoff tracking, evidence extraction, gate enforcement, and rollback support.

use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};
use std::collections::HashMap;
use uaicp_core::{
    now_iso, AgentIdentity, EvidenceObject, EvidenceType, MessageEnvelope, PolicyResult,
    RollbackActionType, UaicpAdapter, UaicpRollbackAction, UaicpState,
    UaicpStreaming,
};
use uuid::Uuid;

fn map_to_hashmap(map: Map<String, Value>) -> HashMap<String, Value> {
    map.into_iter().collect()
}

// ============================================================
// Rig Framework Native Types
// ============================================================

/// Represents native Rig conversation state that the adapter consumes.
/// Rig uses a message-based conversation model with agent contexts.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RigState {
    pub messages: Vec<RigMessage>,
    #[serde(default)]
    pub parent_trace_id: Option<String>,
    #[serde(default)]
    pub streaming_chunk: Option<serde_json::Value>,
    #[serde(default)]
    pub metadata: HashMap<String, serde_json::Value>,
}

/// Rig message types - corresponds to Rig's message enum variants.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "role", content = "content")]
pub enum RigMessage {
    #[serde(rename = "user")]
    User(String),
    #[serde(rename = "assistant")]
    Assistant {
        content: Option<String>,
        tool_calls: Option<Vec<RigToolCall>>,
    },
    #[serde(rename = "tool")]
    Tool {
        tool_call_id: String,
        content: String,
        name: Option<String>,
    },
    #[serde(rename = "system")]
    System(String),
    #[serde(rename = "handoff")]
    Handoff {
        target_agent: String,
        content: Option<String>,
        #[serde(default)]
        metadata: HashMap<String, serde_json::Value>,
    },
}

/// Rig tool call representation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RigToolCall {
    pub id: String,
    pub name: String,
    pub arguments: HashMap<String, serde_json::Value>,
}

/// Rig streaming event from agent responses.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RigStreamingEvent {
    pub chunk_id: String,
    pub content: String,
    pub is_final: bool,
}

// ============================================================
// Rig Adapter Implementation
// ============================================================

#[derive(Debug, Clone)]
pub struct RigAdapter {
    agent_id: String,
    version: String,
}

impl RigAdapter {
    pub fn new(agent_id: String, version: &str) -> Self {
        Self {
            agent_id,
            version: version.to_string(),
        }
    }

    fn extract_parent_trace(&self, state: &RigState) -> Option<String> {
        // 1. Direct state attribute
        if state.parent_trace_id.is_some() {
            return state.parent_trace_id.clone();
        }

        // 2. Scan messages for swarm handoff metadata
        for msg in &state.messages {
            if let RigMessage::Handoff { metadata, .. } = msg {
                if let Some(parent) = metadata.get("uaicp_parent_trace_id") {
                    if let Some(s) = parent.as_str() {
                        return Some(s.to_string());
                    }
                }
            }
            // Check assistant message metadata
            if let RigMessage::Assistant { tool_calls, .. } = msg {
                if let Some(calls) = tool_calls {
                    for tc in calls {
                        if let Some(args) = tc.arguments.get("uaicp_parent_trace_id") {
                            if let Some(s) = args.as_str() {
                                return Some(s.to_string());
                            }
                        }
                    }
                }
            }
        }

        // 3. State-level metadata
        if let Some(parent) = state.metadata.get("parent_trace_id") {
            if let Some(s) = parent.as_str() {
                return Some(s.to_string());
            }
        }

        None
    }

    fn extract_evidence(&self, messages: &[RigMessage]) -> Vec<EvidenceObject> {
        let mut evidence = Vec::new();

        for msg in messages {
            match msg {
                RigMessage::Tool {
                    tool_call_id,
                    content,
                    name,
                } => {
                    evidence.push(EvidenceObject {
                        evidence_id: tool_call_id.clone(),
                        evidence_type: EvidenceType::ToolOutput,
                        source: name.clone().unwrap_or_else(|| "unknown_tool".to_string()),
                        collected_at: now_iso(),
                        hash: None,
                        parent_trace_id: None,
                        payload: map_to_hashmap(serde_json::json!({
                            "tool_call_id": tool_call_id,
                            "output": content,
                        }).as_object().cloned().unwrap_or_default()),
                    });
                }
                RigMessage::Assistant {
                    content: _,
                    tool_calls,
                } => {
                    if let Some(calls) = tool_calls {
                        for tc in calls {
                            evidence.push(EvidenceObject {
                                evidence_id: tc.id.clone(),
                                evidence_type: EvidenceType::ExternalApi,
                                source: tc.name.clone(),
                                collected_at: now_iso(),
                                hash: None,
                                parent_trace_id: None,
                            payload: map_to_hashmap(serde_json::json!({
                                "intent": "TOOL_INVOCATION",
                                "arguments": tc.arguments,
                            }).as_object().cloned().unwrap_or_default()),
                            });
                        }
                    }
                }
                RigMessage::User(content) => {
                    evidence.push(EvidenceObject {
                        evidence_id: format!("ev-human-{}", &Uuid::new_v4().to_string()[..8]),
                        evidence_type: EvidenceType::HumanInput,
                        source: "user".to_string(),
                        collected_at: now_iso(),
                        hash: None,
                        parent_trace_id: None,
                        payload: map_to_hashmap(serde_json::json!({ "content": content })
                            .as_object()
                            .cloned()
                            .unwrap_or_default()),
                    });
                }
                RigMessage::Handoff {
                    target_agent,
                    content,
                    metadata,
                } => {
                    let mut payload_map = serde_json::json!({
                        "target_agent": target_agent,
                    })
                    .as_object()
                    .cloned()
                    .unwrap_or_default();
                    if let Some(c) = content {
                        payload_map.insert("content".to_string(), serde_json::json!(c));
                    }
                    for (k, v) in metadata {
                        payload_map.insert(k.clone(), v.clone());
                    }
                    evidence.push(EvidenceObject {
                        evidence_id: format!("ev-handoff-{}", &Uuid::new_v4().to_string()[..8]),
                        evidence_type: EvidenceType::ExternalApi,
                        source: "rig_handoff".to_string(),
                        collected_at: now_iso(),
                        hash: None,
                        parent_trace_id: metadata
                            .get("uaicp_parent_trace_id")
                            .and_then(|v| v.as_str())
                            .map(|s| s.to_string()),
                        payload: map_to_hashmap(payload_map),
                    });
                }
                RigMessage::System(_) => {}
            }
        }

        evidence
    }
}

#[async_trait]
impl UaicpAdapter for RigAdapter {
    type FrameworkState = RigState;
    type FrameworkToolCall = RigToolCall;

    fn map_to_envelope(&self, state: &Self::FrameworkState) -> MessageEnvelope {
        let parent_trace = self.extract_parent_trace(state);
        let evidence = self.extract_evidence(&state.messages);

        let temp_envelope = MessageEnvelope {
            uaicp_version: "0.3.0".to_string(),
            trace_id: format!("rig-trace-{}", Uuid::new_v4()),
            parent_trace_id: parent_trace.clone(),
            state: UaicpState::Executing,
            identity: AgentIdentity {
                agent_id: self.agent_id.clone(),
                agent_type: "rig".to_string(),
                framework: "rig-rs".to_string(),
                version: self.version.clone(),
            },
            evidence: evidence.clone(),
            outcome: None,
            streaming: state.streaming_chunk.as_ref().and_then(|v| self.stream_partial(v)),
            rollback_action: self.rollback_payload(&MessageEnvelope {
                uaicp_version: "0.3.0".to_string(),
                trace_id: "temp".to_string(),
                parent_trace_id: parent_trace,
                state: UaicpState::Executing,
                identity: AgentIdentity {
                    agent_id: self.agent_id.clone(),
                    agent_type: "rig".to_string(),
                    framework: "rig-rs".to_string(),
                    version: self.version.clone(),
                },
                evidence,
                outcome: None,
                streaming: None,
                rollback_action: None,
            }),
        };

        temp_envelope
    }

    fn normalize_evidence(&self, tool_call: &Self::FrameworkToolCall) -> EvidenceObject {
        EvidenceObject {
            evidence_id: tool_call.id.clone(),
            evidence_type: EvidenceType::ToolOutput,
            source: tool_call.name.clone(),
            collected_at: now_iso(),
            hash: None,
            parent_trace_id: None,
            payload: tool_call.arguments.clone(),
        }
    }

    async fn verify_gates(&self, envelope: &MessageEnvelope) -> bool {
        // Gate 1: Deterministic verification — reject if no evidence exists
        !envelope.evidence.is_empty()
    }

    async fn enforce_policy(&self, envelope: &MessageEnvelope) -> PolicyResult {
        // Gate 2: Policy enforcement — block high-risk writes without rollback
        if envelope.rollback_action.is_none() {
            PolicyResult {
                allowed: false,
                reason: "[UAICP Policy Deny] High-risk operation with no rollback_action defined.".to_string(),
                requires_review: true,
            }
        } else {
            PolicyResult {
                allowed: true,
                reason: "Policy cleared".to_string(),
                requires_review: false,
            }
        }
    }

    fn stream_partial(&self, chunk: &serde_json::Value) -> Option<UaicpStreaming> {
        if chunk.is_null() {
            return None;
        }
        Some(UaicpStreaming {
            chunk_id: chunk
                .get("chunk_id")
                .and_then(|v| v.as_str())
                .map(|s| s.to_string())
                .unwrap_or_else(|| format!("chunk-{}", &Uuid::new_v4().to_string()[..8])),
            is_final: chunk
                .get("is_final")
                .and_then(|v| v.as_bool())
                .unwrap_or(false),
            content: chunk
                .get("content")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string(),
        })
    }

    fn rollback_payload(&self, envelope: &MessageEnvelope) -> Option<UaicpRollbackAction> {
        // Default rollback for Rig: compensating tool call strategy
        // Check if there are any tool calls that could be compensated
        let has_tool_evidence = envelope
            .evidence
            .iter()
            .any(|e| e.evidence_type == EvidenceType::ToolOutput);

        if has_tool_evidence {
            let tool_ids: Vec<String> = envelope
                .evidence
                .iter()
                .filter(|e| e.evidence_type == EvidenceType::ToolOutput)
                .map(|e| e.evidence_id.clone())
                .collect();

            Some(UaicpRollbackAction {
                action_type: RollbackActionType::CompensatingToolCall,
                payload: map_to_hashmap(serde_json::json!({
                    "compensate_tools": tool_ids,
                    "strategy": "reverse_tool_invocation_order"
                })
                .as_object()
                .cloned()
                .unwrap_or_default()),
            })
        } else {
            Some(UaicpRollbackAction {
                action_type: RollbackActionType::ManualIntervention,
                payload: map_to_hashmap(serde_json::json!({
                    "note": "Operator manually resolves Rig swarm sub-task"
                })
                .as_object()
                .cloned()
                .unwrap_or_default()),
            })
        }
    }
}

// ============================================================
// Tests
// ============================================================

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_state() -> RigState {
        RigState {
            messages: vec![
                RigMessage::User("Calculate 2+2".to_string()),
                RigMessage::Assistant {
                    content: None,
                    tool_calls: Some(vec![RigToolCall {
                        id: "call-123".to_string(),
                        name: "calculator".to_string(),
                        arguments: map_to_hashmap(serde_json::json!({"expr": "2+2"}).as_object().cloned().unwrap_or_default()),
                    }]),
                },
                RigMessage::Tool {
                    tool_call_id: "call-123".to_string(),
                    content: "4".to_string(),
                    name: Some("calculator".to_string()),
                },
            ],
            parent_trace_id: Some("parent-trace-abc".to_string()),
            streaming_chunk: None,
            metadata: HashMap::new(),
        }
    }

    #[test]
    fn test_adapter_creation() {
        let adapter = RigAdapter::new("test-agent".to_string(), "0.3.0");
        assert_eq!(adapter.agent_id, "test-agent");
        assert_eq!(adapter.version, "0.3.0");
    }

    #[test]
    fn test_map_to_envelope() {
        let adapter = RigAdapter::new("test-agent".to_string(), "0.3.0");
        let state = create_test_state();

        let envelope = adapter.map_to_envelope(&state);

        assert_eq!(envelope.uaicp_version, "0.3.0");
        assert!(envelope.trace_id.starts_with("rig-trace-"));
        assert_eq!(envelope.parent_trace_id, Some("parent-trace-abc".to_string()));
        assert_eq!(envelope.state, UaicpState::Executing);
        assert_eq!(envelope.identity.agent_type, "rig");
        assert_eq!(envelope.identity.framework, "rig-rs");
        assert!(!envelope.evidence.is_empty());
    }

    #[test]
    fn test_extract_parent_trace_from_state() {
        let adapter = RigAdapter::new("test-agent".to_string(), "0.3.0");
        let state = create_test_state();

        let parent = adapter.extract_parent_trace(&state);
        assert_eq!(parent, Some("parent-trace-abc".to_string()));
    }

    #[test]
    fn test_extract_parent_trace_from_handoff_metadata() {
        let adapter = RigAdapter::new("test-agent".to_string(), "0.3.0");
        let mut metadata = HashMap::new();
        metadata.insert(
            "uaicp_parent_trace_id".to_string(),
            serde_json::json!("handoff-trace-xyz"),
        );

        let state = RigState {
            messages: vec![RigMessage::Handoff {
                target_agent: "agent-b".to_string(),
                content: Some("Handing off".to_string()),
                metadata,
            }],
            parent_trace_id: None,
            streaming_chunk: None,
            metadata: HashMap::new(),
        };

        let parent = adapter.extract_parent_trace(&state);
        assert_eq!(parent, Some("handoff-trace-xyz".to_string()));
    }

    #[test]
    fn test_extract_evidence_from_messages() {
        let adapter = RigAdapter::new("test-agent".to_string(), "0.3.0");
        let state = create_test_state();

        let evidence = adapter.extract_evidence(&state.messages);

        // Should have: user message, tool call (intent), tool result
        assert!(evidence.len() >= 3);

        let human_input = evidence
            .iter()
            .find(|e| e.evidence_type == EvidenceType::HumanInput);
        assert!(human_input.is_some());

        let tool_output = evidence
            .iter()
            .find(|e| e.evidence_type == EvidenceType::ToolOutput);
        assert!(tool_output.is_some());

        let external_api = evidence
            .iter()
            .find(|e| e.evidence_type == EvidenceType::ExternalApi);
        assert!(external_api.is_some());
    }

    #[test]
    fn test_normalize_evidence() {
        let adapter = RigAdapter::new("test-agent".to_string(), "0.3.0");
        let tool_call = RigToolCall {
            id: "call-456".to_string(),
            name: "search".to_string(),
            arguments: map_to_hashmap(serde_json::json!({"query": "test"}).as_object().cloned().unwrap_or_default()),
        };

        let evidence = adapter.normalize_evidence(&tool_call);

        assert_eq!(evidence.evidence_id, "call-456");
        assert_eq!(evidence.evidence_type, EvidenceType::ToolOutput);
        assert_eq!(evidence.source, "search");
        assert!(evidence.payload.contains_key("query"));
    }

    #[tokio::test]
    async fn test_verify_gates_with_evidence() {
        let adapter = RigAdapter::new("test-agent".to_string(), "0.3.0");
        let state = create_test_state();
        let envelope = adapter.map_to_envelope(&state);

        let result = adapter.verify_gates(&envelope).await;
        assert!(result);
    }

    #[tokio::test]
    async fn test_verify_gates_without_evidence() {
        let adapter = RigAdapter::new("test-agent".to_string(), "0.3.0");
        let state = RigState {
            messages: vec![],
            parent_trace_id: None,
            streaming_chunk: None,
            metadata: HashMap::new(),
        };
        let envelope = adapter.map_to_envelope(&state);

        let result = adapter.verify_gates(&envelope).await;
        assert!(!result);
    }

    #[tokio::test]
    async fn test_enforce_policy_with_rollback() {
        let adapter = RigAdapter::new("test-agent".to_string(), "0.3.0");
        let state = create_test_state();
        let envelope = adapter.map_to_envelope(&state);

        let result = adapter.enforce_policy(&envelope).await;
        assert!(result.allowed);
        assert!(!result.requires_review);
    }

    #[tokio::test]
    async fn test_enforce_policy_without_rollback() {
        let adapter = RigAdapter::new("test-agent".to_string(), "0.3.0");
        // Create envelope without rollback
        let envelope = MessageEnvelope {
            uaicp_version: "0.3.0".to_string(),
            trace_id: "test-trace".to_string(),
            parent_trace_id: None,
            state: UaicpState::Executing,
            identity: AgentIdentity {
                agent_id: "test".to_string(),
                agent_type: "rig".to_string(),
                framework: "rig-rs".to_string(),
                version: "0.3.0".to_string(),
            },
            evidence: vec![],
            outcome: None,
            streaming: None,
            rollback_action: None,
        };

        let result = adapter.enforce_policy(&envelope).await;
        assert!(!result.allowed);
        assert!(result.requires_review);
    }

    #[test]
    fn test_stream_partial_with_chunk() {
        let adapter = RigAdapter::new("test-agent".to_string(), "0.3.0");
        let chunk = serde_json::json!({
            "chunk_id": "chunk-1",
            "content": "Hello",
            "is_final": false
        });

        let streaming = adapter.stream_partial(&chunk);

        assert!(streaming.is_some());
        let s = streaming.unwrap();
        assert_eq!(s.chunk_id, "chunk-1");
        assert_eq!(s.content, "Hello");
        assert!(!s.is_final);
    }

    #[test]
    fn test_stream_partial_with_null() {
        let adapter = RigAdapter::new("test-agent".to_string(), "0.3.0");
        let chunk = serde_json::Value::Null;

        let streaming = adapter.stream_partial(&chunk);
        assert!(streaming.is_none());
    }

    #[test]
    fn test_rollback_payload_with_tools() {
        let adapter = RigAdapter::new("test-agent".to_string(), "0.3.0");
        let state = create_test_state();
        let envelope = adapter.map_to_envelope(&state);

        let rollback = adapter.rollback_payload(&envelope);

        assert!(rollback.is_some());
        let rb = rollback.unwrap();
        assert_eq!(rb.action_type, RollbackActionType::CompensatingToolCall);
        assert!(rb.payload.contains_key("compensate_tools"));
    }

    #[test]
    fn test_rollback_payload_without_tools() {
        let adapter = RigAdapter::new("test-agent".to_string(), "0.3.0");
        let envelope = MessageEnvelope {
            uaicp_version: "0.3.0".to_string(),
            trace_id: "test".to_string(),
            parent_trace_id: None,
            state: UaicpState::Executing,
            identity: AgentIdentity {
                agent_id: "test".to_string(),
                agent_type: "rig".to_string(),
                framework: "rig-rs".to_string(),
                version: "0.3.0".to_string(),
            },
            evidence: vec![],
            outcome: None,
            streaming: None,
            rollback_action: None,
        };

        let rollback = adapter.rollback_payload(&envelope);

        assert!(rollback.is_some());
        let rb = rollback.unwrap();
        assert_eq!(rb.action_type, RollbackActionType::ManualIntervention);
    }

    #[test]
    fn test_envelope_state_inference() {
        let adapter = RigAdapter::new("test-agent".to_string(), "0.3.0");
        
        // Test with different message compositions
        let planning_state = RigState {
            messages: vec![RigMessage::User("What should I do?".to_string())],
            parent_trace_id: None,
            streaming_chunk: None,
            metadata: HashMap::new(),
        };
        let envelope = adapter.map_to_envelope(&planning_state);
        
        // Rig adapter defaults to Executing state (can be enhanced with smarter inference)
        assert_eq!(envelope.state, UaicpState::Executing);
    }

    #[test]
    fn test_swarm_handoff_tracking() {
        let adapter = RigAdapter::new("orchestrator".to_string(), "0.3.0");
        
        // Parent orchestrator creates child with trace ID
        let child_state = RigState {
            messages: vec![RigMessage::Handoff {
                target_agent: "worker-1".to_string(),
                content: Some("Process this task".to_string()),
                metadata: HashMap::new(),
            }],
            parent_trace_id: Some("orchestrator-trace-001".to_string()),
            streaming_chunk: None,
            metadata: HashMap::new(),
        };

        let envelope = adapter.map_to_envelope(&child_state);
        
        assert_eq!(envelope.parent_trace_id, Some("orchestrator-trace-001".to_string()));
        
        // Check that handoff itself is recorded as evidence
        let handoff_evidence = envelope.evidence.iter()
            .find(|e| e.source == "rig_handoff");
        assert!(handoff_evidence.is_some());
    }

    #[test]
    fn test_streaming_chunk_extraction() {
        let adapter = RigAdapter::new("test-agent".to_string(), "0.3.0");
        
        let state = RigState {
            messages: vec![],
            parent_trace_id: None,
            streaming_chunk: Some(serde_json::json!({
                "chunk_id": "stream-1",
                "content": "Thinking...",
                "is_final": false
            })),
            metadata: HashMap::new(),
        };

        let envelope = adapter.map_to_envelope(&state);
        
        assert!(envelope.streaming.is_some());
        let streaming = envelope.streaming.unwrap();
        assert_eq!(streaming.content, "Thinking...");
        assert!(!streaming.is_final);
    }
}
