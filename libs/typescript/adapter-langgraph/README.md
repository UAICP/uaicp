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
