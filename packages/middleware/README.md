# agentaudit

**Stripe for AI Agents** — Pay-per-call billing middleware for the Machine-to-Machine economy.

## Install

```bash
npm install agentaudit
# or
pnpm add agentaudit
```

## Quick Start (3 lines)

```typescript
import express from 'express';
import { agentAudit } from 'agentaudit';

const app = express();

app.use(
  agentAudit({
    price: '0.001', // USDC per call
    agentId: 'my-agent-1',
    network: 'goat-testnet', // 'base' | 'base-sepolia' | 'goat-testnet'
    receivingAddress: '0xYourWalletAddress',
  }),
);

app.get('/analyze', (req, res) => {
  res.json({ result: 'Paid analysis complete' });
});

app.listen(3001);
```

## How It Works

1. **Gates** every API endpoint behind an x402 micropayment (USDC)
2. **Verifies** payment with the x402 facilitator (10s timeout)
3. **Settles** payment on-chain after the response is sent (with retry)
4. **Logs** all call activity to console (structured JSON optional) and webhook
5. **Assigns** a unique request ID for end-to-end tracing

## Configuration

| Option             | Type                                         | Required | Description                                      |
| ------------------ | -------------------------------------------- | -------- | ------------------------------------------------ |
| `price`            | `string`                                     | Yes      | Price per API call in USDC (e.g., `'0.001'`)     |
| `agentId`          | `string`                                     | Yes      | Unique identifier for your agent                 |
| `network`          | `'base' \| 'base-sepolia' \| 'goat-testnet'` | Yes      | Target blockchain network                        |
| `receivingAddress` | `` `0x${string}` ``                          | Yes      | Wallet address to receive payments               |
| `dashboardWebhook` | `string?`                                    | No       | URL to POST call logs to                         |
| `logCalls`         | `boolean?`                                   | No       | Enable/disable console logging (default: `true`) |
| `onPaymentSuccess` | `(txHash, caller, amount) => void?`          | No       | Callback on successful payment                   |
| `onPaymentFail`    | `(reason, caller) => void?`                  | No       | Callback on failed payment                       |

## Environment Variables

| Variable               | Description                                 | Default                        |
| ---------------------- | ------------------------------------------- | ------------------------------ |
| `X402_FACILITATOR_URL` | Custom x402 facilitator URL                 | `https://x402.org/facilitator` |
| `LOG_FORMAT`           | Set to `"json"` for structured JSON logging | human-readable                 |

## Flow

```
Request → Check x-payment header
  ├─ Missing → 402 with x402 payment demand
  └─ Present → Verify with facilitator
      ├─ Invalid → 402 with error (log rejected)
      └─ Valid → next() → Response → Settle (log verified)
```

## Error Handling

- Facilitator calls have a **10-second timeout** (configurable via `AbortSignal`)
- Non-JSON responses from the facilitator are handled gracefully
- Settlement failures are **retried up to 3 times** with exponential backoff
- Each request gets a **unique request ID** for tracing

## License

MIT
