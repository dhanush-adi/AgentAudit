'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Activity, Bell, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
  { name: 'Active', value: 25 },
  { name: 'Idle', value: 10 },
];

const COLORS = ['#d4af37', '#2962ff', '#7c4dff'];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  const statCards = [
    {
      title: 'Active Agents',
      value: '12',
      subtitle: '+2 this week',
      icon: Users,
      bgColor: '#d4af37',
      accentColor: 'rgb(212 175 55)',
    },
    {
      title: 'Total Calls',
      value: '12,450',
      subtitle: '+15% increase',
      icon: Activity,
      bgColor: '#2962ff',
      accentColor: 'rgb(41 98 255)',
    },
    {
      title: 'Avg Efficiency',
      value: '94.2%',
      subtitle: '+3.5% improvement',
      icon: TrendingUp,
      bgColor: '#7c4dff',
      accentColor: 'rgb(124 77 255)',
    },
    {
      title: 'System Health',
      value: '99.9%',
      subtitle: 'Uptime maintained',
      icon: BarChart3,
      bgColor: '#00bfa5',
      accentColor: 'rgb(0 191 165)',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-slate-900 to-slate-950 border-r border-primary/30 p-6 fixed h-screen left-0 top-0 transition-all duration-300 z-40 flex flex-col shadow-[0_0_30px_rgba(212,175,55,0.15)]`}
      >
        <div className="flex items-center justify-between mb-8">
          {sidebarOpen && <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent drop-shadow-lg">AgentAudit</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-primary/10 rounded-lg text-primary/70 hover:text-primary transition-all">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="space-y-4 flex-1">
          {['Dashboard', 'Agents', 'Analytics', 'Reports', 'Settings'].map((item, i) => (
            <motion.div key={i} whileHover={{ x: 5 }} className={`p-3 rounded-lg cursor-pointer transition-all ${i === 0 ? 'bg-gradient-to-r from-primary to-secondary text-background shadow-[0_0_20px_rgba(212,175,55,0.3)]' : 'hover:bg-primary/10 text-muted-foreground hover:text-primary'}`}>
              {sidebarOpen ? item : item[0]}
            </motion.div>
          ))}
        </nav>

        <motion.div whileHover={{ x: 5 }} className="p-3 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive cursor-pointer flex items-center gap-3 transition-all">
          <LogOut className="w-5 h-5" />
          {sidebarOpen && 'Logout'}
        </motion.div>
      </motion.aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950`}>
        {/* Top Navigation */}
        <nav className="bg-slate-900/50 border-b border-primary/20 backdrop-blur-md p-6 sticky top-0 z-30 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-foreground drop-shadow-lg">Dashboard</h2>
            <div className="flex gap-4 items-center">
              <button className="p-2 hover:bg-primary/10 rounded-lg relative transition-all">
                <Bell className="w-5 h-5 text-primary drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full shadow-[0_0_10px_rgba(220,53,69,0.6)]"></span>
              </button>
              <button className="p-2 hover:bg-secondary/10 rounded-lg transition-all">
                <Settings className="w-5 h-5 text-secondary drop-shadow-[0_0_10px_rgba(41,98,255,0.4)]" />
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary via-secondary to-accent shadow-[0_0_20px_rgba(212,175,55,0.5)]"></div>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="p-8 overflow-auto">
          {/* Stats Grid */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div key={i} variants={itemVariants} whileHover={{ y: -8, scale: 1.02 }} className="p-6 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 hover:border-primary/60 transition-all group shadow-[0_0_30px_rgba(212,175,55,0.1)] hover:shadow-[0_0_40px_rgba(212,175,55,0.25)]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-slate-700/50 to-slate-800/50" style={{ boxShadow: `0_0_20px_${card.accentColor}40` }}>
                      <Icon className="w-6 h-6" style={{ color: card.bgColor, filter: `drop-shadow(0 0 10px ${card.bgColor}80)` }} />
                    </div>
                    <span className="text-sm font-semibold text-primary bg-primary/20 px-3 py-1 rounded-full drop-shadow-lg">↑ {card.subtitle.split('+')[1]}</span>
                  </div>
                  <h3 className="text-muted-foreground text-sm font-medium mb-2">{card.title}</h3>
                  <p className="text-3xl font-bold text-foreground mb-1 drop-shadow-lg" style={{ textShadow: `0 0 10px ${card.bgColor}80` }}>{card.value}</p>
                  <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Line Chart */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }} className="lg:col-span-2 p-6 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-secondary/30 hover:border-secondary/60 transition-all shadow-[0_0_30px_rgba(41,98,255,0.1)] hover:shadow-[0_0_40px_rgba(41,98,255,0.2)]">
              <h3 className="text-lg font-bold text-foreground mb-6 drop-shadow-lg">Agent Activity Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(41,98,255,0.2)" />
                  <XAxis dataKey="name" stroke="#8b95b8" />
                  <YAxis stroke="#8b95b8" />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15,15,35,0.9)', border: '1px solid rgba(41,98,255,0.3)', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="efficiency" stroke="#2962ff" strokeWidth={3} dot={{ fill: '#2962ff', r: 6 }} filter="drop-shadow(0 0 5px #2962ff80)" />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Pie Chart */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }} className="p-6 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-accent/30 hover:border-accent/60 transition-all shadow-[0_0_30px_rgba(124,77,255,0.1)] hover:shadow-[0_0_40px_rgba(124,77,255,0.2)]">
              <h3 className="text-lg font-bold text-foreground mb-6 drop-shadow-lg">Agent Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name} ${value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} style={{ filter: `drop-shadow(0 0 10px ${COLORS[index]}80)` }} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Bar Chart */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.6 }} className="p-6 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 hover:border-primary/60 transition-all shadow-[0_0_30px_rgba(212,175,55,0.1)] hover:shadow-[0_0_40px_rgba(212,175,55,0.2)]">
            <h3 className="text-lg font-bold text-foreground mb-6 drop-shadow-lg">API Calls by Month</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.2)" />
                <XAxis dataKey="name" stroke="#8b95b8" />
                <YAxis stroke="#8b95b8" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15,15,35,0.9)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="calls" fill="#d4af37" radius={[8, 8, 0, 0]} style={{ filter: 'drop-shadow(0 0 8px #d4af3780)' }} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
