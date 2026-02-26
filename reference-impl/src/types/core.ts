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
  control_class: ControlClass;
  attestation?: Attestation; // Optional in some contexts, but mandatory for verified hops
}

export interface UaicpEnvelope {
  uaicp_version: string;
  request_id: string;
  state: UaicpState;
  timestamp: string;
  trace_id: string;
  identity: AgentIdentity;
  metadata?: Record<string, unknown>;
}
