import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Head from '@docusaurus/Head';

import styles from './index.module.css';

function HomepageHeader() {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div className={styles.statusBadge}>Protocol v0.2</div>
        <h1 className="hero__title">UAICP</h1>
        <p className={styles.heroName}>Universal Agent Integrity & Control Protocol</p>
        <p className={styles.heroDescription}>
          Decoupled reliability contract for controlled agent execution.
        </p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/docs/specification/introduction">
            Read Specification
          </Link>
          <Link className="button button--primary button--lg" to="/docs/integration-guides/overview">
            Integration Guides
          </Link>
          <Link className="button button--secondary button--lg" href="https://github.com/UAICP/uaicp_specification">
            Specification Repo
          </Link>
          <Link className="button button--secondary button--lg" href="https://github.com/UAICP/uaicp-reference-impl">
            Reference Impl Repo
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const description = 'UAICP is an open reliability contract for agent workflows with evidence gating, deterministic verification, policy-gated writes, and auditability.';

  return (
    <>
      <Head>
        <meta name="description" content={description} />
      </Head>
      <Layout title="UAICP Protocol v0.2" description={description}>
        <HomepageHeader />
        <main>
          <HomepageFeatures />

          <section className={styles.aboutSection}>
            <div className="container">
              <div className="row">
                <div className="col col--8 col--offset-2">
                  <h2 className={styles.sectionTitle}>Reliability by Contract</h2>
                  <p className={styles.sectionDescription}>
                    UAICP is a separate control layer that sits under frameworks like LangGraph, Microsoft Agent Framework style runtimes, AutoGen, and CrewAI.
                    It standardizes evidence contracts, verification contracts, and policy gates so delivery cannot bypass required checks.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.getStartedSection}>
            <div className="container">
              <div className="row">
                <div className="col col--8 col--offset-2">
                  <h2 className={styles.sectionTitle}>Get Started</h2>
                  <p className={styles.sectionDescription}>
                    Start with the protocol and adapter docs, then run the finance workflow comparison in the reference implementation.
                  </p>
                  <div className={styles.getStartedButtons}>
                    <Link className="button button--primary button--lg" to="/docs/specification">
                      Core Spec
                    </Link>
                    <Link className="button button--secondary button--lg" to="/docs/examples/use-cases">
                      Use Cases
                    </Link>
                    <Link className="button button--secondary button--lg" to="/docs/examples/finance-workflow-comparison">
                      Finance Workflow
                    </Link>
                    <Link className="button button--secondary button--lg" to="/docs/integration-guides/adapter-contract">
                      Adapter Contract
                    </Link>
                    <Link className="button button--secondary button--lg" to="/blog">
                      Project Updates
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </Layout>
    </>
  );
}
