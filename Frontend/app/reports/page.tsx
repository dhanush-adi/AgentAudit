'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, Clock } from 'lucide-react';
import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';

const BG_MAIN = '#08091a';
const INDIGO = '#6366f1';
const CYAN = '#06b6d4';
const EMERALD = '#34d399';
const AMBER = '#f59e0b';

const reports = [
  { id: 1, title: 'Weekly Agent Performance', type: 'Performance', date: '2026-03-17', status: 'ready', size: '2.4 MB' },
  { id: 2, title: 'Security Audit Report', type: 'Security', date: '2026-03-15', status: 'ready', size: '5.1 MB' },
  { id: 3, title: 'Revenue Summary Q1 2026', type: 'Financial', date: '2026-03-01', status: 'ready', size: '1.8 MB' },
  { id: 4, title: 'Compliance Review', type: 'Compliance', date: '2026-02-28', status: 'ready', size: '3.2 MB' },
  { id: 5, title: 'Agent Efficiency Analysis', type: 'Performance', date: '2026-02-20', status: 'ready', size: '4.7 MB' },
];

const statusColor: Record<string, string> = { ready: EMERALD, pending: AMBER, failed: '#ef4444' };
const typeColor: Record<string, string> = { Performance: INDIGO, Security: '#ef4444', Financial: EMERALD, Compliance: CYAN };

export default function ReportsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <div style={{ minHeight: '100vh', background: BG_MAIN, display: 'flex', color: '#f0f1ff' }}>
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main style={{ flex: 1, marginLeft: sidebarOpen ? 256 : 80, transition: 'margin-left 0.3s ease', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopNav title="Reports" subtitle="GOAT Chain 48816 \u2022 Generated reports" />

        <div style={{ padding: 32, flex: 1 }}>
          <motion.div variants={itemVariants} initial="hidden" animate="visible" style={{ borderRadius: 16, background: 'linear-gradient(135deg, rgba(14,18,52,0.95), rgba(20,25,65,0.95))', border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(99,102,241,0.12)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f1ff', margin: 0 }}>Generated Reports</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {reports.map((report, i) => (
                <div
                  key={report.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 24px', borderBottom: i < reports.length - 1 ? '1px solid rgba(99,102,241,0.06)' : 'none',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99,102,241,0.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${INDIGO}18`, border: `1px solid ${INDIGO}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText style={{ width: 20, height: 20, color: INDIGO }} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#f0f1ff' }}>{report.title}</p>
                      <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                        <span style={{ fontSize: 11, color: typeColor[report.type], fontWeight: 500 }}>{report.type}</span>
                        <span style={{ fontSize: 11, color: 'rgb(130,135,175)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar style={{ width: 10, height: 10 }} /> {report.date}
                        </span>
                        <span style={{ fontSize: 11, color: 'rgb(130,135,175)' }}>{report.size}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: statusColor[report.status], background: `${statusColor[report.status]}15`, padding: '3px 10px', borderRadius: 20 }}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                    <button style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.1)', color: INDIGO, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Download style={{ width: 14, height: 14 }} /> Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
