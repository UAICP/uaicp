# UAICP Core

Universal Agentic Interoperability Control Protocol — Core Types and Interfaces for Python

Version: 0.3.1

## Install

```bash
pip install uaicp-core
```

## What This Package Provides

- UAICP envelope and evidence data models
- adapter interface for framework integrations
- shared protocol primitives for gate enforcement

## Quick Usage

```python
from uaicp_core import MessageEnvelope

envelope = MessageEnvelope(
    uaicp_version="0.3.0",
    trace_id="trace-1",
    state="EXECUTING",
    identity={
        "agent_id": "agent-a",
        "agent_type": "autogen",
        "framework": "autogen",
        "version": "0.4",
    },
    evidence=[],
)
```

## Specification

- https://github.com/UAICP/uaicp/tree/main/specification
