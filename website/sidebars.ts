import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  specSidebar: [
    {
      type: 'category',
      label: 'Specification',
      items: [
        'specification/introduction',
        'specification/why-now',
        'specification/quick-start',
        'specification/specification',
      ],
    },
  ],

  integrationSidebar: [
    {
      type: 'category',
      label: 'Integration Guides',
      items: [
        'integration-guides/overview',
        'integration-guides/framework-adapters',
        'integration-guides/adapter-contract',
        'integration-guides/adapter-matrix',
        'integration-guides/langgraph-adapter-example',
        'integration-guides/autogen-adapter-example',
        'integration-guides/crewai-adapter-example',
        'integration-guides/openai-agents-sdk-adapter-example',
      ],
    },
  ],

  examplesSidebar: [
    {
      type: 'category',
      label: 'Examples',
      items: ['examples/use-cases', 'examples/finance-workflow-comparison'],
    },
  ],

  governanceSidebar: [
    {
      type: 'category',
      label: 'Governance',
      items: ['governance/overview', 'governance/status-roadmap', 'governance/contributing'],
    },
  ],
};

export default sidebars;
