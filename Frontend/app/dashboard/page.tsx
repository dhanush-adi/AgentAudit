'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Activity, Bell, Settings, LogOut, Menu, X, RadioTower, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const statCards = [
    {
      title: 'Total API Calls',
      value: totalCalls.toLocaleString(),
      subtitle: agentOnline ? '🟢 Agent Online' : '🔴 Agent Offline',
      icon: Activity,
      bgColor: '#2962ff',
    },
    {
      title: 'Total Earned (USDC)',
      value: `$${totalEarned}`,
      subtitle: '+$0.001 per verified call',
      icon: TrendingUp,
      bgColor: '#d4af37',
    },
    {
      title: 'Agent Identity',
      value: agent ? `#${agent.agentId}` : 'Loading…',
      subtitle: agent ? `${agent.wallet.slice(0, 10)}…${agent.wallet.slice(-6)}` : 'GOAT Testnet3',
      icon: Users,
      bgColor: '#7c4dff',
    },
    {
      title: 'Reputation Score',
      value: agent ? (agent.reputation.avgScore > 0 ? `${agent.reputation.avgScore.toFixed(1)}★` : 'N/A') : '—',
      subtitle: agent ? `${agent.reputation.feedbackCount} reviews` : 'Checking…',
      icon: BarChart3,
      bgColor: '#00bfa5',
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
            <motion.div key={i} whileHover={{ x: 5 }}
              className={`p-3 rounded-lg cursor-pointer transition-all ${i === 0 ? 'bg-gradient-to-r from-primary to-secondary text-background shadow-[0_0_20px_rgba(212,175,55,0.3)]' : 'hover:bg-primary/10 text-muted-foreground hover:text-primary'}`}>
              {sidebarOpen ? item : item[0]}
            </motion.div>
          ))}
        </nav>
        {/* GOAT Network badge */}
        {sidebarOpen && (
          <a href="https://explorer.testnet3.goat.network" target="_blank" rel="noreferrer"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-all p-2 rounded-lg hover:bg-primary/10">
            <RadioTower className="w-4 h-4 text-green-400" />
            <span>GOAT Testnet3</span>
            <ExternalLink className="w-3 h-3 ml-auto" />
          </a>
        )}
        <motion.div whileHover={{ x: 5 }} className="p-3 mt-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive cursor-pointer flex items-center gap-3 transition-all">
          <LogOut className="w-5 h-5" />
          {sidebarOpen && 'Logout'}
        </motion.div>
      </motion.aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Top Navigation */}
        <nav className="bg-slate-900/50 border-b border-primary/20 backdrop-blur-md p-6 sticky top-0 z-30">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Contracts on GOAT Testnet3 (Chain 48816) • Agent Registry: 0x3de0…140F
              </p>
            </div>
            <div className="flex gap-4 items-center">
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${agentOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {agentOnline ? '● Live' : '● Offline'}
              </span>
              <button className="p-2 hover:bg-primary/10 rounded-lg relative transition-all">
                <Bell className="w-5 h-5 text-primary" />
                {logs.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />}
              </button>
              <button className="p-2 hover:bg-secondary/10 rounded-lg transition-all">
                <Settings className="w-5 h-5 text-secondary" />
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary via-secondary to-accent shadow-[0_0_20px_rgba(212,175,55,0.5)]" />
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="p-8 overflow-auto">
          {/* Stats */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div key={i} variants={itemVariants} whileHover={{ y: -8, scale: 1.02 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 hover:border-primary/60 transition-all shadow-[0_0_30px_rgba(212,175,55,0.1)] hover:shadow-[0_0_40px_rgba(212,175,55,0.25)]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-lg bg-slate-700/50">
                      <Icon className="w-6 h-6" style={{ color: card.bgColor }} />
                    </div>
                  </div>
                  <h3 className="text-muted-foreground text-sm font-medium mb-2">{card.title}</h3>
                  <p className="text-3xl font-bold text-foreground mb-1">{card.value}</p>
                  <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* API Calls Bar Chart (live) */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible"
              className="p-6 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-secondary/30 hover:border-secondary/60 transition-all">
              <h3 className="text-lg font-bold text-foreground mb-6">API Calls by Endpoint (Live)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(41,98,255,0.2)" />
                  <XAxis dataKey="name" stroke="#8b95b8" />
                  <YAxis stroke="#8b95b8" />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15,15,35,0.9)', border: '1px solid rgba(41,98,255,0.3)', borderRadius: '8px' }} />
                  <Bar dataKey="calls" fill="#2962ff" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Live Call Feed */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible"
              className="p-6 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 hover:border-primary/60 transition-all">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Live Call Feed
              </h3>
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No calls yet. Try calling the demo agent at :3001</p>
                ) : (
                  logs.slice(0, 20).map((log, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-slate-700/30 rounded-lg px-3 py-2">
                      <span className={log.status === 'verified' ? 'text-green-400 font-mono' : 'text-red-400 font-mono'}>
                        {log.status === 'verified' ? '✅' : '❌'} {log.endpoint}
                      </span>
                      <span className="text-muted-foreground">${log.amount_usdc}</span>
                      <span className="text-muted-foreground">{log.latency_ms}ms</span>
                      <span className="text-muted-foreground font-mono">
                        {log.caller_address !== 'unknown' ? `${log.caller_address.slice(0, 8)}…` : 'anon'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* On-chain Identity */}
          {agent && (
            <motion.div variants={itemVariants} initial="hidden" animate="visible"
              className="p-6 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-accent/30 mb-8">
              <h3 className="text-lg font-bold text-foreground mb-4">On-Chain Identity (ERC-8004)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="text-muted-foreground mb-1">Agent Token ID</p>
                  <p className="font-mono text-foreground">#{agent.agentId}</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="text-muted-foreground mb-1">Owner</p>
                  <p className="font-mono text-foreground text-xs">{agent.owner}</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="text-muted-foreground mb-1">Agent Wallet</p>
                  <p className="font-mono text-foreground text-xs">{agent.wallet}</p>
                </div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Registry: <a href={`https://explorer.testnet3.goat.network/address/0x3de03AB80fdDDa888598303FF34E496bD29E140F`}
                  target="_blank" rel="noreferrer"
                  className="text-primary hover:underline font-mono">
                  0x3de0…140F ↗
                </a>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
