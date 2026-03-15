'use client';

import { motion } from 'framer-motion';
import {
  Bell, Settings, Menu, X, LayoutDashboard, Bot, LineChart as LineIcon,
  FileText, LogOut, User, Lock, Globe, Palette, Shield, Key,
  Mail, Smartphone, Moon, Sun, Monitor, Save, Trash2, Eye, EyeOff,
  ChevronRight, Copy, RefreshCw,
} from 'lucide-react';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/* ── Design tokens ──────────────────────── */
const BG_MAIN    = '#08091a';
const BG_SIDEBAR = '#0a0d22';
const BG_NAV     = 'rgba(10,13,34,0.85)';
const CARD_BG    = 'linear-gradient(135deg, rgba(14,18,52,0.95), rgba(20,25,65,0.95))';
const INPUT_BG   = 'rgba(14,18,52,0.6)';
const INDIGO     = '#6366f1';
const CYAN       = '#06b6d4';
const PINK       = '#ec4899';
const EMERALD    = '#34d399';
const AMBER      = '#f59e0b';
const RED        = '#ef4444';

const navItems = [
  { label: 'Dashboard', path: '/dashboard',  icon: LayoutDashboard },
  { label: 'Agents',    path: '/agents',     icon: Bot },
  { label: 'Analytics', path: '/analytics',  icon: LineIcon },
  { label: 'Reports',   path: '/reports',    icon: FileText },
  { label: 'Settings',  path: '/settings',   icon: Settings },
];

/* ── Settings sections ──────────────────── */
const settingsSections = [
  { id: 'profile',       label: 'Profile',        icon: User },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
  { id: 'security',      label: 'Security',       icon: Lock },
  { id: 'api',           label: 'API & Webhooks', icon: Key },
  { id: 'appearance',    label: 'Appearance',     icon: Palette },
  { id: 'danger',        label: 'Danger Zone',    icon: Trash2 },
];

