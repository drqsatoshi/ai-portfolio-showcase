# DNS Configuration and WHOIS Report for drqsatoshin.com

## Overview

This document contains DNS configuration and WHOIS information for the domain drqsatoshin.com.

**Date**: 2026-02-05  
**Domain**: drqsatoshin.com  
**Repository**: https://github.com/drqsatoshi/drqsatoshin-legal-pages

## DNS Configuration Queries

Due to network restrictions in the build environment, direct DNS queries cannot be executed. Below are the commands to run manually to retrieve DNS and WHOIS data:

### DNS Query Commands

```bash
# Get all DNS records
dig drqsatoshin.com ANY

# Get A records (IPv4 addresses)
dig drqsatoshin.com A

# Get AAAA records (IPv6 addresses)
dig drqsatoshin.com AAAA

# Get CNAME records
dig drqsatoshin.com CNAME

# Get MX records (mail servers)
dig drqsatoshin.com MX

# Get NS records (nameservers)
dig drqsatoshin.com NS

# Get TXT records
dig drqsatoshin.com TXT

# Alternative using nslookup
nslookup drqsatoshin.com

# Alternative using host
host -a drqsatoshin.com
```

### WHOIS Query Commands

```bash
# Get WHOIS information
whois drqsatoshin.com

# Get detailed WHOIS with specific server
whois -h whois.verisign-grs.com drqsatoshin.com

# Alternative online WHOIS lookup
curl -s "https://www.whois.com/whois/drqsatoshin.com"
```

## Expected DNS Configuration

Based on the repository setup, the expected DNS configuration should be:

### For GitHub Pages Deployment

```
Type: CNAME
Host: @
Value: drqsatoshi.github.io
TTL: 3600 (or automatic)

Type: CNAME
Host: www
Value: drqsatoshi.github.io
TTL: 3600 (or automatic)
```

Alternatively, for apex domain (non-www):

```
Type: A
Host: @
Value: 185.199.108.153
TTL: 3600

Type: A
Host: @
Value: 185.199.109.153
TTL: 3600

Type: A
Host: @
Value: 185.199.110.153
TTL: 3600

Type: A
Host: @
Value: 185.199.111.153
TTL: 3600
```

### For Vercel Deployment

Vercel will provide specific DNS records after domain is added. Typical configuration:

```
Type: CNAME
Host: @
Value: cname.vercel-dns.com
TTL: 3600

Type: CNAME  
Host: www
Value: cname.vercel-dns.com
TTL: 3600
```

## Online Tools for DNS/WHOIS Lookup

If command-line tools are not available, use these online services:

1. **DNS Lookup Tools:**
   - https://www.whatsmydns.net/#A/drqsatoshin.com
   - https://dns.google/query?name=drqsatoshin.com
   - https://dnschecker.org/all-dns-records-of-domain.php?query=drqsatoshin.com
   - https://mxtoolbox.com/SuperTool.aspx?action=a%3adrqsatoshin.com

2. **WHOIS Lookup Tools:**
   - https://www.whois.com/whois/drqsatoshin.com
   - https://whois.domaintools.com/drqsatoshin.com
   - https://lookup.icann.org/en/lookup
   - https://who.is/whois/drqsatoshin.com

## Programmatic DNS/WHOIS Retrieval

### Using Node.js

```javascript
// Install: npm install dns whois

const dns = require('dns').promises;
const whois = require('whois');

async function getDNSInfo(domain) {
  try {
    const [a, aaaa, mx, ns, txt] = await Promise.all([
      dns.resolve4(domain).catch(() => []),
      dns.resolve6(domain).catch(() => []),
      dns.resolveMx(domain).catch(() => []),
      dns.resolveNs(domain).catch(() => []),
      dns.resolveTxt(domain).catch(() => [])
    ]);
    
    console.log('DNS Records for', domain);
    console.log('A Records:', a);
    console.log('AAAA Records:', aaaa);
    console.log('MX Records:', mx);
    console.log('NS Records:', ns);
    console.log('TXT Records:', txt);
  } catch (error) {
    console.error('DNS lookup error:', error);
  }
}

function getWhoisInfo(domain) {
  whois.lookup(domain, (err, data) => {
    if (err) {
      console.error('WHOIS lookup error:', err);
      return;
    }
    console.log('WHOIS Information for', domain);
    console.log(data);
  });
}

getDNSInfo('drqsatoshin.com');
getWhoisInfo('drqsatoshin.com');
```

