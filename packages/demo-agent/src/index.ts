import express from 'express';
import { agentAudit } from 'agentaudit';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../../../.env') });

const app = express();

app.use(agentAudit({
  price: '0.001',
  agentId: '1',
  network: 'base-sepolia',
  receivingAddress: '0xDemoReceivingAddress',
  logCalls: true, // Logs to console (no database needed)
  onPaymentSuccess: (txHash, caller) => {
    console.log(`Payment received from ${caller}: ${txHash}`);
  }
}));

app.get('/analyze', (_req, res) => {
  res.json({ result: 'Analysis complete', sentiment: 'positive', confidence: 0.92 });
});

app.get('/summarize', (_req, res) => {
  res.json({ summary: 'This is a demo AI agent API secured by AgentAudit.' });
});

app.listen(3001, () => console.log('Demo agent running on :3001'));