/* ── Component ──────────────────────────── */
export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen]       = useState(true);
  const [activeSection, setActiveSection]   = useState('profile');
  const router   = useRouter();
  const pathname = usePathname();

  // Profile state
  const [profile, setProfile] = useState({
    name: 'Arun Srivastav', email: 'arun@agentaudit.io', role: 'Admin', org: 'AgentAudit Inc.',
    timezone: 'Asia/Kolkata (UTC+5:30)', language: 'English',
  });

  // Notification state
  const [notifs, setNotifs] = useState({
    emailAlerts: true, pushAlerts: true, slackIntegration: false,
    agentDown: true, performanceDrop: true, complianceFail: true,
    weeklyDigest: true, monthlyReport: true, securityAlerts: true,
  });

  // Security state
  const [twoFA, setTwoFA]             = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [ipWhitelist, setIpWhitelist]       = useState('192.168.1.0/24, 10.0.0.0/8');

  // API state
  const [showKey, setShowKey]   = useState(false);
  const apiKey = 'sk-agentaudit-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
  const [webhookUrl, setWebhookUrl] = useState('https://hooks.example.com/agent-audit');
  const [rateLimit, setRateLimit]   = useState('1000');

  // Appearance state
  const [theme, setTheme]       = useState<'dark' | 'light' | 'system'>('dark');
  const [accentColor, setAccentColor] = useState(INDIGO);
  const [compactMode, setCompactMode] = useState(false);
  const [animations, setAnimations]   = useState(true);

  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  /* ── Toggle switch component ── */
  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button onClick={onChange} style={{
      width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
      background: enabled ? INDIGO : 'rgba(99,102,241,0.2)', position: 'relative', transition: 'background 0.2s',
      flexShrink: 0,
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3, left: enabled ? 23 : 3, transition: 'left 0.2s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      }} />
    </button>
  );

  /* ── Input field component ── */
  const InputField = ({ label, value, onChange, type = 'text', disabled = false }: { label: string; value: string; onChange?: (v: string) => void; type?: string; disabled?: boolean }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'rgb(165,170,210)', display: 'block', marginBottom: 6 }}>{label}</label>
      <input
        type={type} value={value} disabled={disabled}
        onChange={e => onChange?.(e.target.value)}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.2)',
          background: INPUT_BG, color: disabled ? 'rgb(100,105,145)' : '#f0f1ff', fontSize: 13, outline: 'none',
          transition: 'border 0.2s', boxSizing: 'border-box', cursor: disabled ? 'not-allowed' : 'text',
        }}
        onFocus={e => { if (!disabled) e.target.style.borderColor = INDIGO; }}
        onBlur={e => { e.target.style.borderColor = 'rgba(99,102,241,0.2)'; }}
      />
    </div>
  );

  /* ── Notification row ── */
  const NotifRow = ({ label, desc, toggleKey }: { label: string; desc: string; toggleKey: keyof typeof notifs }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
      <div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#f0f1ff' }}>{label}</p>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgb(130,135,175)' }}>{desc}</p>
      </div>
      <Toggle enabled={notifs[toggleKey]} onChange={() => setNotifs(prev => ({ ...prev, [toggleKey]: !prev[toggleKey] }))} />
    </div>
  );

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
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f0f1ff', margin: 0 }}>Settings</h2>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg, ${INDIGO}, ${CYAN})`, color: '#fff', fontSize: 13, fontWeight: 600 }}>
              <Save style={{ width: 14, height: 14 }} /> Save Changes
            </button>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #06b6d4, #ec4899)', boxShadow: '0 0 16px rgba(99,102,241,0.5)' }} />
          </div>
        </nav>

        {/* Content: Sidebar nav + Panels */}
        <div style={{ padding: 32, flex: 1, display: 'flex', gap: 24 }}>

          {/* ── Settings sidebar ── */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible" style={{ width: 220, flexShrink: 0, borderRadius: 16, background: CARD_BG, border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', padding: '12px 8px', height: 'fit-content', position: 'sticky', top: 100 }}>
            {settingsSections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <motion.div key={sec.id} whileHover={{ x: 3 }} onClick={() => setActiveSection(sec.id)} style={{
                  padding: '10px 12px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                  fontWeight: isActive ? 600 : 500, fontSize: 13,
                  color: isActive ? '#fff' : sec.id === 'danger' ? 'rgb(200,130,130)' : 'rgb(165,170,210)',
                  background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                  transition: 'all 0.2s',
                }}>
                  <Icon style={{ width: 16, height: 16, flexShrink: 0, color: isActive ? INDIGO : sec.id === 'danger' ? RED : 'rgb(130,135,175)' }} />
                  {sec.label}
                  <ChevronRight style={{ width: 14, height: 14, marginLeft: 'auto', color: isActive ? INDIGO : 'transparent' }} />
                </motion.div>
              );
            })}
          </motion.div>

          {/* ── Settings panels ── */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* ── Profile ── */}
            {activeSection === 'profile' && (
              <motion.div variants={itemVariants} initial="hidden" animate="visible" style={{ borderRadius: 16, background: CARD_BG, border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', padding: 28 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f0f1ff', margin: '0 0 6px' }}>Profile Settings</h3>
                <p style={{ fontSize: 12, color: 'rgb(130,135,175)', margin: '0 0 24px' }}>Manage your personal information and preferences.</p>

                {/* Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, padding: 16, borderRadius: 12, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #06b6d4, #ec4899)', boxShadow: '0 0 20px rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                    AS
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#f0f1ff' }}>{profile.name}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgb(130,135,175)' }}>{profile.role} - {profile.org}</p>
                  </div>
                  <button style={{ marginLeft: 'auto', padding: '8px 16px', borderRadius: 8, border: `1px solid ${INDIGO}40`, background: `${INDIGO}15`, color: INDIGO, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Change Avatar</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                  <InputField label="Full Name" value={profile.name} onChange={v => setProfile(p => ({ ...p, name: v }))} />
                  <InputField label="Email Address" value={profile.email} onChange={v => setProfile(p => ({ ...p, email: v }))} />
                  <InputField label="Role" value={profile.role} disabled />
                  <InputField label="Organization" value={profile.org} onChange={v => setProfile(p => ({ ...p, org: v }))} />
                  <InputField label="Timezone" value={profile.timezone} onChange={v => setProfile(p => ({ ...p, timezone: v }))} />
                  <InputField label="Language" value={profile.language} onChange={v => setProfile(p => ({ ...p, language: v }))} />
                </div>
              </motion.div>
            )}

            {/* ── Notifications ── */}
            {activeSection === 'notifications' && (
              <motion.div variants={itemVariants} initial="hidden" animate="visible" style={{ borderRadius: 16, background: CARD_BG, border: '1px solid rgba(6,182,212,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', padding: 28 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f0f1ff', margin: '0 0 6px' }}>Notification Preferences</h3>
                <p style={{ fontSize: 12, color: 'rgb(130,135,175)', margin: '0 0 24px' }}>Choose how and when you want to be notified.</p>

                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: CYAN, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivery Channels</p>
                  <NotifRow label="Email Alerts" desc="Receive notifications via email" toggleKey="emailAlerts" />
                  <NotifRow label="Push Notifications" desc="Browser & mobile push alerts" toggleKey="pushAlerts" />
                  <NotifRow label="Slack Integration" desc="Forward alerts to Slack channel" toggleKey="slackIntegration" />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: CYAN, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Alert Types</p>
                  <NotifRow label="Agent Down" desc="When an agent goes offline or errors" toggleKey="agentDown" />
                  <NotifRow label="Performance Drop" desc="When efficiency falls below threshold" toggleKey="performanceDrop" />
                  <NotifRow label="Compliance Failure" desc="When compliance score drops below target" toggleKey="complianceFail" />
                </div>

                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: CYAN, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scheduled Reports</p>
                  <NotifRow label="Weekly Digest" desc="Summary every Monday at 9:00 AM" toggleKey="weeklyDigest" />
                  <NotifRow label="Monthly Report" desc="Full report on the 1st of each month" toggleKey="monthlyReport" />
                  <NotifRow label="Security Alerts" desc="Immediate notification for security events" toggleKey="securityAlerts" />
                </div>
              </motion.div>
            )}

            {/* ── Security ── */}
            {activeSection === 'security' && (
              <motion.div variants={itemVariants} initial="hidden" animate="visible" style={{ borderRadius: 16, background: CARD_BG, border: '1px solid rgba(52,211,153,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', padding: 28 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f0f1ff', margin: '0 0 6px' }}>Security Settings</h3>
                <p style={{ fontSize: 12, color: 'rgb(130,135,175)', margin: '0 0 24px' }}>Manage authentication, sessions, and access controls.</p>

                {/* 2FA */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, background: 'rgba(52,211,153,0.06)', border: `1px solid ${EMERALD}20`, marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ padding: 10, borderRadius: 10, background: `${EMERALD}18`, border: `1px solid ${EMERALD}30` }}>
                      <Shield style={{ width: 20, height: 20, color: EMERALD }} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#f0f1ff' }}>Two-Factor Authentication</p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgb(130,135,175)' }}>{twoFA ? 'Enabled - using authenticator app' : 'Disabled - your account is less secure'}</p>
                    </div>
                  </div>
                  <Toggle enabled={twoFA} onChange={() => setTwoFA(!twoFA)} />
                </div>

                {/* Password */}
                <div style={{ padding: 16, borderRadius: 12, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)', marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#f0f1ff' }}>Password</p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgb(130,135,175)' }}>Last changed 15 days ago</p>
                    </div>
                    <button style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${INDIGO}40`, background: `${INDIGO}15`, color: INDIGO, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Change Password</button>
                  </div>
                </div>

                {/* Session timeout */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'rgb(165,170,210)', display: 'block', marginBottom: 6 }}>Session Timeout (minutes)</label>
                  <select value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.2)', background: INPUT_BG, color: '#f0f1ff', fontSize: 13, outline: 'none', cursor: 'pointer', width: 200 }}>
                    {['15', '30', '60', '120', '480'].map(v => <option key={v} value={v}>{v} minutes</option>)}
                  </select>
                </div>

                {/* IP Whitelist */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'rgb(165,170,210)', display: 'block', marginBottom: 6 }}>IP Whitelist (comma-separated)</label>
                  <input value={ipWhitelist} onChange={e => setIpWhitelist(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.2)', background: INPUT_BG, color: '#f0f1ff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => (e.target.style.borderColor = INDIGO)} onBlur={e => (e.target.style.borderColor = 'rgba(99,102,241,0.2)')}
                  />
                </div>

                {/* Active sessions */}
                <div style={{ marginTop: 24 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: EMERALD, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Sessions</p>
                  {[
                    { device: 'Chrome - Windows 11',  ip: '192.168.1.42',  time: 'Current session', current: true },
                    { device: 'Firefox - macOS',       ip: '10.0.0.15',     time: '2 hours ago',     current: false },
                    { device: 'Mobile App - iOS',      ip: '172.16.0.8',    time: '1 day ago',       current: false },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(99,102,241,0.06)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Monitor style={{ width: 16, height: 16, color: s.current ? EMERALD : 'rgb(130,135,175)' }} />
                        <div>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#f0f1ff' }}>{s.device}</p>
                          <p style={{ margin: 0, fontSize: 11, color: 'rgb(130,135,175)' }}>{s.ip} - {s.time}</p>
                        </div>
                      </div>
                      {!s.current && (
                        <button style={{ padding: '5px 12px', borderRadius: 6, border: `1px solid ${RED}30`, background: `${RED}10`, color: RED, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Revoke</button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── API & Webhooks ── */}
            {activeSection === 'api' && (
              <motion.div variants={itemVariants} initial="hidden" animate="visible" style={{ borderRadius: 16, background: CARD_BG, border: '1px solid rgba(245,158,11,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', padding: 28 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f0f1ff', margin: '0 0 6px' }}>API & Webhooks</h3>
                <p style={{ fontSize: 12, color: 'rgb(130,135,175)', margin: '0 0 24px' }}>Manage API keys, webhook endpoints, and rate limits.</p>

                {/* API Key */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'rgb(165,170,210)', display: 'block', marginBottom: 6 }}>API Key</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <input readOnly value={showKey ? apiKey : apiKey.replace(/./g, '*').slice(0, 24) + '...'} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.2)', background: INPUT_BG, color: '#f0f1ff', fontSize: 13, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <button onClick={() => setShowKey(!showKey)} style={{ padding: '10px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.2)', background: INPUT_BG, cursor: 'pointer' }}>
                      {showKey ? <EyeOff style={{ width: 16, height: 16, color: 'rgb(165,170,210)' }} /> : <Eye style={{ width: 16, height: 16, color: 'rgb(165,170,210)' }} />}
                    </button>
                    <button style={{ padding: '10px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.2)', background: INPUT_BG, cursor: 'pointer' }} title="Copy">
                      <Copy style={{ width: 16, height: 16, color: 'rgb(165,170,210)' }} />
                    </button>
                    <button style={{ padding: '10px', borderRadius: 8, border: `1px solid ${AMBER}30`, background: `${AMBER}10`, cursor: 'pointer' }} title="Regenerate">
                      <RefreshCw style={{ width: 16, height: 16, color: AMBER }} />
                    </button>
                  </div>
                </div>

                {/* Webhook URL */}
                <InputField label="Webhook Endpoint URL" value={webhookUrl} onChange={v => setWebhookUrl(v)} />

                {/* Rate Limit */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'rgb(165,170,210)', display: 'block', marginBottom: 6 }}>Rate Limit (requests/min)</label>
                  <select value={rateLimit} onChange={e => setRateLimit(e.target.value)} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.2)', background: INPUT_BG, color: '#f0f1ff', fontSize: 13, outline: 'none', cursor: 'pointer', width: 200 }}>
                    {['100', '500', '1000', '5000', '10000'].map(v => <option key={v} value={v}>{v} req/min</option>)}
                  </select>
                </div>

                {/* Webhook events */}
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: AMBER, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Webhook Events</p>
                  {[
                    { event: 'agent.status_change',  desc: 'When an agent goes online/offline' },
                    { event: 'alert.triggered',       desc: 'When a monitoring alert fires' },
                    { event: 'report.generated',      desc: 'When a report finishes generating' },
                    { event: 'compliance.violation',  desc: 'When a compliance rule is violated' },
                  ].map((e, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(99,102,241,0.06)' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#f0f1ff', fontFamily: 'monospace' }}>{e.event}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgb(130,135,175)' }}>{e.desc}</p>
                      </div>
                      <Toggle enabled={true} onChange={() => {}} />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Appearance ── */}
            {activeSection === 'appearance' && (
              <motion.div variants={itemVariants} initial="hidden" animate="visible" style={{ borderRadius: 16, background: CARD_BG, border: '1px solid rgba(139,92,246,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', padding: 28 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f0f1ff', margin: '0 0 6px' }}>Appearance</h3>
                <p style={{ fontSize: 12, color: 'rgb(130,135,175)', margin: '0 0 24px' }}>Customize the look and feel of your dashboard.</p>

                {/* Theme */}
                <div style={{ marginBottom: 28 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'rgb(165,170,210)', marginBottom: 10 }}>Theme</p>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {([
                      { value: 'dark',   label: 'Dark',   icon: Moon },
                      { value: 'light',  label: 'Light',  icon: Sun },
                      { value: 'system', label: 'System', icon: Monitor },
                    ] as const).map(t => {
                      const Icon = t.icon;
                      const isSelected = theme === t.value;
                      return (
                        <button key={t.value} onClick={() => setTheme(t.value)} style={{
                          padding: '14px 24px', borderRadius: 12, cursor: 'pointer',
                          border: `1px solid ${isSelected ? INDIGO : 'rgba(99,102,241,0.15)'}`,
                          background: isSelected ? `${INDIGO}15` : 'transparent',
                          color: isSelected ? INDIGO : 'rgb(165,170,210)',
                          display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600,
                          transition: 'all 0.2s',
                        }}>
                          <Icon style={{ width: 16, height: 16 }} /> {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Accent color */}
                <div style={{ marginBottom: 28 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'rgb(165,170,210)', marginBottom: 10 }}>Accent Color</p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[INDIGO, CYAN, PINK, EMERALD, AMBER, '#8b5cf6'].map(color => (
                      <button key={color} onClick={() => setAccentColor(color)} style={{
                        width: 36, height: 36, borderRadius: '50%', border: accentColor === color ? '3px solid #fff' : '3px solid transparent',
                        background: color, cursor: 'pointer', boxShadow: accentColor === color ? `0 0 16px ${color}80` : 'none',
                        transition: 'all 0.2s',
                      }} />
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#f0f1ff' }}>Compact Mode</p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgb(130,135,175)' }}>Reduce padding and font sizes</p>
                  </div>
                  <Toggle enabled={compactMode} onChange={() => setCompactMode(!compactMode)} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#f0f1ff' }}>Animations</p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgb(130,135,175)' }}>Enable motion and transitions</p>
                  </div>
                  <Toggle enabled={animations} onChange={() => setAnimations(!animations)} />
                </div>
              </motion.div>
            )}

            {/* ── Danger Zone ── */}
            {activeSection === 'danger' && (
              <motion.div variants={itemVariants} initial="hidden" animate="visible" style={{ borderRadius: 16, background: CARD_BG, border: '1px solid rgba(239,68,68,0.3)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', padding: 28 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: RED, margin: '0 0 6px' }}>Danger Zone</h3>
                <p style={{ fontSize: 12, color: 'rgb(130,135,175)', margin: '0 0 24px' }}>Irreversible actions. Proceed with extreme caution.</p>

                {[
                  { title: 'Reset All Agent Configurations', desc: 'This will reset all agent settings to their defaults. Running agents will be stopped.', btn: 'Reset Configs', color: AMBER },
                  { title: 'Export All Data',                 desc: 'Download a complete export of all your data including agents, reports, and analytics.', btn: 'Export Data', color: CYAN },
                  { title: 'Delete All Reports',              desc: 'Permanently delete all generated reports. This action cannot be undone.', btn: 'Delete Reports', color: PINK },
                  { title: 'Delete Account',                  desc: 'Permanently delete your account and all associated data. This action is irreversible.', btn: 'Delete Account', color: RED },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, background: `${item.color}06`, border: `1px solid ${item.color}15`, marginBottom: i < 3 ? 12 : 0 }}>
                    <div style={{ maxWidth: '65%' }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#f0f1ff' }}>{item.title}</p>
                      <p style={{ margin: '4px 0 0', fontSize: 11, color: 'rgb(130,135,175)' }}>{item.desc}</p>
                    </div>
                    <button style={{ padding: '8px 18px', borderRadius: 8, border: `1px solid ${item.color}50`, background: `${item.color}15`, color: item.color, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>{item.btn}</button>
                  </div>
                ))}
              </motion.div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
