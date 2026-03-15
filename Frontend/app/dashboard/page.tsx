'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Activity, Bell, Settings, LogOut, Menu, X, RadioTower, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// ── Types ──────────────────────────────────────────────────
interface CallLog {
  agent_id: string;
  caller_address: string;
  endpoint: string;
  amount_usdc: string;
  tx_hash: string | null;
  status: 'verified' | 'rejected' | 'pending';
  latency_ms: number;
}

interface AgentData {
  agentId: string;
  owner: string;
  wallet: string;
  uri: string;
  reputation: { feedbackCount: number; avgScore: number };
}

interface LogsResponse {
  logs: CallLog[];
  totalCalls: number;
  totalEarned: string;
  status: string;
}

// ── Styling Constants (Partner's Palette) ──────────────────
const CHART_COLORS = ['#6366f1', '#06b6d4', '#ec4899'];
const BG_MAIN    = '#08091a';        // very deep navy
const BG_SIDEBAR = '#0a0d22';        // slightly lighter navy
const BG_CARD    = 'rgba(14,18,52,0.85)';
const BG_NAV     = 'rgba(10,13,34,0.85)';

const INDIGO     = '#6366f1';
const CYAN       = '#06b6d4';
const PINK       = '#ec4899';
const EMERALD    = '#34d399';

const navItems = ['Dashboard', 'Agents', 'Analytics', 'Reports', 'Settings'];

