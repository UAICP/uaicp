# GitHub Pages Setup

This site is designed for static deployment via Docusaurus build artifacts.

## Deployment Model

1. Build site with `npm run build`
2. Publish `build/` contents to hosting target
3. Configure custom domain `uaicp.org` as needed

## Required Checks

- build succeeds with no broken internal links
- sitemap is generated
- canonical URL points to `https://uaicp.org`
