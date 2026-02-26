export type ControlClass = 'autonomous' | 'human-supervised' | 'human-directed';
export type UaicpState = 'intake' | 'plan' | 'execute' | 'verify' | 'deliver' | 'fail_safe';

export interface Attestation {
  issuer: string;
  evidence: string;
  issued_at: string; // ISO 8601 date string
  trust_tier: string;
}

export interface AgentIdentity {
  agent_id: string;
  owner_id: string;
  user_id?: string;
  control_class: ControlClass;
  attestation?: Attestation; // Optional in some contexts, but mandatory for verified hops
}

export type UaicpOutcome = 'success' | 'failure' | 'uncertain' | 'pending';

export interface UaicpEnvelope {
  uaicp_version: string;
  request_id: string; // UUID
  state: UaicpState;
  timestamp: string; // ISO 8601
  trace_id: string;
  identity: AgentIdentity;
  outcome: UaicpOutcome;
  metadata?: Record<string, unknown>;
}

export interface EvidenceObject {
  evidence_id: string;
  evidence_type: 'tool_result' | 'source_citation' | 'test_report' | 'approval_token' | 'custom';
  source: string;
  request_id?: string; // UUID
  trace_id?: string;
  actor?: string;
  hash: string;
  collected_at: string; // ISO 8601
  payload?: any;
}

export type Verdict = 'pass' | 'fail' | 'skip';
export type ReportStatus = 'pass' | 'fail' | 'partial';

export interface VerificationCheck {
  check_id: string;
  result: Verdict;
  details?: string;
}

export interface VerificationReport {
  report_id: string;
  request_id: string; // UUID
  verifier_id?: string;
  evidence_ids?: string[];
  status: ReportStatus;
  checks: VerificationCheck[];
  generated_at: string; // ISO 8601
}
