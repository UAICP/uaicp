# @uaicp/core

Core UAICP types and interfaces for TypeScript.

Version: `0.3.1`

## Install

```bash
npm install @uaicp/core
```

## Usage

```ts
import type { MessageEnvelope, UaicpAdapter } from '@uaicp/core';

const envelope: MessageEnvelope = {
  uaicp_version: '0.3.0',
  trace_id: 'trace-1',
  state: 'EXECUTING',
  identity: {
    agent_id: 'agent-a',
    agent_type: 'langgraph',
    framework: 'langchain',
    version: '0.3.0',
  },
  evidence: [],
};
```

## Spec

- https://github.com/UAICP/uaicp/tree/main/specification
