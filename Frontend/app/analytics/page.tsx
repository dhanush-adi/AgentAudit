'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, DollarSign, Zap } from 'lucide-react';
import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const BG_MAIN = '#08091a';
const INDIGO = '#6366f1';
const CYAN = '#06b6d4';
const EMERALD = '#34d399';
const PINK = '#ec4899';

const weeklyData = [
  { day: 'Mon', calls: 420, revenue: 0.42, latency: 35 },
  { day: 'Tue', calls: 580, revenue: 0.58, latency: 32 },
  { day: 'Wed', calls: 710, revenue: 0.71, latency: 28 },
  { day: 'Thu', calls: 650, revenue: 0.65, latency: 30 },
  { day: 'Fri', calls: 890, revenue: 0.89, latency: 25 },
  { day: 'Sat', calls: 320, revenue: 0.32, latency: 38 },
  { day: 'Sun', calls: 280, revenue: 0.28, latency: 40 },
];

const statCards = [
  { title: 'Calls This Week', value: '3,850', subtitle: '+12% vs last week', icon: Activity, accent: CYAN },
  { title: 'Revenue (USDC)', value: '$3.85', subtitle: '+$0.42 today', icon: DollarSign, accent: EMERALD },
  { title: 'Avg Latency', value: '32ms', subtitle: '-5ms improvement', icon: Zap, accent: INDIGO },
  { title: 'Success Rate', value: '98.2%', subtitle: 'Above threshold', icon: TrendingUp, accent: PINK },
];

export default function AnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <div style={{ minHeight: '100vh', background: BG_MAIN, display: 'flex', color: '#f0f1ff' }}>
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main style={{ flex: 1, marginLeft: sidebarOpen ? 256 : 80, transition: 'margin-left 0.3s ease', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopNav title="Analytics" subtitle="GOAT Chain 48816 \u2022 Performance metrics" />

        <div style={{ padding: 32, flex: 1 }}>
          <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 28 }}>
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div key={i} variants={itemVariants} whileHover={{ y: -6, scale: 1.02 }} style={{ padding: 24, borderRadius: 16, background: 'linear-gradient(135deg, rgba(14,18,52,0.95), rgba(20,25,65,0.95))', border: `1px solid ${card.accent}33`, boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ padding: 10, borderRadius: 12, background: `${card.accent}18`, border: `1px solid ${card.accent}30` }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <motion.div variants={itemVariants} initial="hidden" animate="visible" style={{ padding: 24, borderRadius: 16, background: 'linear-gradient(135deg, rgba(14,18,52,0.95), rgba(20,25,65,0.95))', border: `1px solid ${INDIGO}20`, boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f1ff', margin: '0 0 20px' }}>API Calls (Weekly)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                  <XAxis dataKey="day" stroke="#6b7280" tick={{ fill: '#a5a7d2', fontSize: 11 }} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#a5a7d2', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'rgba(10,13,34,0.95)', border: `1px solid ${INDIGO}20`, borderRadius: 10 }} />
                  <Bar dataKey="calls" fill={INDIGO} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div variants={itemVariants} initial="hidden" animate="visible" style={{ padding: 24, borderRadius: 16, background: 'linear-gradient(135deg, rgba(14,18,52,0.95), rgba(20,25,65,0.95))', border: `1px solid ${CYAN}20`, boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f1ff', margin: '0 0 20px' }}>Revenue Trend (USDC)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.1)" />
                  <XAxis dataKey="day" stroke="#6b7280" tick={{ fill: '#a5a7d2', fontSize: 11 }} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#a5a7d2', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'rgba(10,13,34,0.95)', border: `1px solid ${CYAN}20`, borderRadius: 10 }} />
                  <Area type="monotone" dataKey="revenue" stroke={CYAN} fill={CYAN} fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
