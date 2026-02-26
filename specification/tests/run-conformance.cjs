const fs = require('fs');
const path = require('path');
const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');

const ROOT = path.resolve(__dirname, '..');
const REQUIRED_STATES = ['intake', 'plan', 'execute', 'verify', 'deliver', 'fail_safe'];

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function readText(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function deepEqualArray(a, b) {
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i]);
}

const packageJson = readJson('package.json');
const messageEnvelopeSchema = readJson('schema/message-envelope.schema.json');
const evidenceObjectSchema = readJson('schema/evidence-object.schema.json');
const verificationReportSchema = readJson('schema/verification-report.schema.json');

const adapterContractDoc = readText('docs/integration-guides/ADAPTER-CONTRACT.md');

const fixtures = {
  envelopeValid: readJson('tests/fixtures/message-envelope.valid.json'),
  envelopeInvalidMissingState: readJson('tests/fixtures/message-envelope.invalid-missing-state.json'),
  evidenceValid: readJson('tests/fixtures/evidence-object.valid.json'),
  evidenceInvalidMissingSource: readJson('tests/fixtures/evidence-object.invalid-missing-source.json'),
  verificationValid: readJson('tests/fixtures/verification-report.valid.json'),
  verificationInvalidMissingChecks: readJson('tests/fixtures/verification-report.invalid-missing-checks.json'),
};

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const validateEnvelope = ajv.compile(messageEnvelopeSchema);
const validateEvidence = ajv.compile(evidenceObjectSchema);
const validateVerification = ajv.compile(verificationReportSchema);

const checks = [];

function addCheck(category, id, passed, details = null) {
  checks.push({ category, id, passed, details });
}

function runValidationCheck(category, id, validator, payload, expectedValid) {
  const actual = !!validator(payload);
  addCheck(
    category,
    id,
    actual === expectedValid,
    actual === expectedValid ? null : { expectedValid, actual, errors: validator.errors || [] },
  );
}

// 1) State Machine Compliance
addCheck(
  'State Machine Compliance',
  'required_states_exact_match',
  deepEqualArray(messageEnvelopeSchema.properties.state.enum, REQUIRED_STATES),
  {
    expected: REQUIRED_STATES,
    actual: messageEnvelopeSchema.properties.state.enum,
  },
);
addCheck(
  'State Machine Compliance',
  'state_required_in_envelope',
  messageEnvelopeSchema.required.includes('state'),
  { required: messageEnvelopeSchema.required },
);
runValidationCheck('State Machine Compliance', 'valid_envelope_passes_schema', validateEnvelope, fixtures.envelopeValid, true);
runValidationCheck(
  'State Machine Compliance',
  'missing_state_fails_schema',
  validateEnvelope,
  fixtures.envelopeInvalidMissingState,
  false,
);

// 2) Evidence Gating Compliance
runValidationCheck('Evidence Gating Compliance', 'valid_evidence_passes_schema', validateEvidence, fixtures.evidenceValid, true);
runValidationCheck(
  'Evidence Gating Compliance',
  'missing_source_fails_schema',
  validateEvidence,
  fixtures.evidenceInvalidMissingSource,
  false,
);
addCheck(
  'Evidence Gating Compliance',
  'tool_result_enum_present',
  evidenceObjectSchema.properties.evidence_type.enum.includes('tool_result'),
  { enum: evidenceObjectSchema.properties.evidence_type.enum },
);

// 3) Verification Compliance
runValidationCheck(
  'Verification Compliance',
  'valid_verification_report_passes_schema',
  validateVerification,
  fixtures.verificationValid,
  true,
);
runValidationCheck(
  'Verification Compliance',
  'missing_checks_fails_schema',
  validateVerification,
  fixtures.verificationInvalidMissingChecks,
  false,
);

// 4) Policy Gate Compliance
addCheck(
  'Policy Gate Compliance',
  'adapter_contract_has_policy_gate_signature',
  adapterContractDoc.includes('runPolicyGate(params') &&
    adapterContractDoc.includes('writeRisk') &&
    adapterContractDoc.includes('approvalToken') &&
    adapterContractDoc.includes('action') &&
    adapterContractDoc.includes('resource'),
  null,
);
addCheck(
  'Policy Gate Compliance',
  'adapter_contract_has_approval_required_rule',
  adapterContractDoc.includes('APPROVAL_REQUIRED') && adapterContractDoc.includes('needs_review'),
  null,
);

// 5) Audit Compliance
addCheck(
  'Audit Compliance',
  'envelope_requires_audit_fields',
  ['request_id', 'trace_id', 'timestamp', 'identity'].every((field) => messageEnvelopeSchema.required.includes(field)),
  { required: messageEnvelopeSchema.required },
);

const failed = checks.filter((c) => !c.passed);
const report = {
  generated_at: new Date().toISOString(),
  protocol_version: packageJson.version,
  pass: failed.length === 0,
  checks_total: checks.length,
  checks_failed: failed.length,
  checks,
};

const reportPath = path.join(ROOT, 'tests', 'conformance-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

if (failed.length > 0) {
  console.error(`UAICP baseline conformance FAILED (${failed.length}/${checks.length} checks).`);
  console.error(`Report: ${reportPath}`);
  process.exit(1);
}

console.log(`UAICP baseline conformance PASSED (${checks.length}/${checks.length} checks).`);
console.log(`Report: ${reportPath}`);
