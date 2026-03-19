'use client';

import { Bell } from 'lucide-react';

const BG_NAV = 'rgba(10,13,34,0.85)';
const INDIGO = '#6366f1';

export function TopNav({ title, subtitle, online }: { title: string; subtitle: string; online?: boolean }) {
  return (
    <nav
      style={{
        background: BG_NAV,
        borderBottom: '1px solid rgba(99,102,241,0.15)',
        backdropFilter: 'blur(16px)',
        padding: '16px 32px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f0f1ff', margin: 0 }}>{title}</h2>
        <p style={{ fontSize: 11, color: 'rgb(130,135,175)', marginTop: 4 }}>{subtitle}</p>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {online !== undefined && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.05em',
              background: online ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)',
              border: online ? '1px solid rgba(52,211,153,0.25)' : '1px solid rgba(239,68,68,0.25)',
              color: online ? '#34d399' : '#ef4444',
              padding: '4px 12px',
              borderRadius: 20,
            }}
          >
            {online ? '● ONLINE' : '● OFFLINE'}
          </span>
        )}
        <button
          style={{
            position: 'relative',
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 8,
            padding: 8,
            cursor: 'pointer',
          }}
        >
          <Bell className="w-5 h-5" style={{ color: INDIGO }} />
        </button>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4, #ec4899)',
            boxShadow: '0 0 16px rgba(99,102,241,0.5)',
          }}
        />
      </div>
    </nav>
  );
}
