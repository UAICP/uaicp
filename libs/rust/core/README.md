# uaicp-core

Core UAICP types and traits for Rust.

Version: `0.3.1`

## Install

```bash
cargo add uaicp-core
```

## Usage

```rust
use uaicp_core::{MessageEnvelope, UaicpState};

let envelope = MessageEnvelope {
    uaicp_version: "0.3.0".to_string(),
    trace_id: "trace-1".to_string(),
    parent_trace_id: None,
    state: UaicpState::Executing,
    identity: uaicp_core::AgentIdentity {
        agent_id: "agent-a".to_string(),
        agent_type: "rig".to_string(),
        framework: "rig-rs".to_string(),
        version: "0.3.0".to_string(),
    },
    evidence: vec![],
    outcome: None,
    streaming: None,
    rollback_action: None,
};
```

## Spec

- https://github.com/UAICP/uaicp/tree/main/specification
