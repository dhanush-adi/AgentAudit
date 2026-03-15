'use client';

import { motion } from 'framer-motion';
import {
  Bell, Settings, Menu, X, LayoutDashboard, Bot, LineChart as LineIcon,
  FileText, LogOut, Download, Eye, Clock, CheckCircle, AlertTriangle,
  Calendar, Filter, ChevronDown, ExternalLink, BarChart3,
} from 'lucide-react';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
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
const RED        = '#ef4444';

const navItems = [
  { label: 'Dashboard', path: '/dashboard',  icon: LayoutDashboard },
  { label: 'Agents',    path: '/agents',     icon: Bot },
  { label: 'Analytics', path: '/analytics',  icon: LineIcon },
  { label: 'Reports',   path: '/reports',    icon: FileText },
  { label: 'Settings',  path: '/settings',   icon: Settings },
];

/* ── Stat cards ─────────────────────────── */
const statCards = [
  { title: 'Total Reports',   value: '156',   subtitle: '+12 this month', icon: FileText,      accent: INDIGO },
  { title: 'Scheduled',       value: '8',     subtitle: '3 daily, 5 weekly', icon: Calendar,    accent: CYAN },
  { title: 'Compliance Score', value: '97.3%', subtitle: '+1.2% vs last', icon: CheckCircle,   accent: EMERALD },
  { title: 'Flagged Issues',  value: '5',     subtitle: '2 critical',     icon: AlertTriangle, accent: RED },
];

/* ── Reports data ───────────────────────── */
const reports = [
  { id: 'RPT-2024-156', title: 'Monthly Agent Performance Summary',       type: 'Performance', status: 'completed', date: 'Mar 14, 2026', size: '2.4 MB', author: 'System Auto' },
  { id: 'RPT-2024-155', title: 'Security Compliance Audit - Q1 2026',     type: 'Compliance',  status: 'completed', date: 'Mar 13, 2026', size: '5.1 MB', author: 'Admin' },
  { id: 'RPT-2024-154', title: 'Cost Analysis & Token Usage Report',      type: 'Financial',   status: 'completed', date: 'Mar 12, 2026', size: '1.8 MB', author: 'System Auto' },
  { id: 'RPT-2024-153', title: 'Incident Response Analysis - March',      type: 'Incident',    status: 'in_review', date: 'Mar 11, 2026', size: '3.2 MB', author: 'Security Team' },
  { id: 'RPT-2024-152', title: 'Agent Uptime & Availability Report',      type: 'Performance', status: 'completed', date: 'Mar 10, 2026', size: '1.5 MB', author: 'System Auto' },
  { id: 'RPT-2024-151', title: 'Data Processing Throughput Analysis',     type: 'Performance', status: 'completed', date: 'Mar 09, 2026', size: '2.1 MB', author: 'Analytics Team' },
  { id: 'RPT-2024-150', title: 'User Satisfaction Survey Results',        type: 'Satisfaction', status: 'draft',     date: 'Mar 08, 2026', size: '890 KB', author: 'Product Team' },
  { id: 'RPT-2024-149', title: 'Weekly Error & Exception Summary',        type: 'Incident',    status: 'completed', date: 'Mar 07, 2026', size: '1.2 MB', author: 'System Auto' },
];

const statusStyles: Record<string, { color: string; bg: string; label: string }> = {
  completed: { color: EMERALD, bg: `${EMERALD}15`, label: 'Completed' },
  in_review: { color: AMBER,   bg: `${AMBER}15`,   label: 'In Review' },
  draft:     { color: VIOLET,  bg: `${VIOLET}15`,  label: 'Draft' },
};

const typeColors: Record<string, string> = {
  Performance: CYAN, Compliance: EMERALD, Financial: AMBER, Incident: PINK, Satisfaction: VIOLET,
};

/* ── Chart data ─────────────────────────── */
const monthlyReports = [
  { month: 'Oct', generated: 18, scheduled: 12, manual: 6 },
  { month: 'Nov', generated: 22, scheduled: 14, manual: 8 },
  { month: 'Dec', generated: 20, scheduled: 13, manual: 7 },
  { month: 'Jan', generated: 25, scheduled: 16, manual: 9 },
  { month: 'Feb', generated: 28, scheduled: 18, manual: 10 },
  { month: 'Mar', generated: 32, scheduled: 20, manual: 12 },
];

