# @uaicp/adapter-langgraph

UAICP `v0.3` adapter for LangGraph.

## Install

```bash
npm install @uaicp/core @uaicp/adapter-langgraph
```

## Usage

```ts
import { LangGraphAdapter } from '@uaicp/adapter-langgraph';

const adapter = new LangGraphAdapter('agent-id');
const envelope = adapter.mapToEnvelope({ messages: [] });
```

## Related

- `@uaicp/core`
- https://github.com/UAICP/uaicp/tree/main/specification

## Runtime dependencies

The adapter maps framework message/state objects through their structural interface. It does not import LangChain or LangGraph at runtime; applications install their chosen framework version separately. The package depends on `@uaicp/core`. Tests run from source, and generated test files are excluded from package builds.
