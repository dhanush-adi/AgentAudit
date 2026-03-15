<p align="center">
  <h1 align="center">🛡️ AgentAudit</h1>
  <p align="center"><strong>Stripe for AI Agents — Pay-per-call billing middleware for the Machine-to-Machine economy</strong></p>
  <p align="center">
    <a href="#quick-start">Quick Start</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#packages">Packages</a> •
    <a href="#deployed-contracts">Deployed Contracts</a> •
    <a href="#environment-variables">Environment Variables</a> •
    <a href="#contributing">Contributing</a>
  </p>
</p>

---

## 🔍 What is AgentAudit?

AgentAudit is an npm middleware package that any developer drops into their Express/Node.js API in **3 lines of code** to:

1. **Gate** every API endpoint behind an [x402](https://docs.cdp.coinbase.com/x402/welcome) micropayment
2. **Register** the agent's identity on-chain using [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004)
3. **Log** all call activity, payments, and reputation to a live real-time dashboard

> No accounts. No subscriptions. No custom billing logic.  
> **Machines pay machines, automatically, on-chain.**

---

## ⚡ Quick Start

### 1. Install the middleware

```bash
npm install agentaudit
```

### 2. Add 3 lines to your Express app

```typescript
import express from 'express';
import { agentAudit } from 'agentaudit';

const app = express();

// 🛡️ This is all you need
app.use(agentAudit({
  price: '0.001',           // USDC per call
  agentId: '42',            // Your on-chain agent token ID
  network: 'base-sepolia',  // Target network
  receivingAddress: '0xYourWallet...',
}));

app.get('/analyze', (_req, res) => {
  res.json({ result: 'Analysis complete', confidence: 0.92 });
});

app.listen(3001);
```

### 3. Try it

```bash
# Without payment → 402 Payment Required
curl http://localhost:3001/analyze

# Returns a structured x402 payment demand:
# { "x402Version": 1, "accepts": [{ "scheme": "exact", "network": "eip155:84532", ... }] }
```

---

## 🏗️ Architecture

```
┌─────────────────┐       ┌────────────────────────────┐       ┌────────────────┐
│  Buyer Agent    │──1──▶ │  Seller API                │──4──▶ │  Dashboard     │
│  (Any AI Bot)   │       │  (w/ AgentAudit Middleware) │       │  (Supabase RT) │
└─────────────────┘       └──────────┬─────────────────┘       └────────────────┘
                                     │
                               2. Verify │ 3. Settle
                                     ▼
                          ┌──────────────────────┐
                          │   GOAT Network       │
                          │   (ERC-8004 Identity) │
                          │   (Reputation NFTs)   │
                          └──────────────────────┘
```

**Flow:**
1. A buyer agent calls the seller's API endpoint.
2. The `agentAudit` middleware checks for a valid `x-payment` header. If missing, it returns a **402 Payment Required** with payment instructions.
3. Once payment is verified on-chain, the middleware settles the transaction and lets the request through.
4. Every call is logged to **Supabase** in real-time for the dashboard.

---

## 📦 Packages

This is a **Turborepo monorepo** with the following packages:

| Package | Description | Path |
|---|---|---|
| **`agentaudit`** | Core Express middleware — x402 gating, payment verification, settlement, logging | `packages/middleware/` |
| **`contracts`** | Solidity smart contracts (Hardhat) — AgentRegistry, ReputationRegistry, ValidationRegistry | `packages/contracts/` |
| **`demo-agent`** | Example Express API using the middleware | `packages/demo-agent/` |
| **`supabase`** | Database schema for call logs and agent data | `packages/supabase/` |

---

## 📜 Smart Contracts

### AgentRegistry.sol
Implements the **ERC-8004** identity standard. Each agent is minted as an NFT with:
- On-chain URI pointing to agent metadata (IPFS)
- EIP-712 signature-verified wallet rotation
- Metadata key-value storage

### ReputationRegistry.sol
On-chain reputation system:
- Clients give/revoke star ratings and text feedback
- Agents can append responses
- Aggregated reputation summaries queryable by anyone

### ValidationRegistry.sol
Trust verification workflows:
- Third parties can request validation of an agent
- Agents respond with proof
- Validators issue scores that are permanently recorded

---

## 🌐 Deployed Contracts

**Network:** GOAT Testnet3 (Chain ID `48816`)

| Contract | Address |
|---|---|
| AgentRegistry | `0x3de03AB80fdDDa888598303FF34E496bD29E140F` |
| ReputationRegistry | `0x4721bEF3A4A7226E63783d6546031eCEe3D59BF0` |
| ValidationRegistry | `0x9facA0523F1CEc547CE5e00a808338bF67a46924` |

> Explorer: [explorer.testnet3.goat.network](https://explorer.testnet3.goat.network)

---

## 🔐 Environment Variables

Create a `.env` file in the project root:

```env
# EVM wallet private key (for deployment & agent actions)
PRIVATE_KEY=your_private_key_here

# GOAT Network RPC
GOAT_RPC_URL=https://rpc.testnet3.goat.network

# Telegram Bot (for OpenClaw integration)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# OpenRouter API Key (for AI model access)
OPENROUTER_API_KEY=your_openrouter_key

# Supabase (for dashboard)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🧪 Development

```bash
# Install all dependencies
npm install

# Build all packages
npm run build

# Run smart contract tests
cd packages/contracts && npx hardhat test

# Start the demo agent
cd packages/demo-agent && npm run dev
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript, Solidity |
| Smart Contracts | Hardhat, OpenZeppelin, ERC-8004, EIP-712 |
| Middleware | Express.js, x402 Protocol |
| Blockchain | GOAT Network (Bitcoin L2) |
| AI Gateway | OpenClaw + Telegram |
| Database | Supabase (Postgres + Realtime) |
| Monorepo | Turborepo |

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT © [AgentAudit](https://github.com/dhanush-adi/AgentAudit)

---

<p align="center">
  <strong>Built for the Machine-to-Machine Economy 🤖💰🤖</strong>
</p>