const reportTypeData = [
  { name: 'Performance', value: 42 },
  { name: 'Compliance',  value: 25 },
  { name: 'Financial',   value: 15 },
  { name: 'Incident',    value: 12 },
  { name: 'Satisfaction', value: 6 },
];
const PIE_COLORS = [CYAN, EMERALD, AMBER, PINK, VIOLET];

const complianceTrend = [
  { month: 'Oct', score: 92.1, threshold: 95 },
  { month: 'Nov', score: 93.8, threshold: 95 },
  { month: 'Dec', score: 94.5, threshold: 95 },
  { month: 'Jan', score: 95.2, threshold: 95 },
  { month: 'Feb', score: 96.1, threshold: 95 },
  { month: 'Mar', score: 97.3, threshold: 95 },
];

const issuesBySeverity = [
  { month: 'Oct', critical: 5, warning: 12, info: 28 },
  { month: 'Nov', critical: 3, warning: 10, info: 25 },
  { month: 'Dec', critical: 4, warning: 8,  info: 22 },
  { month: 'Jan', critical: 2, warning: 7,  info: 20 },
  { month: 'Feb', critical: 3, warning: 6,  info: 18 },
  { month: 'Mar', critical: 2, warning: 5,  info: 15 },
];

/* ── Component ──────────────────────────── */
export default function ReportsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filterType, setFilterType]   = useState('All');
  const router   = useRouter();
  const pathname = usePathname();

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants      = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  const filteredReports = filterType === 'All' ? reports : reports.filter(r => r.type === filterType);

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
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f0f1ff', margin: 0 }}>Reports</h2>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg, ${INDIGO}, ${CYAN})`, color: '#fff', fontSize: 13, fontWeight: 600 }}>
              <FileText style={{ width: 14, height: 14 }} /> Generate Report
            </button>
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
                    <span style={{ fontSize: 11, fontWeight: 700, color: card.accent, background: `${card.accent}18`, border: `1px solid ${card.accent}30`, padding: '3px 10px', borderRadius: 20 }}>{card.subtitle}</span>
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: 'rgb(165,170,210)', margin: '0 0 6px' }}>{card.title}</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1 }}>{card.value}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* ── Filter bar ──────────────── */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible" style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <Filter style={{ width: 16, height: 16, color: 'rgb(130,135,175)' }} />
            {['All', 'Performance', 'Compliance', 'Financial', 'Incident', 'Satisfaction'].map(t => (
              <button key={t} onClick={() => setFilterType(t)} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${filterType === t ? INDIGO : 'rgba(99,102,241,0.15)'}`, background: filterType === t ? `${INDIGO}20` : 'transparent', color: filterType === t ? INDIGO : 'rgb(130,135,175)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                {t}
              </button>
            ))}
          </motion.div>

          {/* ── Reports Table ───────────── */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }} style={{ borderRadius: 16, background: CARD_BG, border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(99,102,241,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f1ff', margin: 0 }}>Recent Reports</h3>
              <span style={{ fontSize: 12, color: 'rgb(130,135,175)' }}>{filteredReports.length} reports</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                    {['Report', 'Type', 'Status', 'Date', 'Size', 'Author', 'Actions'].map((h, i) => (
                      <th key={i} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'rgb(130,135,175)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report, i) => {
                    const st = statusStyles[report.status];
                    return (
                      <motion.tr key={report.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} style={{ borderBottom: '1px solid rgba(99,102,241,0.06)', transition: 'background 0.2s' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '14px 16px' }}>
                          <div>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#f0f1ff' }}>{report.title}</p>
                            <p style={{ margin: 0, fontSize: 11, color: 'rgb(130,135,175)' }}>{report.id}</p>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: 12, fontWeight: 500, color: typeColors[report.type] || CYAN, background: `${typeColors[report.type] || CYAN}15`, border: `1px solid ${typeColors[report.type] || CYAN}25`, padding: '3px 10px', borderRadius: 6 }}>{report.type}</span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: st.color, background: st.bg, border: `1px solid ${st.color}25`, padding: '3px 10px', borderRadius: 6 }}>{st.label}</span>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 12, color: 'rgb(165,170,210)' }}>{report.date}</td>
                        <td style={{ padding: '14px 16px', fontSize: 12, color: 'rgb(130,135,175)' }}>{report.size}</td>
                        <td style={{ padding: '14px 16px', fontSize: 12, color: 'rgb(165,170,210)' }}>{report.author}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, padding: 6, cursor: 'pointer' }} title="View">
                              <Eye style={{ width: 14, height: 14, color: INDIGO }} />
                            </button>
                            <button style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 6, padding: 6, cursor: 'pointer' }} title="Download">
                              <Download style={{ width: 14, height: 14, color: CYAN }} />
                            </button>
                            <button style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)', borderRadius: 6, padding: 6, cursor: 'pointer' }} title="Share">
                              <ExternalLink style={{ width: 14, height: 14, color: PINK }} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* ── Charts row: Monthly trend + Type distribution ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>

            {/* Monthly report generation */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }} style={{ padding: 24, borderRadius: 16, background: CARD_BG, border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f1ff', margin: '0 0 20px' }}>Monthly Report Generation</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyReports}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.12)" />
                  <XAxis dataKey="month" stroke="#6b7280" tick={{ fill: '#a5a7d2', fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#a5a7d2', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: 'rgba(10,13,34,0.95)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10, color: '#f0f1ff', fontSize: 13 }} />
                  <Legend wrapperStyle={{ color: '#a5a7d2', fontSize: 12 }} />
                  <Bar dataKey="scheduled" name="Scheduled" fill={INDIGO} radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="manual" name="Manual" fill={CYAN} radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Report type distribution */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }} style={{ padding: 24, borderRadius: 16, background: CARD_BG, border: '1px solid rgba(236,72,153,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f1ff', margin: '0 0 20px' }}>Report Type Distribution</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={reportTypeData} cx="50%" cy="50%" outerRadius={85} innerRadius={50} dataKey="value" labelLine={false} label={({ name, value }) => `${name} ${value}%`}>
                    {reportTypeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} style={{ filter: `drop-shadow(0 0 6px ${PIE_COLORS[index]}60)` }} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'rgba(10,13,34,0.95)', border: '1px solid rgba(236,72,153,0.3)', borderRadius: 10, color: '#f0f1ff', fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* ── Charts row: Compliance + Issues ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Compliance trend */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }} style={{ padding: 24, borderRadius: 16, background: CARD_BG, border: '1px solid rgba(52,211,153,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f1ff', margin: '0 0 20px' }}>Compliance Score Trend</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={complianceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.12)" />
                  <XAxis dataKey="month" stroke="#6b7280" tick={{ fill: '#a5a7d2', fontSize: 12 }} />
                  <YAxis domain={[88, 100]} stroke="#6b7280" tick={{ fill: '#a5a7d2', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: 'rgba(10,13,34,0.95)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 10, color: '#f0f1ff', fontSize: 13 }} />
                  <Legend wrapperStyle={{ color: '#a5a7d2', fontSize: 12 }} />
                  <Line type="monotone" dataKey="score" name="Score" stroke={EMERALD} strokeWidth={2.5} dot={{ fill: EMERALD, r: 4 }} activeDot={{ r: 6, fill: '#fff', stroke: EMERALD, strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="threshold" name="Threshold" stroke={AMBER} strokeWidth={1.5} strokeDasharray="6 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Issues by severity */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.6 }} style={{ padding: 24, borderRadius: 16, background: CARD_BG, border: '1px solid rgba(239,68,68,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f1ff', margin: '0 0 20px' }}>Flagged Issues by Severity</h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={issuesBySeverity}>
                  <defs>
                    <linearGradient id="gradCritical" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={RED} stopOpacity={0.3} /><stop offset="95%" stopColor={RED} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradWarning" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={AMBER} stopOpacity={0.3} /><stop offset="95%" stopColor={AMBER} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradInfo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CYAN} stopOpacity={0.3} /><stop offset="95%" stopColor={CYAN} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.12)" />
                  <XAxis dataKey="month" stroke="#6b7280" tick={{ fill: '#a5a7d2', fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#a5a7d2', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: 'rgba(10,13,34,0.95)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: '#f0f1ff', fontSize: 13 }} />
                  <Legend wrapperStyle={{ color: '#a5a7d2', fontSize: 12 }} />
                  <Area type="monotone" dataKey="critical" name="Critical" stroke={RED} fill="url(#gradCritical)" strokeWidth={2} />
                  <Area type="monotone" dataKey="warning" name="Warning" stroke={AMBER} fill="url(#gradWarning)" strokeWidth={2} />
                  <Area type="monotone" dataKey="info" name="Info" stroke={CYAN} fill="url(#gradInfo)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

        </div>
      </main>
    </div>
  );
}
