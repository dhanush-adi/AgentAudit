'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Activity, Bell, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const chartData = [
  { name: 'Jan', agents: 4, calls: 2400, efficiency: 85 },
  { name: 'Feb', agents: 5, calls: 3210, efficiency: 88 },
  { name: 'Mar', agents: 6, calls: 2290, efficiency: 90 },
  { name: 'Apr', agents: 8, calls: 2000, efficiency: 92 },
  { name: 'May', agents: 10, calls: 2181, efficiency: 94 },
  { name: 'Jun', agents: 12, calls: 2500, efficiency: 96 },
];

const pieData = [
  { name: 'Productive', value: 65 },
  { name: 'Active',     value: 25 },
  { name: 'Idle',       value: 10 },
];

// Deep Navy & Electric Indigo palette
const CHART_COLORS = ['#6366f1', '#06b6d4', '#ec4899'];

const BG_MAIN    = '#08091a';        // very deep navy
const BG_SIDEBAR = '#0a0d22';        // slightly lighter navy
const BG_CARD    = 'rgba(14,18,52,0.85)';
const BG_NAV     = 'rgba(10,13,34,0.85)';

const INDIGO     = '#6366f1';
const CYAN       = '#06b6d4';
const PINK       = '#ec4899';
const EMERALD    = '#34d399';

const statCards = [
  { title: 'Active Agents',  value: '12',     subtitle: '+2 this week',       icon: Users,    accent: INDIGO  },
  { title: 'Total Calls',    value: '12,450', subtitle: '+15% increase',      icon: Activity, accent: CYAN    },
  { title: 'Avg Efficiency', value: '94.2%',  subtitle: '+3.5% improvement',  icon: TrendingUp, accent: PINK  },
  { title: 'System Health',  value: '99.9%',  subtitle: 'Uptime maintained',  icon: BarChart3,accent: EMERALD },
];

const navItems = ['Dashboard', 'Agents', 'Analytics', 'Reports', 'Settings'];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const containerVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

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
        {/* Logo row */}
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
            {sidebarOpen ? <X className="w-4 h-4" style={{ color: '#a5a7e2' }} />
                        : <Menu className="w-4 h-4" style={{ color: '#a5a7e2' }} />}
          </button>
        </div>

        {/* Nav items */}
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

        {/* Logout */}
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

      {/* ── Main content ────────────────────────── */}
      <main style={{
        flex: 1,
        marginLeft: sidebarOpen ? 256 : 80,
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Top nav */}
        <nav style={{
          background: BG_NAV,
          borderBottom: '1px solid rgba(99,102,241,0.15)',
          backdropFilter: 'blur(16px)',
          padding: '16px 32px',
          position: 'sticky', top: 0, zIndex: 30,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f0f1ff', margin: 0 }}>Dashboard</h2>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button style={{
              position: 'relative', background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: 8, cursor: 'pointer',
            }}>
              <Bell className="w-5 h-5" style={{ color: INDIGO }} />
              <span style={{
                position: 'absolute', top: 6, right: 6, width: 8, height: 8,
                borderRadius: '50%', background: '#ef4444',
                boxShadow: '0 0 8px rgba(239,68,68,0.7)',
              }} />
            </button>
            <button style={{
              background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)',
              borderRadius: 8, padding: 8, cursor: 'pointer',
            }}>
              <Settings className="w-5 h-5" style={{ color: CYAN }} />
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
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 28 }}
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
                    boxShadow: `0 4px 24px rgba(0,0,0,0.3), 0 0 0 0 ${card.accent}22`,
                    cursor: 'default',
                    transition: 'box-shadow 0.3s',
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
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: card.accent,
                      background: `${card.accent}18`, border: `1px solid ${card.accent}30`,
                      padding: '3px 10px', borderRadius: 20, letterSpacing: '0.03em',
                    }}>
                      ↑ {card.subtitle.split('+')[1] ?? card.subtitle}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: 'rgb(165,170,210)', margin: '0 0 6px' }}>{card.title}</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 4px', lineHeight: 1 }}>{card.value}</p>
                  <p style={{ fontSize: 11, color: 'rgb(130,135,175)', margin: 0 }}>{card.subtitle}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>

            {/* Line chart */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
              style={{
                padding: 24, borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(14,18,52,0.95), rgba(20,25,65,0.95))',
                border: '1px solid rgba(6,182,212,0.2)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
              }}
            >
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f1ff', margin: '0 0 20px' }}>Agent Activity Trend</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.12)" />
                  <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#a5a7d2', fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#a5a7d2', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(10,13,34,0.95)', border: '1px solid rgba(6,182,212,0.3)',
                      borderRadius: 10, color: '#f0f1ff', fontSize: 13,
                    }}
                  />
                  <Legend wrapperStyle={{ color: '#a5a7d2', fontSize: 13 }} />
                  <Line
                    type="monotone" dataKey="efficiency"
                    stroke={CYAN} strokeWidth={2.5}
                    dot={{ fill: CYAN, r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#fff', stroke: CYAN, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Pie chart */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.5 }}
              style={{
                padding: 24, borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(14,18,52,0.95), rgba(20,25,65,0.95))',
                border: '1px solid rgba(236,72,153,0.2)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
              }}
            >
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f1ff', margin: '0 0 20px' }}>Agent Status</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData} cx="50%" cy="50%"
                    outerRadius={85} dataKey="value"
                    labelLine={false}
                    label={({ name, value }) => `${name} ${value}%`}
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index]}
                        style={{ filter: `drop-shadow(0 0 8px ${CHART_COLORS[index]}80)` }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(10,13,34,0.95)', border: '1px solid rgba(236,72,153,0.3)',
                      borderRadius: 10, color: '#f0f1ff', fontSize: 13,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Bar chart */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.6 }}
            style={{
              padding: 24, borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(14,18,52,0.95), rgba(20,25,65,0.95))',
              border: '1px solid rgba(99,102,241,0.2)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f1ff', margin: '0 0 20px' }}>API Calls by Month</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.12)" />
                <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#a5a7d2', fontSize: 12 }} />
                <YAxis stroke="#6b7280" tick={{ fill: '#a5a7d2', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(10,13,34,0.95)', border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: 10, color: '#f0f1ff', fontSize: 13,
                  }}
                />
                <Legend wrapperStyle={{ color: '#a5a7d2', fontSize: 13 }} />
                <Bar dataKey="calls" fill={INDIGO} radius={[6, 6, 0, 0]}
                  style={{ filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.5))' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
