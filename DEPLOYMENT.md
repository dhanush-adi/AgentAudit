# Vercel Deployment Guide for AgentAudit

## 🚀 Quick Start

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
   ```
   (Update this to your demo-agent deployment URL when ready)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Option 2: Deploy Full Stack (Frontend + API)

#### Part A: Deploy Demo Agent API

The demo-agent can run on:
- **Railway.app** (free tier available)
- **Render.com** (free tier available)
- **Fly.io** (free tier available)
- **AWS Lambda** (with modifications)

**Steps for Railway.app:**
1. Go to https://railway.app
2. Create new project → Deploy from GitHub
3. Select `AgentAudit` repo
4. Configure:
   - Service: `packages/demo-agent`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add Environment Variables:
   ```
   PRIVATE_KEY=<from .env>
   GOAT_RPC_URL=<from .env>
   RECEIVING_ADDRESS=<from .env>
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

### Option 3: Use Vercel Functions for Demo Agent (Advanced)

Create `Frontend/api/demo.ts` to proxy demo-agent requests:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  const { endpoint } = req.query;
  
  try {
    const response = await fetch(`http://localhost:3001/${endpoint}`, {
      method: req.method,
      headers: req.headers,
      body: req.body,
    });
    
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'API Error' });
  }
}
```

## 🔧 Build & Deployment Settings

**For Vercel:**

1. **Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `Frontend/.next`
   - Install Command: `npm install`

2. **Environment Variables**
   ```
   NEXT_PUBLIC_AGENT_API_URL=<your-demo-agent-url>
   ```

3. **Monitoring**
   - Enable Vercel Analytics
   - Enable Real Experience Score

## 📊 Post-Deployment

After deployment:

1. **Test Frontend**
   - Visit your Vercel domain
   - Dashboard should load
   - Check agent status

2. **Update Environment Variables**
   - If demo-agent URL changes, update in Vercel dashboard
   - Redeployment triggers automatically

3. **Monitor Logs**
   - Vercel Dashboard → Deployments → Logs
   - Check for any API errors

## 🔐 Security Notes

**For Production:**
- Use GitHub Secrets for sensitive environment variables
- Never commit `.env` files
- Use separate private keys for testnet vs. mainnet
- Implement rate limiting on API endpoints

## 📝 Available Commands

```bash
# Local development
npm run dev

# Build
npm run build

# Start production
npm start

# Build specific package
npm run build -w packages/middleware
```

## 🆘 Troubleshooting

**Problem**: "Agent Offline" showing in dashboard
- **Solution**: Verify `NEXT_PUBLIC_AGENT_API_URL` environment variable is correct in Vercel settings

**Problem**: Build fails
- **Solution**: Check build logs in Vercel dashboard, ensure all dependencies installed

**Problem**: API calls fail
- **Solution**: Check CORS settings, verify demo-agent is running, check RPC URL in `.env`

## 🎯 Next Steps

1. Deploy to Vercel (Frontend)
2. Deploy demo-agent to Railway/Render (Backend)
3. Update environment variables
4. Test all endpoints
5. Monitor performance in Vercel Dashboard
