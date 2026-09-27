# Historical planning snapshot

Superseded for new investment on 2026-09-24. Retained for historical requirements; claims below are not revalidated.

# Release Status

## Current Release

- protocol version: `v0.3`
- package release: `0.3.1` (published on February 26, 2026)
- practitioner status: ready to implement
- documentation status: complete implementation guidance is published on this site

## Included in v0.3

- core specification and invariant model
- schema contracts (envelope, evidence, verification report)
- polyglot adapter ecosystem (TypeScript, Python, Rust)
- **52 passing tests** across all official adapters
- adapter contract with language-specific implementations

## Official Adapters

| Language | Framework | Package | Tests |
|----------|-----------|---------|-------|
| TypeScript | LangGraph | `@uaicp/adapter-langgraph` (`0.3.1`) | 12 |
| Python | Microsoft AutoGen v0.4 | `uaicp-adapter-autogen` (`0.3.1`) | 23 |
| Rust | Rig | `uaicp-adapter-rig` (`0.3.1`) | 17 |

## Implementation Path

For adoption, start with:

- [Core Specification](../../../specification/specification.md)
- [Adapter Contract](../../../integration-guides/adapter-contract.md)
- [Adapter Matrix](../../../integration-guides/adapter-matrix.md)

## Quick Start

```bash
# Install published packages

# TypeScript
npm install @uaicp/core @uaicp/adapter-langgraph

# Python
pip install uaicp-core uaicp-adapter-autogen

# Rust
cargo add uaicp-core uaicp-adapter-rig
```

For contributor/source validation in this monorepo:

```bash
# TypeScript
cd libs/typescript && npm install && npm test

# Python
cd libs/python && pip install -e core/ -e adapter-autogen/ && pytest adapter-autogen/tests/

# Rust
cd libs/rust && cargo test --workspace
```

## Contributor Tracking

Enhancements after `v0.3` are tracked in GitHub issues:

- [UAICP Issues](https://github.com/UAICP/uaicp/issues)

## Validation scope and integration work

Adapter unit tests, baseline schema checks, and reference-implementation tests validate different surfaces. A passing count is not certification of an enterprise enforcement boundary.

The native adapter types and baseline JSON schemas currently use different envelope representations (for example, native `EXECUTING` versus schema `execute`, with different required fields). A cross-runtime or enterprise integration must explicitly map and validate those representations. Direct wire compatibility is not established by the individual test suites.

Databridle integration must also validate authenticated approvals, exact-request binding, credentials, execution paths, and evidence handling. See [the ecosystem boundary](../../ecosystem.md).
