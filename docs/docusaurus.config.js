import { themes } from 'prism-react-renderer'
require('dotenv').config({ path: '.env.local' })

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'MarkFlowy',
  tagline: 'An easy-to-use, customizable, modern file manager',
  url: 'https://markflowy.vercel.app',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'drl990114',
  projectName: 'MarkFlowy',
  trailingSlash: true,

  markdown: {
    format: 'md',
    mermaid: true,
    preprocessor: ({ filePath, fileContent }) => {
      return fileContent.replaceAll('{{MY_VAR}}', 'MY_VALUE')
    },
    mdx1Compat: {
      comments: true,
      admonitions: true,
      headingIds: true,
    },
  },

  themeConfig: {
    docs: {
      sidebar: {
        hideable: true,
      },
    },
    announcementBar: {
      id: 'support_us',
      content: `Currently MarkFlowy is in Alpha version, welcome to <a href='https://github.com/drl990114/MarkFlowy/releases' target='_blank'>experience it.</a>`,
      backgroundColor: '#fafbfc',
      textColor: '#091E42',
    },
    navbar: {
      hideOnScroll: true,
      title: 'MarkFlowy',
      logo: {
        alt: 'MarkFlowy Logo',
        src: 'img/favicon.ico',
      },
      items: [
        {
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/drl990114/MarkFlowy',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },
    footer: {
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Docs',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub Discussions',
              href: 'https://github.com/drl990114/MarkFlowy/discussions',
            },
          ],
        },
      ],
    },
    prism: {
      theme: themes.vsLight,
      darkTheme: themes.vsDark,
    },
    zoomSelector: '.markdown :not(em) > img',
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: ({ locale, docPath }) => {
            return `https://github.com/drl990114/MarkFlowy/edit/main/docs/docs/${docPath}`
          },
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        blog: {
          showReadingTime: true,
          editUrl: ({ locale, blogPath }) => {
            return `https://github.com/drl990114/MarkFlowy/edit/main/docs/blog/${blogPath}`
          },
          feedOptions: {
            type: 'all',
          },
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  plugins: [
    'plugin-image-zoom',
    [
      '@docusaurus/plugin-pwa',
      {
        debug: true,
        offlineModeActivationStrategies: ['appInstalled', 'standalone', 'queryString'],
        pwaHead: [
          {
            tagName: 'link',
            rel: 'icon',
            href: '/img/icon.webp',
          },
          {
            tagName: 'link',
            rel: 'manifest',
            href: '/manifest.json',
          },
          {
            tagName: 'meta',
            name: 'theme-color',
            content: '#0081cb',
          },
        ],
      },
    ],
  ],
}
