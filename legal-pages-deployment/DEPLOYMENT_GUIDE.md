# Legal Pages Deployment Guide

This document provides instructions for deploying the drqsatoshin-legal-pages repository to GitHub Pages and Vercel.

## Repository Information

- **Repository**: https://github.com/drqsatoshi/drqsatoshin-legal-pages
- **Domain**: drqsatoshin.com
- **Content**: Legal pages (Terms of Service and Privacy Policy)

## Prerequisites

1. Access to the GitHub repository: drqsatoshi/drqsatoshin-legal-pages
2. Vercel account (free tier available at https://vercel.com)
3. (Optional) Vercel CLI: `npm install -g vercel`

## Deployment Files Created

The following files have been added to support deployment:

1. `.github/workflows/deploy-pages.yml` - GitHub Actions workflow for automatic Pages deployment
2. `vercel.json` - Vercel configuration for static site deployment
3. `README.md` - Documentation for the legal pages repository

## GitHub Pages Deployment

### Automatic Deployment (Recommended)

The GitHub Actions workflow will automatically deploy to GitHub Pages when changes are pushed to the main/master branch.

**Steps to enable:**

1. Go to https://github.com/drqsatoshi/drqsatoshin-legal-pages/settings/pages
2. Under "Build and deployment":
   - Source: Select "GitHub Actions"
3. The workflow will run automatically on the next push

**Verify deployment:**
- Check workflow status: https://github.com/drqsatoshi/drqsatoshin-legal-pages/actions
- Site URL: https://drqsatoshi.github.io/drqsatoshin-legal-pages/
- Custom domain (if configured): https://drqsatoshin.com

### Manual Deployment

If needed, you can also manually trigger the workflow:
1. Go to https://github.com/drqsatoshi/drqsatoshin-legal-pages/actions
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow"

## Vercel Deployment

### Option 1: Via Vercel Dashboard (Recommended for initial setup)

1. Go to https://vercel.com and sign in
2. Click "New Project"
3. Import the repository: `drqsatoshi/drqsatoshin-legal-pages`
4. Configure project:
   - Framework Preset: "Other" (it's a static site)
   - Root Directory: `./` (leave as default)
   - Build Command: (leave empty)
   - Output Directory: `./` (leave as default)
5. Click "Deploy"

### Option 2: Via Vercel CLI

```bash
# Navigate to the legal pages repository
cd /path/to/drqsatoshin-legal-pages

# Login to Vercel (first time only)
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Custom Domain on Vercel

To use drqsatoshin.com on Vercel:
1. Go to your project settings in Vercel dashboard
2. Navigate to "Domains"
3. Add `drqsatoshin.com` as a custom domain
4. Follow Vercel's DNS configuration instructions

## DNS Configuration

The CNAME file contains `drqsatoshin.com`, which is used by GitHub Pages for custom domain configuration.

**For GitHub Pages custom domain:**
1. Go to repository Settings → Pages
2. Add `drqsatoshin.com` in the "Custom domain" field
3. Configure DNS at your domain registrar:
   - Type: CNAME
   - Name: www (or @)
   - Value: drqsatoshi.github.io

**For Vercel custom domain:**
Follow Vercel's DNS instructions after adding the domain in the dashboard.

## Verification Commands

After deployment, you can verify using these commands:

```bash
# Check if site is accessible
curl -I https://drqsatoshi.github.io/drqsatoshin-legal-pages/

# Check DNS for GitHub Pages
dig drqsatoshin.com

# Check WHOIS information
whois drqsatoshin.com

# Check DNS records
nslookup drqsatoshin.com
```

## Troubleshooting

### GitHub Pages not deploying
- Check Actions tab for workflow errors
- Ensure Pages is enabled in repository settings
- Verify the workflow file is in `.github/workflows/`

### Vercel deployment fails
- Check build logs in Vercel dashboard
- Ensure `vercel.json` is in the repository root
- Verify static files are accessible

### Custom domain not working
- Wait 24-48 hours for DNS propagation
- Verify DNS records are correctly configured
- Check HTTPS certificate status (may take a few minutes)

## Site Structure

```
drqsatoshin-legal-pages/
├── .github/
│   └── workflows/
│       └── deploy-pages.yml    # GitHub Actions workflow
├── Policy/
│   └── index.html              # Privacy Policy
├── TOS/
│   └── index.html              # Terms of Service
├── .nojekyll                   # Prevents Jekyll processing
├── CNAME                       # Custom domain for GitHub Pages
├── README.md                   # Repository documentation
├── index.html                  # Landing page
└── vercel.json                 # Vercel configuration
```

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vercel Documentation](https://vercel.com/docs)
- [Custom Domain Setup (GitHub)](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [Custom Domain Setup (Vercel)](https://vercel.com/docs/concepts/projects/domains)
