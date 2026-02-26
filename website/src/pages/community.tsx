import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

const CommunityPage = () => {
  return (
    <Layout title="Contribute" description="Contribute to UAICP">
      <div className="container margin-vert--lg">
        <div className="text--center margin-bottom--lg">
          <h1>Contribute to UAICP</h1>
          <p>
            UAICP is an open-source protocol effort focused on reliable agentic workflows.
          </p>
        </div>

        <section className="margin-bottom--lg">
          <div className="row">
            <div className="col col--8 col--offset-2">
              <h2>How to Contribute</h2>
              <ol>
                <li>Open an issue describing your proposed change.</li>
                <li>Reference the invariant or contract impacted.</li>
                <li>Submit a PR with docs/schema/test updates as needed.</li>
              </ol>
              <p>
                Start from open issues and pick a workstream-labeled task in the specification or reference implementation repositories.
              </p>
              <div className="button-group">
                <Link className="button button--primary" href="https://github.com/UAICP/uaicp_specification/issues">
                  Open Issue
                </Link>
                <Link className="button button--secondary" href="https://github.com/UAICP/uaicp_specification/pulls">
                  View PRs
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="row">
            <div className="col col--8 col--offset-2">
              <h2>Repositories</h2>
              <ul>
                <li>
                  <a href="https://github.com/UAICP/uaicp_specification" target="_blank" rel="noopener noreferrer">
                    uaicp_specification
                  </a>
                </li>
                <li>
                  <a href="https://github.com/UAICP/uaicp-reference-impl" target="_blank" rel="noopener noreferrer">
                    uaicp-reference-impl
                  </a>
                </li>
                <li>
                  <a href="https://github.com/UAICP/uaicp_website" target="_blank" rel="noopener noreferrer">
                    uaicp_website
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default CommunityPage;
