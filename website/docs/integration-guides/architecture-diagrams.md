# Architecture Diagrams

This page provides visual references for UAICP protocol architecture, cross-framework terminology mapping, and framework-specific integration patterns.

## 1. Generic UAICP Architecture

```mermaid
flowchart LR
    U[User Request] --> F[Framework Runtime\nOrchestrator + Tool Router]

    subgraph UAICP[UAICP Reliability Layer]
      E[Envelope Mapping]
      EV[Evidence Normalization]
      V[Verification Gate]
      P[Policy Gate]
      A[Audit Event Emission]
    end

    F --> E --> EV --> V --> P
    E --> A
    EV --> A
    V --> A
    P --> A

    P -->|allow| D[Deliver]
    P -->|deny| FS[Fail Safe]
    P -->|needs_review| R[Needs Review]
```

## 2. Terminology Mapping Across Frameworks

```mermaid
flowchart TD
    subgraph UAICP[UAICP Primitives]
      U1[Envelope]
      U2[Evidence]
      U3[Verification]
      U4[Policy Gate]
      U5[Audit]
    end

    subgraph LG[LangGraph-style]
      L1[Graph State]
      L2[Node Outputs]
      L3[Verify Node]
      L4[Approval Node]
      L5[Terminal Transition]
    end

    subgraph AG[AutoGen]
      A1[Task Context]
      A2[Tool Events]
      A3[Validation Step]
      A4[Approval Metadata]
      A5[Final Answer Stage]
    end

    subgraph CW[CrewAI]
      C1[Task Context]
      C2[Crew Step Artifacts]
      C3[Completion Check]
      C4[Risk + Approval Check]
      C5[Output Finalization]
    end

    subgraph OA[OpenAI Agents SDK]
      O1[Run Input]
      O2[Tool Calls + Messages]
      O3[Verifier Call]
      O4[Write-Risk Gate]
      O5[Output Publish]
    end

    L1 --> U1
    L2 --> U2
    L3 --> U3
    L4 --> U4
    L5 --> U5

    A1 --> U1
    A2 --> U2
    A3 --> U3
    A4 --> U4
    A5 --> U5

    C1 --> U1
    C2 --> U2
    C3 --> U3
    C4 --> U4
    C5 --> U5

    O1 --> U1
    O2 --> U2
    O3 --> U3
    O4 --> U4
    O5 --> U5
```

## 3. Framework-Specific Flow Patterns

### LangGraph-Style Runtime

```mermaid
flowchart LR
    LP[Planner Node] --> LT[Tool Nodes]
    LT --> LM[mapEnvelope + collectEvidence]
    LM --> LV[runVerifier]
    LV --> LPOL[runPolicyGate]
    LPOL -->|allow| LD[deliver]
    LPOL -->|needs_review| LNR[needs_review]
    LPOL -->|deny/fail| LFS[fail_safe]
```

### AutoGen Runtime

```mermaid
flowchart LR
    AT[autogen.run task] --> AM[mapEnvelopeFromTask]
    AT --> AE[normalizeToolEvents]
    AM --> AV[runVerifier]
    AE --> AV
    AV --> AP[runPolicyGate]
    AP -->|allow| AD[deliver finalAnswer]
    AP -->|blocked| AFS[fail_safe]
```

### CrewAI Runtime

```mermaid
flowchart LR
    CR[runCrew taskCtx] --> CM[mapEnvelope]
    CR --> CE[normalizeCrewEvidence]
    CM --> CV[runVerifier]
    CE --> CV
    CV --> CP[runPolicyGate]
    CP -->|allow| CD[deliver output]
    CP -->|needs_review| CNR[reviewRequired]
    CP -->|deny| CFS[fail_safe]
```

### OpenAI Agents SDK Runtime

```mermaid
flowchart LR
    OR[agent.run input] --> OM[mapEnvelope]
    OR --> OE[collectRunEvidence]
    OM --> OV[runVerifier]
    OE --> OV
    OV --> OP[runPolicyGate]
    OP -->|allow| OD[deliver outputText]
    OP -->|blocked| OFS[fail_safe]
```
