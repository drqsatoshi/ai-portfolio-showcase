# drqsatoshin Legal Pages

This repository contains the legal pages (Terms of Service and Privacy Policy) for drqsatoshin.com.

## Deployment

This site is deployed to multiple platforms:

### GitHub Pages
- Automatically deployed via GitHub Actions on push to main/master branch
- URL: https://drqsatoshi.github.io/drqsatoshin-legal-pages/
- Custom domain: drqsatoshin.com (configured via CNAME file)

### Vercel
- Deploy using Vercel CLI or connect the repository in Vercel dashboard
- Configuration is in `vercel.json`

## Structure

- `index.html` - Landing page with links to legal documents
- `TOS/` - Terms of Service
- `Policy/` - Privacy Policy
- `.nojekyll` - Prevents Jekyll processing on GitHub Pages
- `CNAME` - Custom domain configuration for GitHub Pages

## Local Development

Simply open `index.html` in a browser or use any static web server:

```bash
python3 -m http.server 8000
# or
npx serve
```

## Manual Deployment

### GitHub Pages
Already configured via GitHub Actions. To enable:
1. Go to repository Settings
2. Navigate to Pages section
3. Select "GitHub Actions" as the source

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```
