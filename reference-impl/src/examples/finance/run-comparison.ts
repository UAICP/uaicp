import {
  createSampleFinanceWorkflowInput,
  runWorkflowComparison,
} from './workflow-comparison';

const sampleInput = createSampleFinanceWorkflowInput();
const result = runWorkflowComparison(sampleInput);

console.log(JSON.stringify({ input: sampleInput, result }, null, 2));
