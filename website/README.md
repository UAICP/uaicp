# UAICP Website

Public documentation site for UAICP.

UAICP (Universal Agentic Interoperability Control Protocol) is the open reliability contract for agent workflows.
UAICP is an open-source contribution initiated by **Prismworks AI** ([prismworks.ai](https://prismworks.ai)) and developed with community contributions.

## Documentation Scope

This site is the complete reference for:

- protocol overview and integration model
- adapter contract and framework-specific adapter guidance
- polyglot adapter ecosystem (TypeScript, Python, Rust)
- governance and contribution entry points

Naming and public scope are defined in [POSITIONING.md](../POSITIONING.md). The [ecosystem page](docs/governance/ecosystem.md) explains the independently usable protocol and its relationship to Prismworks and Databridle.

## Canonical Sources

### Specification

- [specification/](https://github.com/UAICP/uaicp/tree/main/specification)
- Canonical docs source: `../specification/docs/`
- Sync website mirrors: `npm run sync:docs`

### Adapter Implementations

| Language | Location | Tests |
|----------|----------|-------|
| TypeScript | [libs/typescript/](https://github.com/UAICP/uaicp/tree/main/libs/typescript) | 12 |
| Python | [libs/python/](https://github.com/UAICP/uaicp/tree/main/libs/python) | 23 |
| Rust | [libs/rust/](https://github.com/UAICP/uaicp/tree/main/libs/rust) | 17 |

## Contributor Tracking

Post-`v0.3` enhancements are tracked in GitHub issues:

- [UAICP Issues](https://github.com/UAICP/uaicp/issues)

## Local Development

```bash
npm install
npm run start
```

## Build

```bash
npm run build
npm run serve
```

## Docs Sync Validation

```bash
npm run check:docs-sync
```

## License

- Code and site implementation artifacts: Apache-2.0
- Documentation content: CC BY 4.0
- Attribution details: see `NOTICE`