// ── Dashboard ──────────────────────────────────────────────
export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [logs, setLogs] = useState<CallLog[]>([]);
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [totalCalls, setTotalCalls] = useState(0);
  const [totalEarned, setTotalEarned] = useState('0.000');
  const [agentOnline, setAgentOnline] = useState(false);

  // Poll call logs every 5s
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/calls');
        const data: LogsResponse = await res.json();
        setLogs(data.logs ?? []);
        setTotalCalls(data.totalCalls ?? 0);
        setTotalEarned(data.totalEarned ?? '0.000');
        setAgentOnline(data.status === 'online');
      } catch { /* agent offline */ }
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch on-chain agent data once at load
  useEffect(() => {
    fetch('/api/agent?id=1')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setAgent(d))
      .catch(() => {});
  }, []);

  // Build chart data from logs
  const byEndpoint = logs.reduce<Record<string, number>>((acc, l) => {
    acc[l.endpoint] = (acc[l.endpoint] ?? 0) + 1;
    return acc;
  }, {});
  const chartData = Object.entries(byEndpoint).map(([name, calls]) => ({ name, calls }));
  if (chartData.length === 0) {
    chartData.push({ name: '/analyze', calls: 0 }, { name: '/summarize', calls: 0 });
  }

  const pieData = [
    { name: 'Verified', value: logs.filter(l => l.status === 'verified').length || 1 },
    { name: 'Rejected', value: logs.filter(l => l.status === 'rejected').length || 0 },
    { name: 'Pending',  value: logs.filter(l => l.status === 'pending').length || 0 },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const statCards = [
    {
      title: 'Total API Calls',
      value: totalCalls.toLocaleString(),
      subtitle: agentOnline ? '🟢 Agent Online' : '🔴 Agent Offline',
      icon: Activity,
      accent: CYAN,
    },
    {
      title: 'Total Earned (USDC)',
      value: `$${totalEarned}`,
      subtitle: '+$0.001 per verified call',
      icon: TrendingUp,
      accent: INDIGO,
    },
    {
      title: 'Agent Identity',
      value: agent ? `#${agent.agentId}` : 'Loading…',
      subtitle: agent ? `${agent.wallet.slice(0, 10)}…` : 'GOAT Testnet3',
      icon: Users,
      accent: PINK,
    },
    {
      title: 'Reputation Score',
      value: agent ? (agent.reputation.avgScore > 0 ? `${agent.reputation.avgScore.toFixed(1)}★` : 'N/A') : '—',
      subtitle: agent ? `${agent.reputation.feedbackCount} reviews` : 'Checking…',
      icon: BarChart3,
      accent: EMERALD,
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: BG_MAIN, display: 'flex', color: '#f0f1ff' }}>
      
      {/* ── Sidebar ─────────────────────────────── */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        style={{
          width: sidebarOpen ? 256 : 80,
          background: `linear-gradient(180deg, ${BG_SIDEBAR} 0%, #060817 100%)`,
          borderRight: '1px solid rgba(99,102,241,0.2)',
          padding: '24px 16px',
          position: 'fixed',
          height: '100vh',
          left: 0, top: 0,
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s ease',
          boxShadow: '4px 0 30px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          {sidebarOpen && (
            <span style={{
              fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              AgentAudit
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: 8, padding: 8, cursor: 'pointer', color: '#a5aaE2',
              transition: 'all 0.2s',
            }}
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {navItems.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ x: 4 }}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                cursor: 'pointer',
                fontWeight: i === 0 ? 600 : 500,
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: i === 0 ? '#fff' : 'rgb(165,170,210)',
                background:   i === 0 ? 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(6,182,212,0.15))' : 'transparent',
                border:       i === 0 ? '1px solid rgba(99,102,241,0.35)' : '1px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              {sidebarOpen ? item : item[0]}
            </motion.div>
          ))}
        </nav>

        {/* GOAT Network badge */}
        {sidebarOpen && (
          <div style={{ padding: '0 12px', marginBottom: 16 }}>
             <a href="https://explorer.testnet3.goat.network" target="_blank" rel="noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 11,
                color: 'rgb(130,135,175)', textDecoration: 'none',
                padding: '8px 10px', borderRadius: 8, background: 'rgba(52,211,153,0.05)',
                border: '1px solid rgba(52,211,153,0.1)',
              }}>
              <RadioTower className="w-3.5 h-3.5" style={{ color: EMERALD }} />
              <span>GOAT Testnet3</span>
              <ExternalLink className="w-3 h-3" style={{ marginLeft: 'auto' }} />
            </a>
          </div>
        )}

        <motion.div
          whileHover={{ x: 4 }}
          style={{
            padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 10,
            color: 'rgb(165,170,210)', fontSize: 14, fontWeight: 500,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgb(165,170,210)')}
        >
          <LogOut className="w-4 h-4" style={{ flexShrink: 0 }} />
          {sidebarOpen && 'Logout'}
        </motion.div>
      </motion.aside>

      {/* ── Main Content ────────────────────────── */}
      <main style={{
        flex: 1,
        marginLeft: sidebarOpen ? 256 : 80,
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        
        {/* Top Nav */}
        <nav style={{
          background: BG_NAV,
          borderBottom: '1px solid rgba(99,102,241,0.15)',
          backdropFilter: 'blur(16px)',
          padding: '16px 32px',
          position: 'sticky', top: 0, zIndex: 30,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f0f1ff', margin: 0 }}>Dashboard</h2>
            <p style={{ fontSize: 11, color: 'rgb(130,135,175)', marginTop: 4 }}>
              GOAT Chain 48816 • Identity: 0x3de0…140F
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
             <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
                background: agentOnline ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)',
                border: agentOnline ? `1px solid ${EMERALD}40` : '1px solid #ef444440',
                color: agentOnline ? EMERALD : '#ef4444',
                padding: '4px 12px', borderRadius: 20,
              }}>
                {agentOnline ? '● ONLINE' : '● OFFLINE'}
              </span>
            <button style={{
              position: 'relative', background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: 8, cursor: 'pointer',
            }}>
              <Bell className="w-5 h-5" style={{ color: INDIGO }} />
              {logs.length > 0 && (
                <span style={{
                  position: 'absolute', top: 6, right: 6, width: 8, height: 8,
                  borderRadius: '50%', background: '#ef4444',
                  boxShadow: '0 0 8px rgba(239,68,68,0.7)',
                }} />
              )}
            </button>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #06b6d4, #ec4899)',
              boxShadow: '0 0 16px rgba(99,102,241,0.5)',
            }} />
          </div>
        </nav>

        {/* Content area */}
        <div style={{ padding: 32, flex: 1 }}>
          
          {/* Stat cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 28 }}
          >
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ y: -6, scale: 1.02 }}
                  style={{
                    padding: 24, borderRadius: 16,
                    background: 'linear-gradient(135deg, rgba(14,18,52,0.95), rgba(20,25,65,0.95))',
                    border: `1px solid ${card.accent}33`,
                    boxShadow: `0 4px 24px rgba(0,0,0,0.3)`,
                    cursor: 'default',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{
                      padding: 10, borderRadius: 12,
                      background: `${card.accent}18`,
                      border: `1px solid ${card.accent}30`,
                    }}>
                      <Icon style={{ width: 20, height: 20, color: card.accent }} />
                    </div>
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: 'rgb(165,170,210)', margin: '0 0 6px' }}>{card.title}</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 4px', lineHeight: 1 }}>{card.value}</p>
                  <p style={{ fontSize: 11, color: 'rgb(130,135,175)', margin: 0 }}>{card.subtitle}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
            {/* Live Calls by Endpoint */}
            <motion.div
              variants={itemVariants} initial="hidden" animate="visible"
              style={{
                padding: 24, borderRadius: 16, background: BG_CARD,
                border: `1px solid ${INDIGO}20`, boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
              }}
            >
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f1ff', margin: '0 0 20px' }}>API Calls by Endpoint (Live)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                  <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#a5a7d2', fontSize: 11 }} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#a5a7d2', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(10,13,34,0.95)', border: `1px solid ${INDIGO}20`, borderRadius: 10 }}
                  />
                  <Bar dataKey="calls" fill={INDIGO} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Verification Status */}
            <motion.div
              variants={itemVariants} initial="hidden" animate="visible"
              style={{
                padding: 24, borderRadius: 16, background: BG_CARD,
                border: `1px solid ${PINK}20`, boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
              }}
            >
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f1ff', margin: '0 0 20px' }}>Verification Status</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" stroke="none">
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'rgba(10,13,34,0.95)', border: 'none', borderRadius: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Lower Grid: Feed + Identity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
            {/* Live Feed */}
            <motion.div
              variants={itemVariants} initial="hidden" animate="visible"
              style={{
                padding: 24, borderRadius: 16, background: BG_CARD,
                border: `1px solid ${CYAN}20`, boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
              }}
            >
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f1ff', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, background: EMERALD, borderRadius: '50%', boxShadow: `0 0 10px ${EMERALD}` }} />
                Live Call Feed
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
                {logs.length === 0 ? (
                  <p style={{ color: 'rgb(130,135,175)', fontSize: 13 }}>No calls yet. Try calling the demo agent at :3001</p>
                ) : (
                  logs.slice(0, 15).map((log, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      fontSize: 12, background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {log.status === 'verified' ? (
                          <span style={{ color: EMERALD }}>✓</span>
                        ) : (
                          <span style={{ color: '#ef4444' }}>×</span>
                        )}
                        <span style={{ fontWeight: 600 }}>{log.endpoint}</span>
                      </span>
                      <span style={{ color: 'rgb(165,170,210)', fontFamily: 'monospace' }}>
                        {log.caller_address.slice(0, 8)}…
                      </span>
                      <span style={{ color: INDIGO, fontWeight: 700 }}>${log.amount_usdc}</span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Identity */}
            {agent && (
              <motion.div
                variants={itemVariants} initial="hidden" animate="visible"
                style={{
                  padding: 24, borderRadius: 16, background: BG_CARD,
                  border: `1px solid ${EMERALD}20`, boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                }}
              >
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f1ff', margin: '0 0 16px' }}>On-Chain Identity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                   <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <p style={{ fontSize: 11, color: 'rgb(130,135,175)', marginBottom: 4 }}>Agent Token ID</p>
                      <p style={{ fontSize: 18, fontWeight: 800, color: INDIGO }}>#{agent.agentId}</p>
                   </div>
                   <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <p style={{ fontSize: 11, color: 'rgb(130,135,175)', marginBottom: 4 }}>Agent Wallet</p>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', fontFamily: 'monospace', wordBreak: 'break-all' }}>{agent.wallet}</p>
                   </div>
                   <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <p style={{ fontSize: 11, color: 'rgb(130,135,175)', marginBottom: 4 }}>Owner Address</p>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', fontFamily: 'monospace', wordBreak: 'break-all' }}>{agent.owner}</p>
                   </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <a href={`https://explorer.testnet3.goat.network/token/0x3de03AB80fdDDa888598303FF34E496bD29E140F/instance/${agent.agentId}`}
                     target="_blank" rel="noreferrer"
                     style={{ fontSize: 11, color: CYAN, textDecoration: 'none', fontWeight: 600 }}>
                    View on GOAT Explorer ↗
                  </a>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
