import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'UAICP',
  tagline: 'Open reliability contract for agentic workflows',
  favicon: 'img/favicon.ico',

  url: 'https://uaicp.org',
  baseUrl: '/',

  organizationName: 'UAICP',
  projectName: 'uaicp_website',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/UAICP/uaicp_website/edit/main/',
          showLastUpdateAuthor: false,
          showLastUpdateTime: true,
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/UAICP/uaicp_website/edit/main/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/uaicp-social-card.svg',
    navbar: {
      title: 'UAICP',
      logo: {
        alt: 'UAICP Logo',
        src: 'img/logo-cropped.svg',
        width: 32,
        height: 32,
      },
      items: [
        {to: '/docs/specification/introduction', label: 'Specification', position: 'left'},
        {to: '/docs/integration-guides/overview', label: 'Integration', position: 'left'},
        {to: '/docs/examples/use-cases', label: 'Examples', position: 'left'},
        {to: '/docs/governance/overview', label: 'Governance', position: 'left'},
        {to: '/blog', label: 'Blog', position: 'left'},
        {href: 'https://github.com/UAICP/uaicp_specification', label: 'GitHub', position: 'right'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Specification', to: '/docs/specification/introduction'},
            {label: 'Integration', to: '/docs/integration-guides/overview'},
            {label: 'Examples', to: '/docs/examples/use-cases'},
          ],
        },
        {
          title: 'Project',
          items: [
            {label: 'Governance', to: '/docs/governance/overview'},
            {label: 'Release Status', to: '/docs/governance/status-roadmap'},
            {label: 'Contributing', to: '/docs/governance/contributing'},
            {label: 'Blog', to: '/blog'},
          ],
        },
        {
          title: 'Repository',
          items: [
            {label: 'Specification Repo', href: 'https://github.com/UAICP/uaicp_specification'},
            {label: 'Reference Impl Repo', href: 'https://github.com/UAICP/uaicp-reference-impl'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Prismworks AI and UAICP contributors.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['json', 'typescript', 'bash'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
