# Deployment Guide for AgentAudit

## Quick Start

### Option 1: Deploy Frontend Only (Recommended for Quick Start)

1. **Connect GitHub to Vercel**
   - Go to https://vercel.com/new
   - Select this GitHub repository: `dhanush-adi/AgentAudit`
   - Click "Import"

2. **Configure Project**
   - **Project Name**: `agentaudit` (or your choice)
   - **Framework**: Next.js
   - **Root Directory**: Select `./Frontend`

3. **Environment Variables**
   Add these environment variables:

   ```
   NEXT_PUBLIC_AGENT_API_URL=http://localhost:3001
   NEXT_PUBLIC_AGENT_REGISTRY=0x3de03AB80fdDDa888598303FF34E496bD29E140F
   NEXT_PUBLIC_REPUTATION_REGISTRY=0x4721bEF3A4A7226E63783d6546031eCEe3D59BF0
   NEXT_PUBLIC_VALIDATION_REGISTRY=0x9facA0523F1CEc547CE5e00a808338bF67a46924
   ```

   (Update `NEXT_PUBLIC_AGENT_API_URL` to your demo-agent deployment URL when ready)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Option 2: Deploy Full Stack (Frontend + API)

#### Part A: Deploy Demo Agent API

The demo-agent can run on:

- **Railway.app** (free tier available)
- **Render.com** (free tier available)
- **Fly.io** (free tier available)

**Steps for Railway.app:**

1. Go to https://railway.app
2. Create new project -> Deploy from GitHub
3. Select `AgentAudit` repo
4. Configure:
   - Service: `packages/demo-agent`
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `pnpm start`
5. Add Environment Variables:
   ```
   PRIVATE_KEY=<from .env>
   GOAT_RPC_URL=<from .env>
   RECEIVING_ADDRESS=<from .env>
   CORS_ORIGINS=https://your-frontend.vercel.app
   ```
6. Deploy and note the URL (e.g., `https://agentaudit-api.up.railway.app`)

#### Part B: Deploy Frontend to Vercel

1. Go to https://vercel.com/new
2. Select GitHub repo `AgentAudit`
3. **Root Directory**: `./Frontend`
4. **Environment Variables**:
   ```
   NEXT_PUBLIC_AGENT_API_URL=https://agentaudit-api.up.railway.app
   ```
5. Deploy

## Build & Deployment Settings

**For Vercel:**

1. **Build Settings**
   - Build Command: `pnpm build`
   - Output Directory: `Frontend/.next`
   - Install Command: `pnpm install`

2. **Environment Variables**

   ```
   NEXT_PUBLIC_AGENT_API_URL=<your-demo-agent-url>
   NEXT_PUBLIC_AGENT_REGISTRY=0x3de03AB80fdDDa888598303FF34E496bD29E140F
   NEXT_PUBLIC_REPUTATION_REGISTRY=0x4721bEF3A4A7226E63783d6546031eCEe3D59BF0
   NEXT_PUBLIC_VALIDATION_REGISTRY=0x9facA0523F1CEc547CE5e00a808338bF67a46924
   ```

3. **Monitoring**
   - Enable Vercel Analytics
   - Enable Real Experience Score

## Post-Deployment

After deployment:

1. **Test Frontend**
   - Visit your Vercel domain
   - Dashboard should load
   - Check agent status indicator

2. **Update Environment Variables**
   - If demo-agent URL changes, update in Vercel dashboard
   - Redeployment triggers automatically on git push to main

3. **Monitor Logs**
   - Vercel Dashboard -> Deployments -> Logs
   - Check for any API errors

## Security Notes

**For Production:**

- Use GitHub Secrets for sensitive environment variables
- Never commit `.env` files
- Use separate private keys for testnet vs. mainnet
- Rate limiting is enabled on API routes by default
- Set specific `CORS_ORIGINS` on the demo-agent instead of `*`

## Available Commands

```bash
# Local development (all packages)
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Type check
pnpm typecheck

# Start specific packages
pnpm dev:frontend     # Dashboard only
pnpm dev:demo         # Demo agent only
pnpm dev:contracts    # Local Hardhat node
```

## Troubleshooting

**Problem**: "Agent Offline" showing in dashboard

- Verify `NEXT_PUBLIC_AGENT_API_URL` environment variable is correct in Vercel settings
- Check that the demo-agent is running and accessible

**Problem**: Build fails

- Check build logs in Vercel dashboard
- Ensure `pnpm-lock.yaml` is committed (not `package-lock.json`)
- Run `pnpm typecheck` locally to catch TypeScript errors

**Problem**: API calls fail

- Check CORS settings (`CORS_ORIGINS` env var on demo-agent)
- Verify demo-agent is running
- Check RPC URL in `.env`
