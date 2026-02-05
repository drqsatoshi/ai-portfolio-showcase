#!/bin/bash

# DNS and WHOIS Information Retrieval Script
# For domain: drqsatoshin.com

DOMAIN="drqsatoshin.com"
OUTPUT_FILE="dns_whois_output_$(date +%Y%m%d_%H%M%S).txt"

echo "================================================" | tee "$OUTPUT_FILE"
echo "DNS and WHOIS Report for $DOMAIN" | tee -a "$OUTPUT_FILE"
echo "Generated: $(date)" | tee -a "$OUTPUT_FILE"
echo "================================================" | tee -a "$OUTPUT_FILE"
echo "" | tee -a "$OUTPUT_FILE"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# DNS Queries
echo "=== DNS CONFIGURATION ===" | tee -a "$OUTPUT_FILE"
echo "" | tee -a "$OUTPUT_FILE"

if command_exists dig; then
    echo "--- A Records (IPv4) ---" | tee -a "$OUTPUT_FILE"
    dig +short "$DOMAIN" A | tee -a "$OUTPUT_FILE"
    echo "" | tee -a "$OUTPUT_FILE"
    
    echo "--- AAAA Records (IPv6) ---" | tee -a "$OUTPUT_FILE"
    dig +short "$DOMAIN" AAAA | tee -a "$OUTPUT_FILE"
    echo "" | tee -a "$OUTPUT_FILE"
    
    echo "--- CNAME Records ---" | tee -a "$OUTPUT_FILE"
    dig +short "$DOMAIN" CNAME | tee -a "$OUTPUT_FILE"
    echo "" | tee -a "$OUTPUT_FILE"
    
    echo "--- MX Records (Mail) ---" | tee -a "$OUTPUT_FILE"
    dig +short "$DOMAIN" MX | tee -a "$OUTPUT_FILE"
    echo "" | tee -a "$OUTPUT_FILE"
    
    echo "--- NS Records (Nameservers) ---" | tee -a "$OUTPUT_FILE"
    dig +short "$DOMAIN" NS | tee -a "$OUTPUT_FILE"
    echo "" | tee -a "$OUTPUT_FILE"
    
    echo "--- TXT Records ---" | tee -a "$OUTPUT_FILE"
    dig +short "$DOMAIN" TXT | tee -a "$OUTPUT_FILE"
    echo "" | tee -a "$OUTPUT_FILE"
    
    echo "--- SOA Record ---" | tee -a "$OUTPUT_FILE"
    dig +short "$DOMAIN" SOA | tee -a "$OUTPUT_FILE"
    echo "" | tee -a "$OUTPUT_FILE"
    
    echo "--- Complete DNS Query ---" | tee -a "$OUTPUT_FILE"
    dig "$DOMAIN" ANY | tee -a "$OUTPUT_FILE"
    echo "" | tee -a "$OUTPUT_FILE"
elif command_exists nslookup; then
    echo "Using nslookup (dig not available)" | tee -a "$OUTPUT_FILE"
    nslookup "$DOMAIN" | tee -a "$OUTPUT_FILE"
    echo "" | tee -a "$OUTPUT_FILE"
elif command_exists host; then
    echo "Using host (dig not available)" | tee -a "$OUTPUT_FILE"
    host -a "$DOMAIN" | tee -a "$OUTPUT_FILE"
    echo "" | tee -a "$OUTPUT_FILE"
else
    echo "No DNS query tools available (dig, nslookup, or host)" | tee -a "$OUTPUT_FILE"
    echo "" | tee -a "$OUTPUT_FILE"
fi

# WHOIS Query
echo "=== WHOIS INFORMATION ===" | tee -a "$OUTPUT_FILE"
echo "" | tee -a "$OUTPUT_FILE"

if command_exists whois; then
    whois "$DOMAIN" | tee -a "$OUTPUT_FILE"
    echo "" | tee -a "$OUTPUT_FILE"
else
    echo "whois command not available" | tee -a "$OUTPUT_FILE"
    echo "Install with: sudo apt-get install whois" | tee -a "$OUTPUT_FILE"
    echo "" | tee -a "$OUTPUT_FILE"
fi

# Try using curl with public APIs if available
echo "=== ATTEMPTING API-BASED LOOKUPS ===" | tee -a "$OUTPUT_FILE"
echo "" | tee -a "$OUTPUT_FILE"

if command_exists curl; then
    echo "--- Google DNS API ---" | tee -a "$OUTPUT_FILE"
    curl -s "https://dns.google/resolve?name=$DOMAIN&type=A" 2>/dev/null | tee -a "$OUTPUT_FILE"
    echo "" | tee -a "$OUTPUT_FILE"
    
    echo "--- Cloudflare DNS API ---" | tee -a "$OUTPUT_FILE"
    curl -s "https://cloudflare-dns.com/dns-query?name=$DOMAIN&type=A" \
        -H "accept: application/dns-json" 2>/dev/null | tee -a "$OUTPUT_FILE"
    echo "" | tee -a "$OUTPUT_FILE"
else
    echo "curl not available for API queries" | tee -a "$OUTPUT_FILE"
    echo "" | tee -a "$OUTPUT_FILE"
fi

# SSL Certificate Info
echo "=== SSL CERTIFICATE INFORMATION ===" | tee -a "$OUTPUT_FILE"
echo "" | tee -a "$OUTPUT_FILE"

if command_exists openssl; then
    echo "Checking SSL certificate for $DOMAIN..." | tee -a "$OUTPUT_FILE"
    echo | openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" 2>/dev/null | \
        openssl x509 -noout -dates -subject -issuer 2>/dev/null | tee -a "$OUTPUT_FILE"
    echo "" | tee -a "$OUTPUT_FILE"
else
    echo "openssl not available for SSL certificate check" | tee -a "$OUTPUT_FILE"
    echo "" | tee -a "$OUTPUT_FILE"
fi

# Website Response
echo "=== WEBSITE RESPONSE ===" | tee -a "$OUTPUT_FILE"
echo "" | tee -a "$OUTPUT_FILE"

if command_exists curl; then
    echo "Checking HTTP response for https://$DOMAIN..." | tee -a "$OUTPUT_FILE"
    curl -I "https://$DOMAIN" 2>&1 | tee -a "$OUTPUT_FILE"
    echo "" | tee -a "$OUTPUT_FILE"
    
    echo "Checking GitHub Pages URL..." | tee -a "$OUTPUT_FILE"
    curl -I "https://drqsatoshi.github.io/drqsatoshin-legal-pages/" 2>&1 | tee -a "$OUTPUT_FILE"
    echo "" | tee -a "$OUTPUT_FILE"
else
    echo "curl not available for HTTP checks" | tee -a "$OUTPUT_FILE"
    echo "" | tee -a "$OUTPUT_FILE"
fi

echo "================================================" | tee -a "$OUTPUT_FILE"
echo "Report saved to: $OUTPUT_FILE" | tee -a "$OUTPUT_FILE"
echo "================================================" | tee -a "$OUTPUT_FILE"

# Make the output more readable
echo ""
echo "Summary of findings above saved to: $OUTPUT_FILE"
echo ""
echo "To view the full report:"
echo "  cat $OUTPUT_FILE"
echo ""
echo "Online tools for verification:"
echo "  - DNS: https://www.whatsmydns.net/#A/$DOMAIN"
echo "  - WHOIS: https://www.whois.com/whois/$DOMAIN"
echo "  - SSL: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
