import { createClient } from '@supabase/supabase-js';
import { CallLog } from './types';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabase: any = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export async function logCallToSupabase(log: CallLog, dashboardWebhook?: string) {
  try {
    if (supabase) {
      const { error } = await supabase.from('call_logs').insert([log]);
      if (error) {
        console.error('AgentAudit: Supabase logging error', error);
      }
    }
    
    if (dashboardWebhook) {
      await fetch(dashboardWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log)
      }).catch(err => {
        console.error('AgentAudit: Webhook logging error', err);
      });
    }
  } catch (error) {
    console.error('AgentAudit: Failed to log call', error);
  }
}
