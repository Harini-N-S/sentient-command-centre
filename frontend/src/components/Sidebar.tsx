import React from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  ReceiptText,
  Users,
  Network,
} from 'lucide-react';

export type ViewType = 'command-centre' | 'alerts' | 'transactions' | 'customers';

interface SidebarProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  criticalCount?: number;
  totalAlertsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  criticalCount = 0,
}) => {
  const navItems: Array<{
    id: ViewType;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    badge?: number;
    badgeType?: 'critical' | 'gold';
  }> = [
    {
      id: 'command-centre',
      label: 'Command Centre',
      sublabel: 'Surveillance & KPIs',
      icon: <LayoutDashboard size={18} />,
    },
    {
      id: 'alerts',
      label: 'Alerts Triage',
      sublabel: 'Forensic Queue',
      icon: <AlertTriangle size={18} />,
      badge: criticalCount > 0 ? criticalCount : undefined,
      badgeType: 'critical',
    },
    {
      id: 'transactions',
      label: 'Transactions',
      sublabel: 'Ledger Audit',
      icon: <ReceiptText size={18} />,
    },
    {
      id: 'customers',
      label: 'Customers',
      sublabel: 'Risk Baselines',
      icon: <Users size={18} />,
    },
  ];

  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: 'var(--bg-panel)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}
    >
      {/* Primary Navigation List */}
      <div style={{ padding: '16px 10px' }}>
        <div
          style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-muted)',
            padding: '0 10px 8px 10px',
            fontWeight: 600,
          }}
        >
          OPERATIONAL SUITE
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isActive ? 'var(--color-gold-fill)' : 'transparent',
                  color: isActive ? 'var(--color-gold)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid var(--color-gold-border)' : '1px solid transparent',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                  width: '100%',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: isActive ? 'var(--rawbank-yellow)' : 'var(--text-muted)' }}>
                    {item.icon}
                  </span>
                  <div>
                    <div style={{ fontWeight: isActive ? 600 : 500, fontSize: '13px', color: isActive ? 'var(--rawbank-yellow)' : 'var(--text-primary)' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {item.sublabel}
                    </div>
                  </div>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={item.badgeType === 'critical' ? 'badge badge-critical' : 'badge badge-gold'}
                    style={{ fontSize: '10px', padding: '1px 6px' }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info / Protocol */}
      <div
        style={{
          padding: '14px 16px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-base)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <Network size={14} color="var(--rawbank-yellow)" />
          <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
            SURVEILLANCE PROTOCOL
          </span>
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          Banque Centrale du Congo (BCC) AML Standards • 11 Forensic Rules Active
        </div>
      </div>
    </aside>
  );
};
