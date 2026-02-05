# BitChat Deployment Guide

This guide covers deploying BitChat to both **Netlify** (testing) and **Vercel** (production).

## Architecture Overview

BitChat uses different signaling strategies based on the deployment platform:

- **Netlify**: WebSocket-based signaling via Netlify Functions
- **Vercel**: HTTP polling-based signaling via Vercel Serverless Functions

The client automatically detects which platform it's running on and adapts accordingly.

## Platform Detection

The signaling adapter auto-detects the platform based on hostname:

```typescript
// Vercel domains
- vercel.app
- drqsatoshin.xyz
- drqsatoshin.com

// Netlify domains
- netlify.app

// Default: HTTP polling (safer fallback)
```

## Netlify Deployment (Testing Environment)

### Prerequisites
- Netlify account
- GitHub repository connected to Netlify

### Configuration Files
- `netlify.toml` - Build and function configuration
- `netlify/functions/signal.ts` - WebSocket signaling server

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Netlify Auto-Deploy**
   - Netlify automatically detects changes
   - Builds the project: `npm run build`
   - Deploys to: `https://your-site.netlify.app`

3. **Access BitChat**
   ```
   https://your-site.netlify.app/bitchat
   ```

### WebSocket Support

Netlify Functions support WebSocket connections natively. The signaling server uses:
- URL: `wss://your-site.netlify.app/.netlify/functions/signal`
- Protocol: WebSocket (full-duplex, real-time)
- Latency: ~50-100ms (excellent)

### Testing

Open multiple browser windows to test P2P connections:
```
https://your-site.netlify.app/bitchat
```

## Vercel Deployment (Production)

### Prerequisites
- Vercel account
- GitHub repository connected to Vercel
- Custom domains configured:
  - drqsatoshin.xyz
  - drqsatoshin.com

### Configuration Files
- `vercel.json` - Build and routing configuration
- `api/signal.ts` - HTTP polling signaling server

### Deployment Steps

1. **Install Vercel CLI** (optional)
   ```bash
   npm i -g vercel
   ```

2. **Deploy via GitHub**
   ```bash
   git push origin main
   ```
   
   Vercel automatically deploys from GitHub.

3. **Or Deploy via CLI**
   ```bash
   vercel --prod
   ```

4. **Access BitChat**
   ```
   https://drqsatoshin.xyz/bitchat
   https://drqsatoshin.com/bitchat
   ```

### HTTP Polling Approach

Since Vercel serverless functions don't support WebSocket out of the box, BitChat uses HTTP polling:

- **Polling Interval**: 1 second
- **Heartbeat**: Every 30 seconds
- **Latency**: ~1-2 seconds (acceptable)
- **Scalability**: Good (stateless functions)

### API Endpoints

The Vercel signaling server exposes:

```
POST /api/signal?action=join
  - Join a room
  - Returns: { type: 'PEERS', peers: [...] }

POST /api/signal?action=signal
  - Send signaling message to peer
  - Body: SignalMessage

GET /api/signal?action=poll&peerId=<peerId>
  - Poll for pending messages
  - Returns: { messages: [...] }

POST /api/signal?action=leave
  - Leave room
  - Body: { peerId }

POST /api/signal?action=heartbeat
  - Keep connection alive
  - Body: { peerId }
```

### Limitations

**Important**: The in-memory storage in `api/signal.ts` doesn't persist across function invocations. For production, consider:

1. **External Storage** (Recommended)
   - Use Upstash Redis for peer tracking
   - Use Vercel KV for message queuing
   - Use Supabase Realtime for WebSocket-like behavior

2. **Dedicated WebSocket Service**
   - Deploy signaling server separately (Railway, Render, Fly.io)
   - Use managed services (Pusher, Ably, Socket.io)
   - Point BitChat to external WebSocket URL

3. **Vercel Edge Functions** (Beta)
   - Experimental WebSocket support
   - Lower latency than serverless functions
   - Check Vercel docs for current status

## Recommended Production Setup

For the best production experience on Vercel:

### Option 1: External WebSocket Service (Best Performance)

Deploy the signaling server separately:

```bash
# On Railway/Render/Fly.io
git clone <your-repo>
cd netlify/functions
node signal-standalone.js  # Create standalone version
```

Update `src/lib/signaling.ts`:
```typescript
private getBaseUrl(): string {
  return 'wss://your-signaling-server.fly.dev';
}
```

### Option 2: Upstash Redis Backend (Best Scalability)

