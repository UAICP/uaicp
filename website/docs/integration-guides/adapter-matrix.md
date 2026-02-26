# Adapter Matrix

UAICP provides official adapters for multiple frameworks across TypeScript, Python, and Rust ecosystems.

| Language | Framework | Adapter Package | Tests | Contract Coverage |
|----------|-----------|-----------------|-------|-------------------|
| TypeScript | LangGraph | `@uaicp/adapter-langgraph` | 12 | Envelope, Evidence, Verify, Policy, Streaming, Rollbacks |
| Python | Microsoft AutoGen v0.4 | `uaicp-adapter-autogen` | 23 | Envelope, Evidence, Verify, Policy, Swarms, Rollbacks |
| Rust | Rig | `uaicp-adapter-rig` | 17 | Envelope, Evidence, Verify, Policy, Streaming, Rollbacks |

## Unofficial / Community Adapters

These adapters follow the UAICP v0.3 contract but are community-maintained:

| Framework | Status | Notes |
|-----------|--------|-------|
| CrewAI | Skeleton available | See [CrewAI Adapter Example](./crewai-adapter-example.md) |
| OpenAI Agents SDK | Skeleton available | See [OpenAI Agents SDK Adapter Example](./openai-agents-sdk-adapter-example.md) |

## Implementation Locations

Official adapters are in the `libs/` directory:

- [libs/typescript/](https://github.com/UAICP/uaicp/tree/main/libs/typescript) — npm workspaces
- [libs/python/](https://github.com/UAICP/uaicp/tree/main/libs/python) — hatch projects
- [libs/rust/](https://github.com/UAICP/uaicp/tree/main/libs/rust) — Cargo workspace

## Shared Verification Anchor

All adapters align to the same contract interface defined in `uaicp-core` for each language:

- TypeScript: `@uaicp/core`
- Python: `uaicp-core`
- Rust: `uaicp-core` (crate)

Each adapter implements the `UaicpAdapter` trait/interface with:
- `map_to_envelope()` — framework state → UAICP envelope
- `normalize_evidence()` — tool call → evidence object
- `verify_gates()` — deterministic evidence verification
- `enforce_policy()` — policy-gated write checks
- `stream_partial()` — UX streaming normalization
- `rollback_payload()` — high-risk operation recovery
