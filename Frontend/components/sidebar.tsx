'use client';

import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Bot,
  LineChart,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  RadioTower,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BG_SIDEBAR = '#0a0d22';
const EMERALD = '#34d399';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Agents', path: '/agents', icon: Bot },
  { label: 'Analytics', path: '/analytics', icon: LineChart },
  { label: 'Reports', path: '/reports', icon: FileText },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', damping: 25 }}
      style={{
        width: open ? 256 : 80,
        background: `linear-gradient(180deg, ${BG_SIDEBAR} 0%, #060817 100%)`,
        borderRight: '1px solid rgba(99,102,241,0.2)',
        padding: '24px 16px',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        boxShadow: '4px 0 30px rgba(0,0,0,0.4)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 32,
        }}
      >
        {open && (
          <span
            style={{
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            AgentAudit
          </span>
        )}
        <button
          onClick={onToggle}
          style={{
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 8,
            padding: 8,
            cursor: 'pointer',
            color: '#a5aae2',
            transition: 'all 0.2s',
          }}
        >
          {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {navItems.map((item, i) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link key={i} href={item.path} style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ x: 4 }}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  color: isActive ? '#fff' : 'rgb(165,170,210)',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(6,182,212,0.15))'
                    : 'transparent',
                  border: isActive ? '1px solid rgba(99,102,241,0.35)' : '1px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                <Icon className="w-4 h-4" style={{ flexShrink: 0 }} />
                {open && item.label}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {open && (
        <div style={{ padding: '0 12px', marginBottom: 16 }}>
          <a
            href="https://explorer.testnet3.goat.network"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 11,
              color: 'rgb(130,135,175)',
              textDecoration: 'none',
              padding: '8px 10px',
              borderRadius: 8,
              background: 'rgba(52,211,153,0.05)',
              border: '1px solid rgba(52,211,153,0.1)',
            }}
          >
            <RadioTower className="w-3.5 h-3.5" style={{ color: EMERALD }} />
            <span>GOAT Testnet3</span>
            <ExternalLink className="w-3 h-3" style={{ marginLeft: 'auto' }} />
          </a>
        </div>
      )}

      <motion.div
        whileHover={{ x: 4 }}
        style={{
          padding: '10px 12px',
          borderRadius: 10,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: 'rgb(165,170,210)',
          fontSize: 14,
          fontWeight: 500,
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgb(165,170,210)')}
      >
        <LogOut className="w-4 h-4" style={{ flexShrink: 0 }} />
        {open && 'Logout'}
      </motion.div>
    </motion.aside>
  );
}