Install Upstash Redis SDK:
```bash
npm install @upstash/redis
```

Update `api/signal.ts` to use Redis instead of in-memory Map.

### Option 3: Hybrid Approach

- **Netlify**: Testing and WebSocket-based signaling
- **Vercel**: Production with polling (current implementation)
- **Separate Service**: Future migration for optimal performance

## Environment Variables

No environment variables needed for basic deployment. The system auto-detects the platform.

## Custom Domain Configuration

### Vercel Domains

1. **Add Domain in Vercel Dashboard**
   - Go to Project Settings > Domains
   - Add: `drqsatoshin.xyz` and `drqsatoshin.com`

2. **DNS Configuration**
   - Point A record to Vercel IP: `76.76.21.21`
   - Or use CNAME: `cname.vercel-dns.com`

3. **SSL Certificate**
   - Automatically provisioned by Vercel
   - Forced HTTPS enabled

## Performance Comparison

| Feature | Netlify (WebSocket) | Vercel (Polling) |
|---------|-------------------|------------------|
| Latency | ~50-100ms | ~1-2s |
| Real-time | Excellent | Good |
| Scalability | Good | Excellent |
| Setup Complexity | Low | Low |
| Cost | Free tier generous | Free tier generous |

## Testing Both Platforms

1. **Test on Netlify**
   ```
   https://your-site.netlify.app/bitchat
   ```
   - Should show "Connected via WebSocket (Netlify)"

2. **Test on Vercel**
   ```
   https://drqsatoshin.xyz/bitchat
   ```
   - Should show "Connected via HTTP Polling (Vercel)"

3. **Cross-Platform Test**
   - Open Netlify URL in one browser
   - Open Vercel URL in another browser
   - Both should be able to communicate (P2P connections work across platforms)

## Troubleshooting

### Netlify Issues

**Problem**: WebSocket connection fails
- Check Netlify Function logs
- Verify `netlify.toml` is configured correctly
- Ensure Functions are enabled in Netlify dashboard

**Problem**: "Function invocation timed out"
- Increase function timeout in `netlify.toml`
- WebSocket functions should have longer timeouts

### Vercel Issues

**Problem**: Polling not working
- Check Vercel Function logs
- Verify `vercel.json` routing is correct
- Test API endpoint directly: `/api/signal`

**Problem**: "Function execution timed out"
- Vercel serverless functions have 10s timeout (hobby)
- Upgrade to Pro for 60s timeout
- Or use Edge Functions

**Problem**: Peers not discovering each other
- In-memory storage is ephemeral
- Consider using Upstash Redis
- Check if peers are in the same room

## Monitoring

### Netlify
- Function logs: Netlify Dashboard > Functions
- Real-time logs: `netlify functions:log signal`

### Vercel
- Function logs: Vercel Dashboard > Functions
- Real-time logs: `vercel logs --follow`

## Migration Path

Current: Vercel with HTTP polling
Future: Vercel + External WebSocket service

Steps:
1. Deploy dedicated signaling server
2. Update signaling adapter to use external URL
3. Keep polling as fallback
4. Monitor performance and scale as needed

## Security Considerations

Both platforms support:
- ✅ HTTPS/WSS encryption
- ✅ CSP headers configured
- ✅ CORS properly set
- ✅ No message content on server

Additional for production:
- Consider rate limiting
- Add authentication for rooms
- Implement peer banning
- Monitor for abuse

## Cost Estimates

### Netlify (Free Tier)
- 125K function requests/month
- 100 hours function runtime/month
- Sufficient for testing

### Vercel (Hobby - Free)
- 100 GB-hours/month
- 1,000 serverless function executions/hour
- Sufficient for moderate usage

For high-traffic production:
- Consider Vercel Pro ($20/month)
- Or deploy signaling separately

## Support

- **Netlify Docs**: https://docs.netlify.com/functions/overview/
- **Vercel Docs**: https://vercel.com/docs/functions
- **BitChat Docs**: `docs/BITCHAT.md`

## Quick Reference

| Task | Netlify | Vercel |
|------|---------|--------|
| Deploy | `git push` | `git push` or `vercel --prod` |
| Logs | Netlify Dashboard | Vercel Dashboard |
| Functions | `netlify/functions/` | `api/` |
| Config | `netlify.toml` | `vercel.json` |
| URL | `*.netlify.app` | `*.vercel.app` or custom |
| Signaling | WebSocket | HTTP Polling |