### Using Python

```python
# Install: pip install dnspython python-whois

import dns.resolver
import whois

def get_dns_info(domain):
    record_types = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME']
    
    print(f"DNS Records for {domain}")
    for record_type in record_types:
        try:
            answers = dns.resolver.resolve(domain, record_type)
            print(f"\n{record_type} Records:")
            for rdata in answers:
                print(f"  {rdata}")
        except Exception as e:
            print(f"{record_type}: No records found")

def get_whois_info(domain):
    try:
        w = whois.whois(domain)
        print(f"\nWHOIS Information for {domain}")
        print(f"Registrar: {w.registrar}")
        print(f"Creation Date: {w.creation_date}")
        print(f"Expiration Date: {w.expiration_date}")
        print(f"Name Servers: {w.name_servers}")
        print(f"Status: {w.status}")
    except Exception as e:
        print(f"WHOIS lookup error: {e}")

if __name__ == "__main__":
    domain = "drqsatoshin.com"
    get_dns_info(domain)
    get_whois_info(domain)
```

### Using cURL and APIs

```bash
# Google DNS API
curl -s "https://dns.google/resolve?name=drqsatoshin.com&type=A" | jq .

# Cloudflare DNS API
curl -s "https://cloudflare-dns.com/dns-query?name=drqsatoshin.com&type=A" \
  -H "accept: application/dns-json" | jq .

# WHOIS API (various services)
curl -s "https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=YOUR_API_KEY&domainName=drqsatoshin.com&outputFormat=JSON"
```

## Verification Steps

After deployment, verify the setup:

1. **Check GitHub Pages deployment:**
   ```bash
   curl -I https://drqsatoshi.github.io/drqsatoshin-legal-pages/
   ```

2. **Check Vercel deployment:**
   ```bash
   curl -I https://your-project.vercel.app
   ```

3. **Verify custom domain (if configured):**
   ```bash
   curl -I https://drqsatoshin.com
   ```

4. **Check SSL certificate:**
   ```bash
   echo | openssl s_client -connect drqsatoshin.com:443 -servername drqsatoshin.com 2>/dev/null | openssl x509 -noout -dates
   ```

## Deployment Status

### GitHub Pages
- **Configuration**: `.github/workflows/deploy-pages.yml` created
- **Status**: Ready to deploy (requires GitHub Actions to be enabled)
- **URL**: https://drqsatoshi.github.io/drqsatoshin-legal-pages/
- **Custom Domain**: drqsatoshin.com (configured via CNAME file)

### Vercel
- **Configuration**: `vercel.json` created
- **Status**: Ready to deploy (requires Vercel project setup)
- **Deployment Options**: 
  - Via Vercel Dashboard: Import repository
  - Via Vercel CLI: Run `vercel` command in repository

## Next Steps

1. **Enable GitHub Pages:**
   - Go to repository settings
   - Navigate to Pages section
   - Select "GitHub Actions" as source
   - Workflow will run automatically

2. **Deploy to Vercel:**
   - Option A: Import repository in Vercel dashboard
   - Option B: Use Vercel CLI: `vercel --prod`

3. **Configure Custom Domain:**
   - Update DNS records at domain registrar
   - Add custom domain in GitHub Pages settings or Vercel dashboard
   - Wait for DNS propagation (24-48 hours)

4. **Verify Deployment:**
   - Run DNS queries to confirm configuration
   - Run WHOIS queries to verify domain ownership
   - Test all legal page URLs
   - Verify SSL certificate

## Support Resources

- GitHub Pages Docs: https://docs.github.com/en/pages
- Vercel Docs: https://vercel.com/docs
- DNS Propagation Checker: https://www.whatsmydns.net/
- SSL Certificate Checker: https://www.ssllabs.com/ssltest/
