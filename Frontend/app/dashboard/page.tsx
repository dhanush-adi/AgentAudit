'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Activity, AlertTriangle } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback, Component, type ReactNode } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';

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
  mockData?: boolean;
  error?: string;
}

interface LogsResponse {
  logs: CallLog[];
  totalCalls: number;
  totalEarned: string;
  status: string;
  error?: string;
}

// ── Styling Constants ──────────────────────────────────────
const CHART_COLORS = ['#6366f1', '#06b6d4', '#ec4899'];
const BG_MAIN = '#08091a';
const BG_CARD = 'rgba(14,18,52,0.85)';

const INDIGO = '#6366f1';
const CYAN = '#06b6d4';
const PINK = '#ec4899';
const EMERALD = '#34d399';

// ── Error Boundary ─────────────────────────────────────────
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class DashboardErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: BG_MAIN,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f0f1ff',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: 400 }}>
            <AlertTriangle style={{ width: 48, height: 48, color: '#ef4444', marginBottom: 16 }} />
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h2>
            <p style={{ fontSize: 13, color: 'rgb(130,135,175)', marginBottom: 16 }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                padding: '10px 24px',
                borderRadius: 8,
                background: INDIGO,
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Dashboard ──────────────────────────────────────────────
export default function Dashboard() {
  return (
    <DashboardErrorBoundary>
      <DashboardContent />
    </DashboardErrorBoundary>
  );
}

function DashboardContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [logs, setLogs] = useState<CallLog[]>([]);
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [totalCalls, setTotalCalls] = useState(0);
  const [totalEarned, setTotalEarned] = useState('0.000');
  const [agentOnline, setAgentOnline] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [agentError, setAgentError] = useState<string | null>(null);

  // Poll call logs with exponential backoff
  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/calls');
      const data: LogsResponse = await res.json();

      if (data.error) {
        setLogsError(data.error);
      } else {
        setLogsError(null);
      }

      setLogs(data.logs ?? []);
      setTotalCalls(data.totalCalls ?? 0);
      setTotalEarned(data.totalEarned ?? '0.000');
      setAgentOnline(data.status === 'online');

      return data.status === 'online';
    } catch (err) {
      setLogsError(err instanceof Error ? err.message : 'Failed to fetch logs');
      setAgentOnline(false);
      return false;
    }
  }, []);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let consecutiveFailures = 0;

    const poll = async () => {
      const success = await fetchLogs();
      if (success) {
        consecutiveFailures = 0;
      } else {
        consecutiveFailures = Math.min(consecutiveFailures + 1, 6);
      }
      // Backoff: 5s → 10s → 20s → 40s → 60s (cap) on failures, reset to 5s on success
      const delay = success ? 5000 : Math.min(5000 * 2 ** consecutiveFailures, 60000);
      timeoutId = setTimeout(poll, delay);
    };

    poll();
    return () => clearTimeout(timeoutId);
  }, [fetchLogs]);

  // Fetch on-chain agent data once at load
  useEffect(() => {
    fetch('/api/agent?id=0')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          if (d.error) setAgentError(d.error);
          setAgent(d);
        }
      })
      .catch((err) => {
        setAgentError(err instanceof Error ? err.message : 'Failed to fetch agent data');
      });
  }, []);

  // Memoize chart data
  const chartData = useMemo(() => {
    const byEndpoint = logs.reduce<Record<string, number>>((acc, l) => {
      acc[l.endpoint] = (acc[l.endpoint] ?? 0) + 1;
      return acc;
    }, {});
    const data = Object.entries(byEndpoint).map(([name, calls]) => ({ name, calls }));
    if (data.length === 0) {
      data.push({ name: '/analyze', calls: 0 }, { name: '/summarize', calls: 0 });
    }
    return data;
  }, [logs]);

  const pieData = useMemo(
    () => [
      { name: 'Verified', value: logs.filter((l) => l.status === 'verified').length || 1 },
      { name: 'Rejected', value: logs.filter((l) => l.status === 'rejected').length || 0 },
      { name: 'Pending', value: logs.filter((l) => l.status === 'pending').length || 0 },
    ],
    [logs],
  );

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
      subtitle: agentOnline ? 'Agent Online' : 'Agent Offline',
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
      value: agent ? `#${agent.agentId}` : 'Loading\u2026',
      subtitle: agent ? `${agent.wallet.slice(0, 10)}\u2026` : 'GOAT Testnet3',
      icon: Users,
      accent: PINK,
    },
    {
      title: 'Reputation Score',
      value: agent
        ? agent.reputation.avgScore > 0
          ? `${agent.reputation.avgScore.toFixed(1)}\u2605`
          : 'N/A'
        : '\u2014',
      subtitle: agent ? `${agent.reputation.feedbackCount} reviews` : 'Checking\u2026',
      icon: BarChart3,
      accent: EMERALD,
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: BG_MAIN, display: 'flex', color: '#f0f1ff' }}>
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main
        style={{
          flex: 1,
          marginLeft: sidebarOpen ? 256 : 80,
          transition: 'margin-left 0.3s ease',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <TopNav
          title="Dashboard"
          subtitle="GOAT Chain 48816 \u2022 Identity: 0x3de0\u2026140F"
          online={agentOnline}
        />

        <div style={{ padding: 32, flex: 1 }}>
          {/* Error banners */}
          {logsError && (
            <div
              style={{
                marginBottom: 16,
                padding: '12px 16px',
                borderRadius: 10,
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                fontSize: 12,
                color: '#fca5a5',
              }}
            >
              Logs: {logsError}
            </div>
          )}
          {agentError && (
            <div
              style={{
                marginBottom: 16,
                padding: '12px 16px',
                borderRadius: 10,
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.25)',
                fontSize: 12,
                color: '#fcd34d',
              }}
            >
              Agent: {agentError} (showing mock data)
            </div>
          )}

          {/* Stat cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 20,
              marginBottom: 28,
            }}
          >
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ y: -6, scale: 1.02 }}
                  style={{
                    padding: 24,
                    borderRadius: 16,
                    background: 'linear-gradient(135deg, rgba(14,18,52,0.95), rgba(20,25,65,0.95))',
                    border: `1px solid ${card.accent}33`,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                    cursor: 'default',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        padding: 10,
                        borderRadius: 12,
                        background: `${card.accent}18`,
                        border: `1px solid ${card.accent}30`,
                      }}
                    >
                      <Icon style={{ width: 20, height: 20, color: card.accent }} />
                    </div>
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: 'rgb(165,170,210)',
                      margin: '0 0 6px',
                    }}
                  >
                    {card.title}
                  </p>
                  <p
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: '#fff',
                      margin: '0 0 4px',
                      lineHeight: 1,
                    }}
                  >
                    {card.value}
                  </p>
                  <p style={{ fontSize: 11, color: 'rgb(130,135,175)', margin: 0 }}>
                    {card.subtitle}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Charts Row */}
          <div
            style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}
          >
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              style={{
                padding: 24,
                borderRadius: 16,
                background: BG_CARD,
                border: `1px solid ${INDIGO}20`,
                boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
              }}
            >
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#f0f1ff',
                  margin: '0 0 20px',
                }}
              >
                API Calls by Endpoint (Live)
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                  <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#a5a7d2', fontSize: 11 }} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#a5a7d2', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(10,13,34,0.95)',
                      border: `1px solid ${INDIGO}20`,
                      borderRadius: 10,
                    }}
                  />
                  <Bar dataKey="calls" fill={INDIGO} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              style={{
                padding: 24,
                borderRadius: 16,
                background: BG_CARD,
                border: `1px solid ${PINK}20`,
                boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
              }}
            >
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#f0f1ff',
                  margin: '0 0 20px',
                }}
              >
                Verification Status
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(10,13,34,0.95)',
                      border: 'none',
                      borderRadius: 10,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Lower Grid: Feed + Identity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              style={{
                padding: 24,
                borderRadius: 16,
                background: BG_CARD,
                border: `1px solid ${CYAN}20`,
                boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
              }}
            >
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#f0f1ff',
                  margin: '0 0 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    background: EMERALD,
                    borderRadius: '50%',
                    boxShadow: `0 0 10px ${EMERALD}`,
                  }}
                />
                Live Call Feed
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  maxHeight: 300,
                  overflowY: 'auto',
                }}
              >
                {logs.length === 0 ? (
                  <p style={{ color: 'rgb(130,135,175)', fontSize: 13 }}>
                    No calls yet. Try calling the demo agent at :3001
                  </p>
                ) : (
                  logs.slice(0, 15).map((log, i) => (
                    <div
                      key={`${log.tx_hash}-${i}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: 12,
                        background: 'rgba(255,255,255,0.03)',
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {log.status === 'verified' ? (
                          <span style={{ color: EMERALD }}>&#x2713;</span>
                        ) : (
                          <span style={{ color: '#ef4444' }}>&#xD7;</span>
                        )}
                        <span style={{ fontWeight: 600 }}>{log.endpoint}</span>
                      </span>
                      <span style={{ color: 'rgb(165,170,210)', fontFamily: 'monospace' }}>
                        {log.caller_address.slice(0, 8)}&hellip;
                      </span>
                      <span style={{ color: INDIGO, fontWeight: 700 }}>${log.amount_usdc}</span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {agent && (
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                style={{
                  padding: 24,
                  borderRadius: 16,
                  background: BG_CARD,
                  border: `1px solid ${EMERALD}20`,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                }}
              >
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: '#f0f1ff',
                    margin: '0 0 16px',
                  }}
                >
                  On-Chain Identity
                  {agent.mockData && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 500,
                        marginLeft: 8,
                        color: '#fbbf24',
                        background: 'rgba(251,191,36,0.1)',
                        padding: '2px 8px',
                        borderRadius: 4,
                      }}
                    >
                      MOCK
                    </span>
                  )}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div
                    style={{
                      padding: 14,
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <p
                      style={{
                        fontSize: 11,
                        color: 'rgb(130,135,175)',
                        marginBottom: 4,
                      }}
                    >
                      Agent Token ID
                    </p>
                    <p style={{ fontSize: 18, fontWeight: 800, color: INDIGO }}>#{agent.agentId}</p>
                  </div>
                  <div
                    style={{
                      padding: 14,
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <p
                      style={{
                        fontSize: 11,
                        color: 'rgb(130,135,175)',
                        marginBottom: 4,
                      }}
                    >
                      Agent Wallet
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#fff',
                        fontFamily: 'monospace',
                        wordBreak: 'break-all',
                      }}
                    >
                      {agent.wallet}
                    </p>
                  </div>
                  <div
                    style={{
                      padding: 14,
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <p
                      style={{
                        fontSize: 11,
                        color: 'rgb(130,135,175)',
                        marginBottom: 4,
                      }}
                    >
                      Owner Address
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#fff',
                        fontFamily: 'monospace',
                        wordBreak: 'break-all',
                      }}
                    >
                      {agent.owner}
                    </p>
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <a
                    href={`https://explorer.testnet3.goat.network/token/0x3de03AB80fdDDa888598303FF34E496bD29E140F/instance/${agent.agentId}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: 11,
                      color: CYAN,
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                  >
                    View on GOAT Explorer &uarr;
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
