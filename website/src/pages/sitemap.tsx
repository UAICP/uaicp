import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Head from '@docusaurus/Head';

export default function Sitemap(): JSX.Element {
  return (
    <>
      <Head>
        <title>Sitemap | UAICP</title>
        <meta name="description" content="Complete sitemap of UAICP documentation and resources." />
      </Head>

      <Layout title="Sitemap" description="UAICP sitemap">
        <div className="container margin-vert--lg">
          <div className="row">
            <div className="col col--8 col--offset-2">
              <h1>Sitemap</h1>
              <p>All major documentation paths available on uaicp.org.</p>

              <h3>Specification</h3>
              <ul>
                <li><Link to="/docs/specification/introduction">Introduction</Link></li>
                <li><Link to="/docs/specification/why-now">Protocol Context</Link></li>
                <li><Link to="/docs/specification/quick-start">Quick Start</Link></li>
                <li><Link to="/docs/specification">Core Specification</Link></li>
              </ul>

              <h3>Integration</h3>
              <ul>
                <li><Link to="/docs/integration-guides/overview">Overview</Link></li>
                <li><Link to="/docs/integration-guides/framework-adapters">Framework Adapters</Link></li>
                <li><Link to="/docs/integration-guides/adapter-contract">Adapter Contract</Link></li>
              </ul>

              <h3>Examples & Governance</h3>
              <ul>
                <li><Link to="/docs/examples/use-cases">Use Cases</Link></li>
                <li><Link to="/docs/governance/overview">Governance</Link></li>
                <li><Link to="/docs/governance/status-roadmap">Release Status</Link></li>
                <li><Link to="/docs/governance/contributing">Contributing</Link></li>
              </ul>

              <h3>Project</h3>
              <ul>
                <li><Link to="/blog">Blog</Link></li>
                <li><a href="https://github.com/UAICP/uaicp_specification" target="_blank" rel="noopener noreferrer">Specification Repository</a></li>
                <li><a href="https://github.com/UAICP/uaicp-reference-impl" target="_blank" rel="noopener noreferrer">Reference Implementation Repository</a></li>
              </ul>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
