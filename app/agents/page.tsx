'use client';

import { motion } from 'framer-motion';
import {
  Bell, Settings, Menu, X, LayoutDashboard, Bot, LineChart as LineIcon,
  FileText, LogOut, Users, Activity, TrendingUp, Shield, Search,
  MoreVertical, Circle, Zap, Brain, Eye, MessageSquare, ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

/* ── Design tokens ──────────────────────── */
const BG_MAIN    = '#08091a';
const BG_SIDEBAR = '#0a0d22';
const BG_NAV     = 'rgba(10,13,34,0.85)';
const CARD_BG    = 'linear-gradient(135deg, rgba(14,18,52,0.95), rgba(20,25,65,0.95))';
const INDIGO     = '#6366f1';
const CYAN       = '#06b6d4';
const PINK       = '#ec4899';
const EMERALD    = '#34d399';
const AMBER      = '#f59e0b';
const RED        = '#ef4444';

/* ── Nav items ──────────────────────────── */
const navItems = [
  { label: 'Dashboard', path: '/dashboard',  icon: LayoutDashboard },
  { label: 'Agents',    path: '/agents',     icon: Bot },
  { label: 'Analytics', path: '/analytics',  icon: LineIcon },
  { label: 'Reports',   path: '/reports',    icon: FileText },
  { label: 'Settings',  path: '/settings',   icon: Settings },
];

/* ── Stat cards ─────────────────────────── */
const statCards = [
  { title: 'Total Agents',   value: '24',    subtitle: '+4 this month',   icon: Bot,        accent: INDIGO },
  { title: 'Active Now',     value: '18',    subtitle: '75% utilization',  icon: Activity,   accent: EMERALD },
  { title: 'Avg Efficiency', value: '91.7%', subtitle: '+2.3% vs last wk', icon: TrendingUp, accent: CYAN },
  { title: 'Alerts',         value: '3',     subtitle: '2 critical',       icon: Shield,     accent: RED },
];

/* ── Agent data ─────────────────────────── */
const agents = [
  { id: 'AGT-001', name: 'Customer Support Bot',  type: 'Support',    status: 'active',   efficiency: 96, calls: 3420, lastActive: '2 min ago',  icon: MessageSquare },
  { id: 'AGT-002', name: 'Data Analyzer',         type: 'Analytics',  status: 'active',   efficiency: 94, calls: 2810, lastActive: '5 min ago',  icon: Brain },
  { id: 'AGT-003', name: 'Security Monitor',      type: 'Security',   status: 'active',   efficiency: 98, calls: 1950, lastActive: '1 min ago',  icon: Shield },
  { id: 'AGT-004', name: 'Content Generator',     type: 'Creative',   status: 'idle',     efficiency: 87, calls: 1240, lastActive: '23 min ago', icon: Zap },
  { id: 'AGT-005', name: 'Compliance Checker',    type: 'Security',   status: 'active',   efficiency: 99, calls: 890,  lastActive: '8 min ago',  icon: Eye },
  { id: 'AGT-006', name: 'Email Responder',       type: 'Support',    status: 'error',    efficiency: 72, calls: 2100, lastActive: '1 hr ago',   icon: MessageSquare },
  { id: 'AGT-007', name: 'Report Builder',        type: 'Analytics',  status: 'active',   efficiency: 91, calls: 760,  lastActive: '12 min ago', icon: FileText },
  { id: 'AGT-008', name: 'Fraud Detector',        type: 'Security',   status: 'active',   efficiency: 97, calls: 4100, lastActive: '30 sec ago', icon: Shield },
];

const statusColor: Record<string, string> = { active: EMERALD, idle: AMBER, error: RED };
const statusLabel: Record<string, string> = { active: 'Active', idle: 'Idle', error: 'Error' };

/* ── Chart data ─────────────────────────── */
const performanceData = [
  { name: 'Support Bot',   efficiency: 96, calls: 3420 },
  { name: 'Analyzer',      efficiency: 94, calls: 2810 },
  { name: 'Security Mon',  efficiency: 98, calls: 1950 },
  { name: 'Content Gen',   efficiency: 87, calls: 1240 },
  { name: 'Compliance',    efficiency: 99, calls: 890 },
  { name: 'Email Resp',    efficiency: 72, calls: 2100 },
  { name: 'Report Bld',    efficiency: 91, calls: 760 },
  { name: 'Fraud Det',     efficiency: 97, calls: 4100 },
];

const typeDistribution = [
  { name: 'Support',   value: 35 },
  { name: 'Analytics', value: 25 },
  { name: 'Security',  value: 30 },
  { name: 'Creative',  value: 10 },
];
const PIE_COLORS = [INDIGO, CYAN, PINK, AMBER];

const radarData = [
  { metric: 'Speed',       value: 92 },
  { metric: 'Accuracy',    value: 96 },
  { metric: 'Uptime',      value: 99 },
  { metric: 'Throughput',  value: 88 },
  { metric: 'Cost Eff.',   value: 85 },
  { metric: 'Compliance',  value: 97 },
];

/* ── Component ──────────────────────────── */
export default function AgentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch]           = useState('');
  const [filterType, setFilterType]   = useState('All');
  const router   = useRouter();
  const pathname = usePathname();

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants      = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  const filteredAgents = agents.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
    const matchType   = filterType === 'All' || a.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div style={{ minHeight: '100vh', background: BG_MAIN, display: 'flex', color: '#f0f1ff' }}>

      {/* ── Sidebar ─────────────────────────── */}
      <motion.aside
        initial={{ x: -280 }} animate={{ x: 0 }} transition={{ type: 'spring', damping: 25 }}
        style={{
          width: sidebarOpen ? 256 : 80,
          background: `linear-gradient(180deg, ${BG_SIDEBAR} 0%, #060817 100%)`,
          borderRight: '1px solid rgba(99,102,241,0.2)', padding: '24px 16px',
          position: 'fixed', height: '100vh', left: 0, top: 0, zIndex: 40,
          display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease',
          boxShadow: '4px 0 30px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          {sidebarOpen && (
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AgentAudit
            </span>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#a5aaE2', transition: 'all 0.2s' }}>
            {sidebarOpen ? <X className="w-4 h-4" style={{ color: '#a5a7e2' }} /> : <Menu className="w-4 h-4" style={{ color: '#a5a7e2' }} />}
          </button>
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {navItems.map((item, i) => { const isActive = pathname === item.path; const Icon = item.icon; return (
            <motion.div key={i} whileHover={{ x: 4 }} onClick={() => router.push(item.path)} style={{ padding: '10px 12px', borderRadius: 10, cursor: 'pointer', fontWeight: isActive ? 600 : 500, fontSize: 14, display: 'flex', alignItems: 'center', gap: 10, color: isActive ? '#fff' : 'rgb(165,170,210)', background: isActive ? 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(6,182,212,0.15))' : 'transparent', border: isActive ? '1px solid rgba(99,102,241,0.35)' : '1px solid transparent', transition: 'all 0.2s' }}>
              <Icon className="w-4 h-4" style={{ flexShrink: 0 }} />{sidebarOpen && item.label}
            </motion.div>
          ); })}
        </nav>
        <motion.div whileHover={{ x: 4 }} style={{ padding: '10px 12px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, color: 'rgb(165,170,210)', fontSize: 14, fontWeight: 500, transition: 'all 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')} onMouseLeave={e => (e.currentTarget.style.color = 'rgb(165,170,210)')}>
          <LogOut className="w-4 h-4" style={{ flexShrink: 0 }} />{sidebarOpen && 'Logout'}
        </motion.div>
      </motion.aside>

      {/* ── Main ────────────────────────────── */}
      <main style={{ flex: 1, marginLeft: sidebarOpen ? 256 : 80, transition: 'margin-left 0.3s ease', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* Top bar */}
        <nav style={{ background: BG_NAV, borderBottom: '1px solid rgba(99,102,241,0.15)', backdropFilter: 'blur(16px)', padding: '16px 32px', position: 'sticky', top: 0, zIndex: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f0f1ff', margin: 0 }}>Agents</h2>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button style={{ position: 'relative', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: 8, cursor: 'pointer' }}>
              <Bell className="w-5 h-5" style={{ color: INDIGO }} />
              <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px rgba(239,68,68,0.7)' }} />
            </button>
            <button style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 8, padding: 8, cursor: 'pointer' }}>
              <Settings className="w-5 h-5" style={{ color: CYAN }} />
            </button>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #06b6d4, #ec4899)', boxShadow: '0 0 16px rgba(99,102,241,0.5)' }} />
          </div>
        </nav>

        {/* Content */}
        <div style={{ padding: 32, flex: 1 }}>

          {/* ── Stat Cards ──────────────── */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 28 }}>
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div key={i} variants={itemVariants} whileHover={{ y: -6, scale: 1.02 }} style={{ padding: 24, borderRadius: 16, background: CARD_BG, border: `1px solid ${card.accent}33`, boxShadow: `0 4px 24px rgba(0,0,0,0.3)`, cursor: 'default' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ padding: 10, borderRadius: 12, background: `${card.accent}18`, border: `1px solid ${card.accent}30` }}>
                      <Icon style={{ width: 20, height: 20, color: card.accent }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: card.accent, background: `${card.accent}18`, border: `1px solid ${card.accent}30`, padding: '3px 10px', borderRadius: 20 }}>
                      {card.subtitle}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: 'rgb(165,170,210)', margin: '0 0 6px' }}>{card.title}</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 4px', lineHeight: 1 }}>{card.value}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* ── Search + Filter ─────────── */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible" style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
              <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'rgb(130,135,175)' }} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search agents by name or ID..."
                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 10, border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(14,18,52,0.8)', color: '#f0f1ff', fontSize: 13, outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' }}
                onFocus={e => (e.target.style.borderColor = INDIGO)}
                onBlur={e => (e.target.style.borderColor = 'rgba(99,102,241,0.2)')}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <select
                value={filterType} onChange={e => setFilterType(e.target.value)}
                style={{ appearance: 'none', padding: '10px 36px 10px 14px', borderRadius: 10, border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(14,18,52,0.8)', color: '#f0f1ff', fontSize: 13, cursor: 'pointer', outline: 'none' }}
              >
                <option value="All">All Types</option>
                <option value="Support">Support</option>
                <option value="Analytics">Analytics</option>
                <option value="Security">Security</option>
                <option value="Creative">Creative</option>
              </select>
              <ChevronDown style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'rgb(130,135,175)', pointerEvents: 'none' }} />
            </div>
          </motion.div>

          {/* ── Agent Table ─────────────── */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }} style={{ borderRadius: 16, background: CARD_BG, border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(99,102,241,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f1ff', margin: 0 }}>Agent Registry</h3>
              <span style={{ fontSize: 12, color: 'rgb(130,135,175)' }}>{filteredAgents.length} agents</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                    {['Agent', 'Type', 'Status', 'Efficiency', 'API Calls', 'Last Active', ''].map((h, i) => (
                      <th key={i} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'rgb(130,135,175)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAgents.map((agent, i) => {
                    const AgentIcon = agent.icon;
                    return (
                      <motion.tr key={agent.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} style={{ borderBottom: '1px solid rgba(99,102,241,0.06)', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${INDIGO}18`, border: `1px solid ${INDIGO}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <AgentIcon style={{ width: 16, height: 16, color: INDIGO }} />
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Circle style={{ width: 8, height: 8, fill: statusColor[agent.status], color: statusColor[agent.status] }} />
                            <span style={{ fontSize: 12, fontWeight: 500, color: statusColor[agent.status] }}>{statusLabel[agent.status]}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(99,102,241,0.15)', maxWidth: 80 }}>
                              <div style={{ width: `${agent.efficiency}%`, height: '100%', borderRadius: 3, background: agent.efficiency >= 90 ? EMERALD : agent.efficiency >= 80 ? AMBER : RED, transition: 'width 0.5s' }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#f0f1ff' }}>{agent.efficiency}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: 'rgb(165,170,210)' }}>{agent.calls.toLocaleString()}</td>
                        <td style={{ padding: '14px 16px', fontSize: 12, color: 'rgb(130,135,175)' }}>{agent.lastActive}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}>
                            <MoreVertical style={{ width: 16, height: 16, color: 'rgb(130,135,175)' }} />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* ── Charts row ──────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

            {/* Performance bar chart */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }} style={{ padding: 24, borderRadius: 16, background: CARD_BG, border: '1px solid rgba(6,182,212,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f1ff', margin: '0 0 20px' }}>Agent Efficiency Comparison</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={performanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.12)" />
                  <XAxis type="number" domain={[0, 100]} stroke="#6b7280" tick={{ fill: '#a5a7d2', fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={90} stroke="#6b7280" tick={{ fill: '#a5a7d2', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'rgba(10,13,34,0.95)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 10, color: '#f0f1ff', fontSize: 13 }} />
                  <Bar dataKey="efficiency" fill={CYAN} radius={[0, 6, 6, 0]} barSize={18} style={{ filter: 'drop-shadow(0 0 6px rgba(6,182,212,0.4))' }} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Agent type distribution */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }} style={{ padding: 24, borderRadius: 16, background: CARD_BG, border: '1px solid rgba(236,72,153,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f1ff', margin: '0 0 20px' }}>Agent Type Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={typeDistribution} cx="50%" cy="50%" outerRadius={90} innerRadius={55} dataKey="value" labelLine={false} label={({ name, value }) => `${name} ${value}%`}>
                    {typeDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} style={{ filter: `drop-shadow(0 0 8px ${PIE_COLORS[index]}80)` }} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'rgba(10,13,34,0.95)', border: '1px solid rgba(236,72,153,0.3)', borderRadius: 10, color: '#f0f1ff', fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* ── Radar chart ─────────────── */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }} style={{ padding: 24, borderRadius: 16, background: CARD_BG, border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f1ff', margin: '0 0 20px' }}>Fleet Performance Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="rgba(99,102,241,0.15)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#a5a7d2', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                <Radar name="Fleet Avg" dataKey="value" stroke={INDIGO} fill={INDIGO} fillOpacity={0.25} strokeWidth={2} />
                <Tooltip contentStyle={{ background: 'rgba(10,13,34,0.95)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10, color: '#f0f1ff', fontSize: 13 }} />
                <Legend wrapperStyle={{ color: '#a5a7d2', fontSize: 13 }} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
