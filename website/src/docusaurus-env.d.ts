/// <reference types="@docusaurus/module-type-aliases" />
/// <reference types="@docusaurus/theme-classic" />
/// <reference types="@docusaurus/theme-mermaid" />

declare module '@theme/Mermaid' {
  export interface Props {
    value: string;
  }
  export default function Mermaid(props: Props): JSX.Element;
}

declare module '@theme/Layout' {
  import {ReactNode} from 'react';
  export interface Props {
    children?: ReactNode;
    title?: string;
    description?: string;
    keywords?: string | string[];
    image?: string;
    noFooter?: boolean;
    wrapperClassName?: string;
    pageClassName?: string;
    searchMetadatas?: {[key: string]: string};
  }
  export default function Layout(props: Props): JSX.Element;
}

declare module '@docusaurus/Link' {
  import {ComponentProps} from 'react';
  import {LinkProps} from '@docusaurus/router';
  export interface Props extends LinkProps {
    isNavLink?: boolean;
    activeClassName?: string;
    to?: string;
    href?: string;
    children?: React.ReactNode;
  }
  export default function Link(props: Props): JSX.Element;
}

declare module '@docusaurus/Head' {
  import {ReactNode} from 'react';
  export interface Props {
    children?: ReactNode;
  }
  export default function Head(props: Props): JSX.Element;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '@site/src/components/HomepageFeatures' {
  import {ReactNode} from 'react';
  export default function HomepageFeatures(): JSX.Element;
}
