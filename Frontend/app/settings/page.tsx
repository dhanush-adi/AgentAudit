'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Key, Palette, Save } from 'lucide-react';
import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';

const BG_MAIN = '#08091a';
const INDIGO = '#6366f1';
const CYAN = '#06b6d4';

const sections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'api', label: 'API & Webhooks', icon: Key },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
  <button onClick={onChange} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: enabled ? INDIGO : 'rgba(99,102,241,0.2)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
    <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: enabled ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} />
  </button>
);

const InputField = ({ label, value, onChange, disabled = false }: { label: string; value: string; onChange?: (v: string) => void; disabled?: boolean }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: 'rgb(165,170,210)', display: 'block', marginBottom: 6 }}>{label}</label>
    <input value={value} disabled={disabled} onChange={(e) => onChange?.(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(14,18,52,0.6)', color: disabled ? 'rgb(100,105,145)' : '#f0f1ff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
  </div>
);

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('profile');
  const [name, setName] = useState('AgentAudit User');
  const [email, setEmail] = useState('user@agentaudit.io');
  const [twoFA, setTwoFA] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('https://hooks.example.com/agent-audit');

  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <div style={{ minHeight: '100vh', background: BG_MAIN, display: 'flex', color: '#f0f1ff' }}>
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main style={{ flex: 1, marginLeft: sidebarOpen ? 256 : 80, transition: 'margin-left 0.3s ease', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopNav title="Settings" subtitle="Manage your account and preferences" />

        <div style={{ padding: 32, flex: 1, display: 'flex', gap: 24 }}>
          {/* Settings nav */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible" style={{ width: 220, flexShrink: 0, borderRadius: 16, background: 'linear-gradient(135deg, rgba(14,18,52,0.95), rgba(20,25,65,0.95))', border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', padding: '12px 8px', height: 'fit-content', position: 'sticky', top: 100 }}>
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <div key={sec.id} onClick={() => setActiveSection(sec.id)} style={{ padding: '10px 12px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontWeight: isActive ? 600 : 500, fontSize: 13, color: isActive ? '#fff' : 'rgb(165,170,210)', background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent', transition: 'all 0.2s' }}>
                  <Icon style={{ width: 16, height: 16, flexShrink: 0, color: isActive ? INDIGO : 'rgb(130,135,175)' }} />
                  {sec.label}
                </div>
              );
            })}
          </motion.div>

          {/* Settings panels */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {activeSection === 'profile' && (
              <motion.div variants={itemVariants} initial="hidden" animate="visible" style={{ borderRadius: 16, background: 'linear-gradient(135deg, rgba(14,18,52,0.95), rgba(20,25,65,0.95))', border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', padding: 28 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f0f1ff', margin: '0 0 6px' }}>Profile Settings</h3>
                <p style={{ fontSize: 12, color: 'rgb(130,135,175)', margin: '0 0 24px' }}>Manage your personal information.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                  <InputField label="Full Name" value={name} onChange={setName} />
                  <InputField label="Email Address" value={email} onChange={setEmail} />
                  <InputField label="Role" value="Admin" disabled />
                  <InputField label="Organization" value="AgentAudit Inc." disabled />
                </div>
                <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg, ${INDIGO}, ${CYAN})`, color: '#fff', fontSize: 13, fontWeight: 600, marginTop: 8 }}>
                  <Save style={{ width: 14, height: 14 }} /> Save Changes
                </button>
              </motion.div>
            )}

            {activeSection === 'security' && (
              <motion.div variants={itemVariants} initial="hidden" animate="visible" style={{ borderRadius: 16, background: 'linear-gradient(135deg, rgba(14,18,52,0.95), rgba(20,25,65,0.95))', border: '1px solid rgba(52,211,153,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', padding: 28 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f0f1ff', margin: '0 0 6px' }}>Security Settings</h3>
                <p style={{ fontSize: 12, color: 'rgb(130,135,175)', margin: '0 0 24px' }}>Manage authentication and access controls.</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#f0f1ff' }}>Two-Factor Authentication</p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgb(130,135,175)' }}>{twoFA ? 'Enabled' : 'Disabled'}</p>
                  </div>
                  <Toggle enabled={twoFA} onChange={() => setTwoFA(!twoFA)} />
                </div>
              </motion.div>
            )}

            {activeSection === 'api' && (
              <motion.div variants={itemVariants} initial="hidden" animate="visible" style={{ borderRadius: 16, background: 'linear-gradient(135deg, rgba(14,18,52,0.95), rgba(20,25,65,0.95))', border: '1px solid rgba(245,158,11,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', padding: 28 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f0f1ff', margin: '0 0 6px' }}>API & Webhooks</h3>
                <p style={{ fontSize: 12, color: 'rgb(130,135,175)', margin: '0 0 24px' }}>Manage API keys and webhook endpoints.</p>
                <InputField label="Webhook Endpoint URL" value={webhookUrl} onChange={setWebhookUrl} />
              </motion.div>
            )}

            {activeSection === 'appearance' && (
              <motion.div variants={itemVariants} initial="hidden" animate="visible" style={{ borderRadius: 16, background: 'linear-gradient(135deg, rgba(14,18,52,0.95), rgba(20,25,65,0.95))', border: '1px solid rgba(139,92,246,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', padding: 28 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f0f1ff', margin: '0 0 6px' }}>Appearance</h3>
                <p style={{ fontSize: 12, color: 'rgb(130,135,175)', margin: '0 0 24px' }}>Customize the look and feel.</p>
                <p style={{ fontSize: 13, color: 'rgb(165,170,210)' }}>Dark mode is the default theme. Light mode support coming soon.</p>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
