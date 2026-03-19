'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Activity, TrendingUp, Shield, Search } from 'lucide-react';
import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';

const BG_MAIN = '#08091a';
const INDIGO = '#6366f1';
const CYAN = '#06b6d4';
const PINK = '#ec4899';
const EMERALD = '#34d399';
const AMBER = '#f59e0b';
const RED = '#ef4444';

const statCards = [
  { title: 'Total Agents', value: '24', subtitle: '+4 this month', icon: Bot, accent: INDIGO },
  { title: 'Active Now', value: '18', subtitle: '75% utilization', icon: Activity, accent: EMERALD },
  { title: 'Avg Efficiency', value: '91.7%', subtitle: '+2.3% vs last wk', icon: TrendingUp, accent: CYAN },
  { title: 'Alerts', value: '3', subtitle: '2 critical', icon: Shield, accent: RED },
];

const agents = [
  { id: 'AGT-001', name: 'Customer Support Bot', type: 'Support', status: 'active', efficiency: 96, calls: 3420, lastActive: '2 min ago' },
  { id: 'AGT-002', name: 'Data Analyzer', type: 'Analytics', status: 'active', efficiency: 94, calls: 2810, lastActive: '5 min ago' },
  { id: 'AGT-003', name: 'Security Monitor', type: 'Security', status: 'active', efficiency: 98, calls: 1950, lastActive: '1 min ago' },
  { id: 'AGT-004', name: 'Content Generator', type: 'Creative', status: 'idle', efficiency: 87, calls: 1240, lastActive: '23 min ago' },
  { id: 'AGT-005', name: 'Compliance Checker', type: 'Security', status: 'active', efficiency: 99, calls: 890, lastActive: '8 min ago' },
  { id: 'AGT-006', name: 'Email Responder', type: 'Support', status: 'error', efficiency: 72, calls: 2100, lastActive: '1 hr ago' },
];

const statusColor: Record<string, string> = { active: EMERALD, idle: AMBER, error: RED };

export default function AgentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');

  const filtered = agents.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'All' || a.type === filterType;
    return matchSearch && matchType;
  });

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <div style={{ minHeight: '100vh', background: BG_MAIN, display: 'flex', color: '#f0f1ff' }}>
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main style={{ flex: 1, marginLeft: sidebarOpen ? 256 : 80, transition: 'margin-left 0.3s ease', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopNav title="Agents" subtitle="GOAT Chain 48816 \u2022 Identity: 0x3de0\u2026140F" />

        <div style={{ padding: 32, flex: 1 }}>
          {/* Stat cards */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 28 }}>
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div key={i} variants={itemVariants} whileHover={{ y: -6, scale: 1.02 }} style={{ padding: 24, borderRadius: 16, background: 'linear-gradient(135deg, rgba(14,18,52,0.95), rgba(20,25,65,0.95))', border: `1px solid ${card.accent}33`, boxShadow: '0 4px 24px rgba(0,0,0,0.3)', cursor: 'default' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ padding: 10, borderRadius: 12, background: `${card.accent}18`, border: `1px solid ${card.accent}30` }}>
                      <Icon style={{ width: 20, height: 20, color: card.accent }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: card.accent, background: `${card.accent}18`, border: `1px solid ${card.accent}30`, padding: '3px 10px', borderRadius: 20 }}>{card.subtitle}</span>
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: 'rgb(165,170,210)', margin: '0 0 6px' }}>{card.title}</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1 }}>{card.value}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Search + Filter */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
              <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'rgb(130,135,175)' }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search agents by name or ID..." style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 10, border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(14,18,52,0.8)', color: '#f0f1ff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(14,18,52,0.8)', color: '#f0f1ff', fontSize: 13, cursor: 'pointer', outline: 'none' }}>
              <option value="All">All Types</option>
              <option value="Support">Support</option>
              <option value="Analytics">Analytics</option>
              <option value="Security">Security</option>
              <option value="Creative">Creative</option>
            </select>
          </div>

          {/* Agent table */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible" style={{ borderRadius: 16, background: 'linear-gradient(135deg, rgba(14,18,52,0.95), rgba(20,25,65,0.95))', border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(99,102,241,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f1ff', margin: 0 }}>Agent Registry</h3>
              <span style={{ fontSize: 12, color: 'rgb(130,135,175)' }}>{filtered.length} agents</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                    {['Agent', 'Type', 'Status', 'Efficiency', 'API Calls', 'Last Active'].map((h, i) => (
                      <th key={i} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'rgb(130,135,175)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((agent, i) => (
                    <tr key={agent.id} style={{ borderBottom: '1px solid rgba(99,102,241,0.06)', transition: 'background 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99,102,241,0.05)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: `${INDIGO}18`, border: `1px solid ${INDIGO}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bot style={{ width: 16, height: 16, color: INDIGO }} />
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#f0f1ff' }}>{agent.name}</p>
                            <p style={{ margin: 0, fontSize: 11, color: 'rgb(130,135,175)' }}>{agent.id}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: CYAN, background: `${CYAN}15`, border: `1px solid ${CYAN}25`, padding: '3px 10px', borderRadius: 6 }}>{agent.type}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: statusColor[agent.status] }}>{agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(99,102,241,0.15)', maxWidth: 80 }}>
                            <div style={{ width: `${agent.efficiency}%`, height: '100%', borderRadius: 3, background: agent.efficiency >= 90 ? EMERALD : agent.efficiency >= 80 ? AMBER : RED }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#f0f1ff' }}>{agent.efficiency}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: 'rgb(165,170,210)' }}>{agent.calls.toLocaleString()}</td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: 'rgb(130,135,175)' }}>{agent.lastActive}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
