# UAICP Website Assets

This directory contains static assets for the UAICP website including:

- Images and logos
- Icons and favicons  
- Documents and PDFs
- Other static resources

## Image Guidelines

- **Logo**: Use official UAICP logo files
- **Screenshots**: Include clear, high-resolution screenshots
- **Diagrams**: Use SVG format when possible for scalability
- **Photos**: Optimize for web (WebP preferred)

## File Organization

```
static/
├── img/
│   ├── logo.svg              # Main UAICP logo
│   ├── favicon.ico           # Site favicon
│   ├── social-card.png       # Social media preview
│   └── screenshots/          # Application screenshots
├── docs/
│   └── assets/               # Document assets
└── downloads/                # Downloadable resources
```

## Usage in Documentation

Reference static assets using absolute paths:

```markdown
![UAICP Architecture](/img/architecture-diagram.svg)
```

Or in React components:

```jsx
import logo from '@site/static/img/logo.svg';
```
