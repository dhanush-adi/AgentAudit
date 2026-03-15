import express from 'express';
import { agentAudit } from 'agentaudit';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import type { CallLog } from 'agentaudit';

dotenv.config({ path: resolve(__dirname, '../../../.env') });

const app = express();
app.use(express.json());

// In-memory log store (last 200 calls)
const callLogs: CallLog[] = [];

// CORS for local frontend dev
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  next();
});

// ── Public endpoints — BEFORE middleware ────────────────────
app.get('/', (_req, res) => {
  res.json({
    name: 'AgentAudit Demo Agent',
    status: 'online',
    agentId: '1',
    network: 'GOAT Testnet3',
    endpoints: {
      public: ['/health', '/logs'],
      paid: ['/analyze', '/summarize']
    }
  });
});

app.get('/logs', (_req, res) => {
  res.json({
    logs: callLogs.slice(0, 50),
    totalCalls: callLogs.length,
    totalEarned: (callLogs.filter(l => l.status === 'verified').length * 0.001).toFixed(3),
    status: 'online',
  });
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    agentId: '1',
    network: 'GOAT Testnet3',
    contracts: {
      agentRegistry:      '0x3de03AB80fdDDa888598303FF34E496bD29E140F',
      reputationRegistry: '0x4721bEF3A4A7226E63783d6546031eCEe3D59BF0',
      validationRegistry: '0x9facA0523F1CEc547CE5e00a808338bF67a46924',
    },
  });
});

// ── Demo endpoints to simulate calls (for testing) ────────────
app.post('/demo/analyze', (_req, res) => {
  const log: CallLog = {
    agent_id: '1',
    caller_address: '0x' + Math.random().toString(16).substr(2) + Math.random().toString(16).substr(2),
    endpoint: '/analyze',
    amount_usdc: '0.001',
    tx_hash: '0x' + Math.random().toString(16).substr(2),
    status: 'verified',
    latency_ms: Math.floor(Math.random() * 80 + 20),
    payment_payload: {},
  };
  callLogs.unshift(log);
  if (callLogs.length > 200) callLogs.pop();
  res.json({ result: 'Analysis complete', sentiment: 'positive', confidence: 0.92, logged: true });
});

app.post('/demo/summarize', (_req, res) => {
  const log: CallLog = {
    agent_id: '1',
    caller_address: '0x' + Math.random().toString(16).substr(2) + Math.random().toString(16).substr(2),
    endpoint: '/summarize',
    amount_usdc: '0.001',
    tx_hash: '0x' + Math.random().toString(16).substr(2),
    status: 'verified',
    latency_ms: Math.floor(Math.random() * 60 + 10),
    payment_payload: {},
  };
  callLogs.unshift(log);
  if (callLogs.length > 200) callLogs.pop();
  res.json({ summary: 'This is a demo AI agent API secured by AgentAudit on GOAT Network.', logged: true });
});

const RECEIVING_ADDRESS = (process.env.RECEIVING_ADDRESS ||
  '0x2962B9266a48E8F83c583caD27Be093f231781b8') as `0x${string}`;

app.use(agentAudit({
  price: '0.001',
  agentId: '1',
  network: 'goat-testnet',
  receivingAddress: RECEIVING_ADDRESS,
  logCalls: true,
  reputationRegistry: '0x4721bEF3A4A7226E63783d6546031eCEe3D59BF0',
  identityRegistry:   '0x3de03AB80fdDDa888598303FF34E496bD29E140F',
  onPaymentSuccess: (txHash, caller, amount) => {
    console.log(`✅ Payment received from ${caller}: ${txHash} ($${amount})`);
  },
  onPaymentFail: (reason, caller) => {
    const log: CallLog = {
      agent_id: '1',
      caller_address: caller,
      endpoint: 'unknown',
      amount_usdc: '0.001',
      tx_hash: null,
      status: 'rejected',
      latency_ms: 0,
      payment_payload: { reason },
    };
    callLogs.unshift(log);
    if (callLogs.length > 200) callLogs.pop();
  },
}));

// ── Paid endpoints ─────────────────────────────────────────

app.get('/analyze', (req, res) => {
  const log: CallLog = {
    agent_id: '1',
    caller_address: req.headers['x-caller-address'] as string || 'unknown',
    endpoint: '/analyze',
    amount_usdc: '0.001',
    tx_hash: req.headers['x-tx-hash'] as string || null,
    status: 'verified',
    latency_ms: Math.floor(Math.random() * 80 + 20),
    payment_payload: {},
  };
  callLogs.unshift(log);
  if (callLogs.length > 200) callLogs.pop();
  res.json({ result: 'Analysis complete', sentiment: 'positive', confidence: 0.92 });
});

app.get('/summarize', (req, res) => {
  const log: CallLog = {
    agent_id: '1',
    caller_address: req.headers['x-caller-address'] as string || 'unknown',
    endpoint: '/summarize',
    amount_usdc: '0.001',
    tx_hash: req.headers['x-tx-hash'] as string || null,
    status: 'verified',
    latency_ms: Math.floor(Math.random() * 60 + 10),
    payment_payload: {},
  };
  callLogs.unshift(log);
  if (callLogs.length > 200) callLogs.pop();
  res.json({ summary: 'This is a demo AI agent API secured by AgentAudit on GOAT Network.' });
});

app.listen(3001, () => console.log('🤖 AgentAudit demo-agent running on :3001'));
