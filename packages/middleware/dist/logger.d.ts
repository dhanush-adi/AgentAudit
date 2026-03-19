import { CallLog } from './types';
/**
 * Logs a call entry to the console with structured output.
 * Optionally sends the log to a webhook endpoint for dashboard integration.
 *
 * @param log - The call log entry to record
 * @param dashboardWebhook - Optional webhook URL to POST the log to
 */
export declare function logCall(log: CallLog, dashboardWebhook?: string): Promise<void>;
