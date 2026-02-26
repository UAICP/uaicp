# uaicp-adapter-rig

UAICP `v0.3` adapter for Rig.

## Install

```bash
cargo add uaicp-core uaicp-adapter-rig
```

## Usage

```rust
use uaicp_adapter_rig::{RigAdapter, RigState};
use uaicp_core::UaicpAdapter;

let adapter = RigAdapter::new("agent-id".to_string(), "0.3.0");
let envelope = adapter.map_to_envelope(&RigState {
    messages: vec![],
    parent_trace_id: None,
    streaming_chunk: None,
    metadata: std::collections::HashMap::new(),
});
```

## Related

- `uaicp-core`
- https://github.com/UAICP/uaicp/tree/main/specification
