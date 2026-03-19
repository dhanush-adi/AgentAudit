<p align="center">
  <h1 align="center">AgentAudit</h1>
  <p align="center"><strong>Stripe for AI Agents — Pay-per-call billing middleware for the Machine-to-Machine economy</strong></p>
  <p align="center">
    <a href="#quick-start">Quick Start</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#packages">Packages</a> •
    <a href="#api-reference">API Reference</a> •
    <a href="#deployed-contracts">Deployed Contracts</a> •
    <a href="#contributing">Contributing</a>
  </p>
</p>

---

## What is AgentAudit?

AgentAudit is an npm middleware package that any developer drops into their Express/Node.js API in **3 lines of code** to:

1. **Gate** every API endpoint behind an [x402](https://docs.cdp.coinbase.com/x402/welcome) micropayment
2. **Register** the agent's identity on-chain using [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004)
3. **Log** all call activity, payments, and reputation to console and/or a custom webhook

> No accounts. No subscriptions. No custom billing logic.
> **Machines pay machines, automatically, on-chain.**

---

## Quick Start

### 1. Install

```bash
npm install agentaudit
```

### 2. Add 3 lines to your Express app

```typescript
import express from 'express';
import { agentAudit } from 'agentaudit';

const app = express();

app.use(
  agentAudit({
    price: '0.001', // USDC per call
    agentId: '42', // Your on-chain agent token ID
    network: 'goat-testnet', // 'base' | 'base-sepolia' | 'goat-testnet'
    receivingAddress: '0xYourWallet...',
  }),
);

app.get('/analyze', (_req, res) => {
  res.json({ result: 'Analysis complete', confidence: 0.92 });
});

app.listen(3001);
```

### 3. Test it

```bash
# Without payment header -> 402 Payment Required
curl http://localhost:3001/analyze

# With payment header -> your API response
curl -H "x-payment: <payment-payload>" http://localhost:3001/analyze
```

---

## Architecture

```
 Buyer Agent                Seller API               GOAT Network
(Any AI Bot)          (AgentAudit Middleware)      (On-chain)
     │                        │                         │
     │── 1. Request ────────▶│                         │
     │                        │── 2. Verify Payment ───▶│
     │                        │◀── 3. Valid? ──────────│
     │                        │                         │
     │◀── 4. 402 or Data ────│                         │
     │                        │── 5. Settle Payment ───▶│
     │                        │── 6. Log ──────────────▶ Console/Webhook
```

---

## Packages

| Package                    | Description                                                                                | Path                   |
| -------------------------- | ------------------------------------------------------------------------------------------ | ---------------------- |
| **`agentaudit`**           | Core Express middleware — x402 gating, payment verification, settlement, logging           | `packages/middleware/` |
| **`contracts`**            | Solidity smart contracts (Hardhat) — AgentRegistry, ReputationRegistry, ValidationRegistry | `packages/contracts/`  |
| **`demo-agent`**           | Example Express API using the middleware                                                   | `packages/demo-agent/` |
| **`agentaudit-dashboard`** | Next.js dashboard for monitoring agent activity                                            | `Frontend/`            |

---

## API Reference

### `agentAudit(config)`

Creates an Express middleware that gates API endpoints behind x402 micropayments.

**Config Options:**

| Option             | Type                                         | Required | Default | Description                                  |
| ------------------ | -------------------------------------------- | -------- | ------- | -------------------------------------------- |
| `price`            | `string`                                     | Yes      | —       | Price per API call in USDC (e.g., `"0.001"`) |
| `agentId`          | `string`                                     | Yes      | —       | Unique identifier for your agent             |
| `network`          | `'base' \| 'base-sepolia' \| 'goat-testnet'` | Yes      | —       | Target blockchain network                    |
| `receivingAddress` | `` `0x${string}` ``                          | Yes      | —       | EVM address that receives micropayments      |
| `dashboardWebhook` | `string`                                     | No       | —       | Webhook URL for real-time call logging       |
| `logCalls`         | `boolean`                                    | No       | `true`  | Whether to log calls to console/webhook      |
| `onPaymentSuccess` | `(txHash, caller, amount) => void`           | No       | —       | Callback after successful payment            |
| `onPaymentFail`    | `(reason, caller) => void`                   | No       | —       | Callback when payment verification fails     |

**Flow:**

1. Incoming request is checked for `x-payment` header
2. If missing: returns `402` with x402 payment demand
3. If present: verifies with x402 facilitator (10s timeout)
4. If invalid: returns `402` with error, logs as `rejected`
5. If valid: calls `next()`, logs as `verified` after response is sent
6. After response: settles payment on-chain (with retry on failure)

**Environment Variables:**

| Variable               | Description                                 | Default                        |
| ---------------------- | ------------------------------------------- | ------------------------------ |
| `X402_FACILITATOR_URL` | Custom x402 facilitator URL                 | `https://x402.org/facilitator` |
| `LOG_FORMAT`           | Set to `"json"` for structured JSON logging | human-readable                 |

---

## Smart Contracts

| Contract               | Description                                                       |
| ---------------------- | ----------------------------------------------------------------- |
| **AgentRegistry**      | ERC-721 agent identity NFTs with EIP-712 wallet delegation        |
| **ReputationRegistry** | On-chain feedback, scoring, and aggregated reputation             |
| **ValidationRegistry** | Trust verification workflows with validator assignment and expiry |

All contracts are on the GOAT Testnet3. See `packages/contracts/` for source and tests.

---

## Deployed Contracts

**Network:** GOAT Testnet3 (Chain ID `48816`)

| Contract           | Address                                      |
| ------------------ | -------------------------------------------- |
| AgentRegistry      | `0x3de03AB80fdDDa888598303FF34E496bD29E140F` |
| ReputationRegistry | `0x4721bEF3A4A7226E63783d6546031eCEe3D59BF0` |
| ValidationRegistry | `0x9facA0523F1CEc547CE5e00a808338bF67a46924` |

> Explorer: [explorer.testnet3.goat.network](https://explorer.testnet3.goat.network)

---

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run all tests
pnpm test

# Lint & format
pnpm lint
pnpm format

# Type check
pnpm typecheck

# Start development
pnpm dev              # All packages
pnpm dev:frontend     # Dashboard only
pnpm dev:demo         # Demo agent only
pnpm dev:contracts    # Local Hardhat node
```

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

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup instructions and coding conventions.

---

## License

MIT © [AgentAudit](https://github.com/dhanush-adi/AgentAudit)
