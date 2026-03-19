import { CallLog } from './types';

/**
 * Logs a call entry to the console with structured output.
 * Optionally sends the log to a webhook endpoint for dashboard integration.
 *
 * @param log - The call log entry to record
 * @param dashboardWebhook - Optional webhook URL to POST the log to
 */
export async function logCall(log: CallLog, dashboardWebhook?: string) {
  const icon = log.status === 'verified' ? '✅' : log.status === 'rejected' ? '❌' : '⏳';

  // Structured JSON logging (parseable by log aggregators)
  const structuredLog = {
    timestamp: new Date().toISOString(),
    service: 'agentaudit',
    agent_id: log.agent_id,
    caller_address: log.caller_address,
    endpoint: log.endpoint,
    amount_usdc: log.amount_usdc,
    status: log.status,
    latency_ms: log.latency_ms,
    tx_hash: log.tx_hash,
    request_id: (log.payment_payload as any)?.requestId,
  };

  // Human-readable console output
  console.log(
    `${icon} [AgentAudit] agent=${log.agent_id} endpoint=${log.endpoint} ` +
      `amount=$${log.amount_usdc} status=${log.status} latency=${log.latency_ms}ms ` +
      `caller=${log.caller_address} tx=${log.tx_hash || 'none'}` +
      (structuredLog.request_id ? ` reqId=${structuredLog.request_id}` : ''),
  );

  // Machine-readable JSON output (for production log aggregators)
  if (process.env.LOG_FORMAT === 'json') {
    console.log(JSON.stringify(structuredLog));
  }

  // Optional: send logs to a custom webhook endpoint
  if (dashboardWebhook) {
    await fetch(dashboardWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    }).catch((err) => {
      console.error('AgentAudit: Webhook logging error', err);
    });
  }
}
