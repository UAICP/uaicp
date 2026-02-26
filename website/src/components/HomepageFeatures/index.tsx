import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Evidence Gating',
    description: (
      <>Delivery is blocked until required evidence objects are present and well-formed.</>
    ),
  },
  {
    title: 'Verification First',
    description: (
      <>Mechanical verifier checks decide readiness for delivery, not model confidence.</>
    ),
  },
  {
    title: 'Policy-Gated Writes',
    description: (
      <>Write actions are risk-tiered and high-risk operations require explicit approval metadata.</>
    ),
  },
  {
    title: 'Fail-Safe Output',
    description: (
      <>If invariants are unmet, systems return explicit uncertainty instead of silent guesses.</>
    ),
  },
];

function Feature({title, description}: FeatureItem) {
  return (
    <div className={clsx('col col--6')}>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
