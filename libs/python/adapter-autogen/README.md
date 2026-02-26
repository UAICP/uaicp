# UAICP Adapter AutoGen

UAICP v0.3 Reliability Protocol Adapter for Microsoft AutoGen

Version: 0.3.1

## Install

```bash
pip install uaicp-adapter-autogen
```

## What This Package Provides

- AutoGen-to-UAICP envelope mapping
- evidence normalization for tool and model events
- verification and policy gate hooks
- rollback payload support for high-risk writes

## Quick Usage

```python
from uaicp_adapter_autogen import AutoGenAdapter, AutoGenState

adapter = AutoGenAdapter(agent_id="agent-a")
envelope = adapter.map_to_envelope(AutoGenState(messages=[]))
```

## Related Packages

- `uaicp-core` for protocol primitives
