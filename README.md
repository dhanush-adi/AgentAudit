<div align="center">

# AgentAudit

**Stripe for AI Agents — Pay-per-call billing middleware for the Machine-to-Machine economy**

[![CI](https://github.com/dhanush-adi/AgentAudit/actions/workflows/ci.yml/badge.svg)](https://github.com/dhanush-adi/AgentAudit/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

[Quick Start](#quick-start) · [How It Works](#how-it-works) · [Configuration](#configuration) · [Smart Contracts](#smart-contracts) · [Development](#development)

</div>

---

## Overview

AgentAudit is an npm middleware that gates any Express API endpoint behind x402 micropayments. Drop it into your existing server in 3 lines — no accounts, no subscriptions, no billing logic. Machines pay machines, automatically, on-chain.

```
npm install agentaudit
```

```typescript
import express from 'express';
import { agentAudit } from 'agentaudit';

const app = express();

app.use(
  agentAudit({
    price: '0.001', // USDC per call
    agentId: '42', // Your on-chain agent ID
    network: 'goat-testnet', // 'base' | 'base-sepolia' | 'goat-testnet'
    receivingAddress: '0xYourWallet...',
  }),
);

app.get('/analyze', (_req, res) => {
  res.json({ result: 'Analysis complete', confidence: 0.92 });
});

app.listen(3001);
```

Every endpoint behind the middleware now returns **402 Payment Required** unless the caller includes a valid `x-payment` header.

---

## How It Works

```
 Buyer Agent                Seller API               GOAT Network
(Any AI Bot)          (AgentAudit Middleware)      (On-chain)
     │                        │                         │
     │── 1. Request ────────▶│                         │
     │                        │── 2. Verify ──────────▶│
     │                        │◀── 3. Valid? ──────────│
     │◀── 4. 402 or Data ────│                         │
     │                        │── 5. Settle ───────────▶│
     │                        │── 6. Log ──────────────▶ Console/Webhook
```

| Step  | What happens                                                                                    |
| ----- | ----------------------------------------------------------------------------------------------- |
| **1** | Buyer sends a request to any API endpoint                                                       |
| **2** | Middleware checks for `x-payment` header, verifies with x402 facilitator                        |
| **3** | Facilitator validates the payment signature on-chain                                            |
| **4** | If missing/invalid: returns `402` with payment demand. If valid: passes through to your handler |
| **5** | After your response is sent, middleware settles the payment on-chain (with retry)               |
| **6** | Call is logged to console and optionally to a webhook                                           |

---

## Configuration

```typescript
import { agentAudit, type AgentAuditConfig } from 'agentaudit';
```

| Option             | Type                                         | Required | Description                                      |
| ------------------ | -------------------------------------------- | -------- | ------------------------------------------------ |
| `price`            | `string`                                     | Yes      | Price per call in USDC (e.g. `"0.001"`)          |
| `agentId`          | `string`                                     | Yes      | Your on-chain agent token ID                     |
| `network`          | `'base' \| 'base-sepolia' \| 'goat-testnet'` | Yes      | Target blockchain network                        |
| `receivingAddress` | `` `0x${string}` ``                          | Yes      | EVM address that receives payments               |
| `dashboardWebhook` | `string`                                     | No       | URL to POST call logs to                         |
| `logCalls`         | `boolean`                                    | No       | Enable console/webhook logging (default: `true`) |
| `onPaymentSuccess` | `(txHash, caller, amount) => void`           | No       | Callback after successful settlement             |
| `onPaymentFail`    | `(reason, caller) => void`                   | No       | Callback when verification fails                 |

### Environment Variables

| Variable               | Description                            | Default                        |
| ---------------------- | -------------------------------------- | ------------------------------ |
| `X402_FACILITATOR_URL` | Custom facilitator endpoint            | `https://x402.org/facilitator` |
| `LOG_FORMAT`           | Set to `"json"` for structured logging | human-readable                 |

### Payment Flow

1. Request arrives — middleware checks for `x-payment` header
2. **Missing** → returns `402` with x402-compliant payment demand
3. **Present** → verifies with facilitator (10s timeout)
4. **Invalid** → returns `402` with error reason, logs as `rejected`
5. **Valid** → calls `next()`, your handler runs
6. **After response** → settles on-chain (3 retries with exponential backoff), logs as `verified`

---

## Smart Contracts

All contracts are deployed on **GOAT Testnet3** (Chain ID `48816`).

| Contract               | Address                                                                                                      | Description                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| **AgentRegistry**      | [`0x3de0...140F`](https://explorer.testnet3.goat.network/address/0x3de03AB80fdDDa888598303FF34E496bD29E140F) | ERC-721 agent identity NFTs with EIP-712 wallet delegation |
| **ReputationRegistry** | [`0x4721...9BF0`](https://explorer.testnet3.goat.network/address/0x4721bEF3A4A7226E63783d6546031eCEe3D59BF0) | On-chain feedback, scoring, and aggregated reputation      |
| **ValidationRegistry** | [`0x9fac...6924`](https://explorer.testnet3.goat.network/address/0x9facA0523F1CEc547CE5e00a808338bF67a46924) | Trust verification workflows with validator assignment     |

### AgentRegistry

| Function                                           | Description                              |
| -------------------------------------------------- | ---------------------------------------- |
| `register(string uri)`                             | Mint a new agent identity NFT            |
| `setAgentURI(uint256, string)`                     | Update agent metadata URI                |
| `setMetadata(uint256, string, bytes)`              | Set key-value metadata                   |
| `getMetadata(uint256, string)`                     | Read metadata value                      |
| `getAgentWallet(uint256)`                          | Get payment wallet (falls back to owner) |
| `setAgentWallet(uint256, address, uint256, bytes)` | Delegate wallet via EIP-712 signature    |

### ReputationRegistry

| Function                                                    | Description                |
| ----------------------------------------------------------- | -------------------------- |
| `giveFeedback(uint256, int128, uint8, string, string, ...)` | Submit scored feedback     |
| `revokeFeedback(uint256, uint64)`                           | Revoke a feedback entry    |
| `appendResponse(uint256, address, uint64, string, bytes32)` | Respond to feedback        |
| `getSummary(uint256, address[], string, string)`            | Aggregated score summary   |
| `readFeedback(uint256, address, uint64)`                    | Read single feedback entry |

### ValidationRegistry

| Function                                                      | Description                           |
| ------------------------------------------------------------- | ------------------------------------- |
| `validationRequest(address, uint256, string, bytes32)`        | Request validation from a validator   |
| `validationResponse(bytes32, uint8, string, bytes32, string)` | Validator responds with score (0-100) |
| `reclaimExpired(bytes32)`                                     | Reclaim expired validation request    |
| `getValidationStatus(bytes32)`                                | Query validation status               |

---

## Packages

```
AgentAudit/
├── packages/
│   ├── middleware/      # npm package "agentaudit" — the core product
│   ├── contracts/       # Solidity smart contracts (Hardhat)
│   └── demo-agent/      # Example Express API using the middleware
├── Frontend/            # Next.js dashboard for monitoring agents
├── .env.example         # All environment variables
├── Dockerfile           # Production container (pnpm + multi-stage)
└── turbo.json           # Turborepo pipeline config
```

| Package                | Path                   | Description                                                                |
| ---------------------- | ---------------------- | -------------------------------------------------------------------------- |
| `agentaudit`           | `packages/middleware/` | Core Express middleware — x402 gating, verification, settlement            |
| `contracts`            | `packages/contracts/`  | Solidity contracts — AgentRegistry, ReputationRegistry, ValidationRegistry |
| `demo-agent`           | `packages/demo-agent/` | Example API server for testing                                             |
| `agentaudit-dashboard` | `Frontend/`            | Next.js 16 dashboard with on-chain data                                    |

---

## Development

### Prerequisites

- Node.js >= 20
- pnpm >= 9 (`npm i -g pnpm`)

### Setup

```bash
# Clone
git clone https://github.com/dhanush-adi/AgentAudit.git
cd AgentAudit

# Install
pnpm install

# Configure
cp .env.example .env
# Edit .env with your values
```

### Commands

```bash
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm lint             # Lint source files
pnpm typecheck        # Type-check all packages

pnpm dev              # Start all packages in dev mode
pnpm dev:frontend     # Dashboard only (port 3000)
pnpm dev:demo         # Demo agent only (port 3001)
pnpm dev:contracts    # Local Hardhat node
```

### Running Locally

```bash
# Terminal 1: Start demo agent
pnpm dev:demo

# Terminal 2: Start dashboard
pnpm dev:frontend

# Test the payment gate
curl http://localhost:3001/analyze
# → 402 Payment Required (x402 demand)

# Test public endpoints
curl http://localhost:3001/health
# → {"status": "ok", ...}

# Dashboard
open http://localhost:3000/dashboard
```

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full instructions.

### Vercel (Dashboard)

```bash
# Set Root Directory to ./Frontend in Vercel dashboard
# Add environment variables:
NEXT_PUBLIC_AGENT_API_URL=https://your-agent-url.com
```

### Docker (Demo Agent)

```bash
docker build -t agentaudit .
docker run -p 3000:3000 agentaudit
```

---

## Testing

```bash
# Middleware tests (24 tests)
cd packages/middleware && pnpm test

# Contract tests
cd packages/contracts && npx hardhat test
```

**Test coverage:**

- `x402.test.ts` — payment verification, settlement, 402 response building
- `logger.test.ts` — console logging, webhook delivery
- `index.test.ts` — middleware integration, error handling

---

## Tech Stack

| Layer           | Technology                                      |
| --------------- | ----------------------------------------------- |
| Language        | TypeScript, Solidity                            |
| Smart Contracts | Hardhat, OpenZeppelin 5.x, EIP-712              |
| Middleware      | Express.js, x402 Protocol                       |
| Blockchain      | GOAT Network (Bitcoin L2)                       |
| Frontend        | Next.js 16, React 19, Tailwind CSS v4, Recharts |
| Monorepo        | Turborepo, pnpm                                 |
| CI/CD           | GitHub Actions                                  |
| Testing         | Vitest (middleware), Hardhat (contracts)        |

---

## Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/name`)
3. Run `pnpm lint` and `pnpm test`
4. Commit (`git commit -m 'feat: description'`)
5. Push and open a Pull Request

---

## License

MIT
