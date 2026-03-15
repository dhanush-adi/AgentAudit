'use client';

import { motion } from 'framer-motion';
import {
  Bell, Settings, Menu, X, LayoutDashboard, Bot, LineChart as LineIcon,
  FileText, LogOut, TrendingUp, TrendingDown, Clock, Zap, Globe,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, Scatter,
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
const VIOLET     = '#8b5cf6';

const navItems = [
  { label: 'Dashboard', path: '/dashboard',  icon: LayoutDashboard },
  { label: 'Agents',    path: '/agents',     icon: Bot },
  { label: 'Analytics', path: '/analytics',  icon: LineIcon },
  { label: 'Reports',   path: '/reports',    icon: FileText },
  { label: 'Settings',  path: '/settings',   icon: Settings },
];

/* ── Stat cards ─────────────────────────── */
const statCards = [
  { title: 'Total Requests',  value: '148.2K', subtitle: '+12.5%', trend: 'up',   icon: Globe,       accent: INDIGO },
  { title: 'Avg Response',    value: '245ms',  subtitle: '-18ms',  trend: 'up',   icon: Clock,       accent: CYAN },
  { title: 'Success Rate',    value: '99.2%',  subtitle: '+0.3%',  trend: 'up',   icon: TrendingUp,  accent: EMERALD },
  { title: 'Error Rate',      value: '0.8%',   subtitle: '-0.2%',  trend: 'down', icon: TrendingDown, accent: PINK },
];

/* ── Chart data ─────────────────────────── */
const timeSeriesData = [
  { time: '00:00', requests: 1200, errors: 12, latency: 210, tokens: 45000 },
  { time: '04:00', requests: 800,  errors: 5,  latency: 195, tokens: 32000 },
  { time: '08:00', requests: 3400, errors: 28, latency: 280, tokens: 128000 },
  { time: '10:00', requests: 5200, errors: 45, latency: 310, tokens: 198000 },
  { time: '12:00', requests: 6100, errors: 52, latency: 295, tokens: 245000 },
  { time: '14:00', requests: 5800, errors: 48, latency: 270, tokens: 220000 },
  { time: '16:00', requests: 4900, errors: 38, latency: 255, tokens: 186000 },
  { time: '18:00', requests: 4200, errors: 32, latency: 240, tokens: 160000 },
  { time: '20:00', requests: 3100, errors: 22, latency: 225, tokens: 118000 },
  { time: '22:00', requests: 2000, errors: 15, latency: 215, tokens: 76000 },
];

const weeklyData = [
  { day: 'Mon', calls: 18400, successRate: 98.8, avgLatency: 252 },
  { day: 'Tue', calls: 21200, successRate: 99.1, avgLatency: 248 },
  { day: 'Wed', calls: 24500, successRate: 99.4, avgLatency: 235 },
  { day: 'Thu', calls: 22800, successRate: 99.2, avgLatency: 241 },
  { day: 'Fri', calls: 26100, successRate: 99.5, avgLatency: 228 },
  { day: 'Sat', calls: 15200, successRate: 99.0, avgLatency: 260 },
  { day: 'Sun', calls: 12400, successRate: 98.9, avgLatency: 265 },
];

const categoryData = [
  { category: 'Customer Support', requests: 42000, avgTime: 320, satisfaction: 94 },
  { category: 'Data Processing',  requests: 35000, avgTime: 180, satisfaction: 97 },
  { category: 'Security Scans',   requests: 28000, avgTime: 150, satisfaction: 99 },
  { category: 'Content Gen',      requests: 22000, avgTime: 450, satisfaction: 91 },
  { category: 'Code Review',      requests: 18000, avgTime: 520, satisfaction: 93 },
  { category: 'Compliance',       requests: 8200,  avgTime: 280, satisfaction: 98 },
];

const modelUsageData = [
  { name: 'GPT-4o',       value: 38 },
  { name: 'Claude 3.5',   value: 28 },
  { name: 'Gemini Pro',   value: 18 },
  { name: 'Llama 3',      value: 10 },
  { name: 'Custom Fine-tuned', value: 6 },
];
const PIE_COLORS = [INDIGO, CYAN, PINK, AMBER, VIOLET];

const performanceRadar = [
  { metric: 'Throughput',   current: 92, previous: 85 },
  { metric: 'Latency',     current: 88, previous: 82 },
  { metric: 'Accuracy',    current: 96, previous: 94 },
  { metric: 'Availability', current: 99, previous: 97 },
  { metric: 'Cost Eff.',   current: 85, previous: 78 },
  { metric: 'Scalability', current: 90, previous: 83 },
];

const tokenCostData = [
  { month: 'Jan', inputTokens: 2.4, outputTokens: 1.8, cost: 3200 },
  { month: 'Feb', inputTokens: 2.8, outputTokens: 2.1, cost: 3800 },
  { month: 'Mar', inputTokens: 3.2, outputTokens: 2.4, cost: 4200 },
  { month: 'Apr', inputTokens: 3.5, outputTokens: 2.8, cost: 4800 },
  { month: 'May', inputTokens: 4.1, outputTokens: 3.2, cost: 5400 },
  { month: 'Jun', inputTokens: 4.6, outputTokens: 3.5, cost: 6100 },
];

/* ── Time range selector ────────────────── */
const timeRanges = ['24h', '7d', '30d', '90d'];

/* ── Component ──────────────────────────── */
export default function AnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [timeRange, setTimeRange]     = useState('24h');
  const router   = useRouter();
  const pathname = usePathname();

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants      = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <div style={{ minHeight: '100vh', background: BG_MAIN, display: 'flex', color: '#f0f1ff' }}>

      {/* ── Sidebar ─────────────────────────── */}
      <motion.aside
        initial={{ x: -280 }} animate={{ x: 0 }} transition={{ type: 'spring', damping: 25 }}
        style={{ width: sidebarOpen ? 256 : 80, background: `linear-gradient(180deg, ${BG_SIDEBAR} 0%, #060817 100%)`, borderRight: '1px solid rgba(99,102,241,0.2)', padding: '24px 16px', position: 'fixed', height: '100vh', left: 0, top: 0, zIndex: 40, display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease', boxShadow: '4px 0 30px rgba(0,0,0,0.4)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          {sidebarOpen && (
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AgentAudit</span>
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
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f0f1ff', margin: 0 }}>Analytics</h2>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {/* Time range pills */}
            <div style={{ display: 'flex', gap: 4, background: 'rgba(14,18,52,0.8)', borderRadius: 8, padding: 3, border: '1px solid rgba(99,102,241,0.15)' }}>
              {timeRanges.map(t => (
                <button key={t} onClick={() => setTimeRange(t)} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: timeRange === t ? INDIGO : 'transparent', color: timeRange === t ? '#fff' : 'rgb(130,135,175)', transition: 'all 0.2s' }}>
                  {t}
                </button>
              ))}
            </div>
            <button style={{ position: 'relative', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: 8, cursor: 'pointer' }}>
              <Bell className="w-5 h-5" style={{ color: INDIGO }} />
              <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px rgba(239,68,68,0.7)' }} />
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
                <motion.div key={i} variants={itemVariants} whileHover={{ y: -6, scale: 1.02 }} style={{ padding: 24, borderRadius: 16, background: CARD_BG, border: `1px solid ${card.accent}33`, boxShadow: '0 4px 24px rgba(0,0,0,0.3)', cursor: 'default' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ padding: 10, borderRadius: 12, background: `${card.accent}18`, border: `1px solid ${card.accent}30` }}>
                      <Icon style={{ width: 20, height: 20, color: card.accent }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      {card.trend === 'up'
                        ? <ArrowUpRight style={{ width: 14, height: 14, color: EMERALD }} />
                        : <ArrowDownRight style={{ width: 14, height: 14, color: EMERALD }} />
                      }
                      <span style={{ fontSize: 12, fontWeight: 700, color: EMERALD }}>{card.subtitle}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: 'rgb(165,170,210)', margin: '0 0 6px' }}>{card.title}</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1 }}>{card.value}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* ── Requests & Errors area chart ── */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }} style={{ padding: 24, borderRadius: 16, background: CARD_BG, border: '1px solid rgba(6,182,212,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f1ff', margin: '0 0 20px' }}>Request Volume & Errors (Today)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="gradRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={INDIGO} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={INDIGO} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradErrors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PINK} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={PINK} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.12)" />
                <XAxis dataKey="time" stroke="#6b7280" tick={{ fill: '#a5a7d2', fontSize: 12 }} />
                <YAxis stroke="#6b7280" tick={{ fill: '#a5a7d2', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: 'rgba(10,13,34,0.95)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 10, color: '#f0f1ff', fontSize: 13 }} />
                <Legend wrapperStyle={{ color: '#a5a7d2', fontSize: 13 }} />
                <Area type="monotone" dataKey="requests" stroke={INDIGO} fill="url(#gradRequests)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="errors" stroke={PINK} fill="url(#gradErrors)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* ── Row: Latency line + Model usage pie ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>

            {/* Latency trend */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }} style={{ padding: 24, borderRadius: 16, background: CARD_BG, border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f1ff', margin: '0 0 20px' }}>Response Latency (ms)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.12)" />
                  <XAxis dataKey="time" stroke="#6b7280" tick={{ fill: '#a5a7d2', fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#a5a7d2', fontSize: 12 }} domain={[150, 350]} />
                  <Tooltip contentStyle={{ background: 'rgba(10,13,34,0.95)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10, color: '#f0f1ff', fontSize: 13 }} />
                  <Line type="monotone" dataKey="latency" stroke={AMBER} strokeWidth={2.5} dot={{ fill: AMBER, r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#fff', stroke: AMBER, strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Model usage donut */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }} style={{ padding: 24, borderRadius: 16, background: CARD_BG, border: '1px solid rgba(236,72,153,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f1ff', margin: '0 0 20px' }}>Model Usage</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={modelUsageData} cx="50%" cy="50%" outerRadius={85} innerRadius={50} dataKey="value" labelLine={false} label={({ name, value }) => `${name} ${value}%`}>
                    {modelUsageData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} style={{ filter: `drop-shadow(0 0 6px ${PIE_COLORS[index]}60)` }} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'rgba(10,13,34,0.95)', border: '1px solid rgba(236,72,153,0.3)', borderRadius: 10, color: '#f0f1ff', fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* ── Row: Weekly bar + Radar ─── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

            {/* Weekly calls bar */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }} style={{ padding: 24, borderRadius: 16, background: CARD_BG, border: '1px solid rgba(52,211,153,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f1ff', margin: '0 0 20px' }}>Weekly Call Volume</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.12)" />
                  <XAxis dataKey="day" stroke="#6b7280" tick={{ fill: '#a5a7d2', fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#a5a7d2', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: 'rgba(10,13,34,0.95)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 10, color: '#f0f1ff', fontSize: 13 }} />
                  <Bar dataKey="calls" fill={EMERALD} radius={[6, 6, 0, 0]} style={{ filter: 'drop-shadow(0 0 6px rgba(52,211,153,0.4))' }} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Performance radar */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.6 }} style={{ padding: 24, borderRadius: 16, background: CARD_BG, border: '1px solid rgba(139,92,246,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f1ff', margin: '0 0 20px' }}>Performance: Current vs Previous</h3>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={performanceRadar} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="rgba(99,102,241,0.15)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: '#a5a7d2', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <Radar name="Current" dataKey="current" stroke={CYAN} fill={CYAN} fillOpacity={0.25} strokeWidth={2} />
                  <Radar name="Previous" dataKey="previous" stroke={VIOLET} fill={VIOLET} fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 4" />
                  <Legend wrapperStyle={{ color: '#a5a7d2', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: 'rgba(10,13,34,0.95)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 10, color: '#f0f1ff', fontSize: 13 }} />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* ── Token usage & cost ────────── */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.7 }} style={{ padding: 24, borderRadius: 16, background: CARD_BG, border: '1px solid rgba(245,158,11,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f1ff', margin: '0 0 20px' }}>Token Usage & Cost Trend</h3>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={tokenCostData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.12)" />
                <XAxis dataKey="month" stroke="#6b7280" tick={{ fill: '#a5a7d2', fontSize: 12 }} />
                <YAxis yAxisId="tokens" stroke="#6b7280" tick={{ fill: '#a5a7d2', fontSize: 12 }} label={{ value: 'Tokens (M)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: 11 } }} />
                <YAxis yAxisId="cost" orientation="right" stroke="#6b7280" tick={{ fill: '#a5a7d2', fontSize: 12 }} label={{ value: 'Cost ($)', angle: 90, position: 'insideRight', style: { fill: '#6b7280', fontSize: 11 } }} />
                <Tooltip contentStyle={{ background: 'rgba(10,13,34,0.95)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, color: '#f0f1ff', fontSize: 13 }} />
                <Legend wrapperStyle={{ color: '#a5a7d2', fontSize: 13 }} />
                <Bar yAxisId="tokens" dataKey="inputTokens" name="Input Tokens (M)" fill={INDIGO} radius={[4, 4, 0, 0]} barSize={20} />
                <Bar yAxisId="tokens" dataKey="outputTokens" name="Output Tokens (M)" fill={CYAN} radius={[4, 4, 0, 0]} barSize={20} />
                <Line yAxisId="cost" type="monotone" dataKey="cost" name="Cost ($)" stroke={AMBER} strokeWidth={2.5} dot={{ fill: AMBER, r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </motion.div>

          {/* ── Category breakdown table ── */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.8 }} style={{ borderRadius: 16, background: CARD_BG, border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(99,102,241,0.12)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f1ff', margin: 0 }}>Category Breakdown</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                    {['Category', 'Total Requests', 'Avg Response (ms)', 'Satisfaction'].map((h, i) => (
                      <th key={i} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'rgb(130,135,175)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categoryData.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(99,102,241,0.06)', transition: 'background 0.2s' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: '#f0f1ff' }}>{row.category}</td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: 'rgb(165,170,210)' }}>{row.requests.toLocaleString()}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: row.avgTime < 250 ? EMERALD : row.avgTime < 400 ? AMBER : PINK }}>{row.avgTime}ms</span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(99,102,241,0.15)', maxWidth: 100 }}>
                            <div style={{ width: `${row.satisfaction}%`, height: '100%', borderRadius: 3, background: row.satisfaction >= 95 ? EMERALD : row.satisfaction >= 90 ? CYAN : AMBER }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#f0f1ff' }}>{row.satisfaction}%</span>
                        </div>
                      </td>
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
