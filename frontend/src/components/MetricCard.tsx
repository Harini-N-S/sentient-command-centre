import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  variant?: 'critical' | 'high' | 'medium' | 'low' | 'safe' | 'gold' | 'default';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  icon,
  variant = 'default',
  onClick,
}) => {
  const getBorderColor = () => {
    switch (variant) {
      case 'critical':
        return 'var(--sev-critical-border)';
      case 'high':
        return 'var(--sev-high-border)';
      case 'medium':
        return 'var(--sev-medium-border)';
      case 'low':
        return 'var(--sev-low-border)';
      case 'safe':
        return 'var(--sev-safe-border)';
      case 'gold':
        return 'var(--color-gold-border)';
      default:
        return 'var(--border-subtle)';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'critical':
        return 'var(--sev-critical-text)';
      case 'high':
        return 'var(--sev-high-text)';
      case 'medium':
        return 'var(--sev-medium-text)';
      case 'low':
        return 'var(--sev-low-text)';
      case 'safe':
        return 'var(--sev-safe-text)';
      case 'gold':
        return 'var(--color-gold)';
      default:
        return 'var(--text-secondary)';
    }
  };

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'var(--bg-panel)',
        border: `1px solid ${getBorderColor()}`,
        borderRadius: 'var(--radius-md)',
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
        minHeight: '84px',
        boxSizing: 'border-box',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          e.currentTarget.style.borderColor = 'var(--color-gold-border)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = getBorderColor();
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <span
          style={{
            fontSize: '10.5px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {label}
        </span>
        <span
          style={{
            color: getIconColor(),
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '26px',
            height: '26px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-elevated)',
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
      </div>

      <div style={{ marginTop: '8px' }}>
        <div
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            fontFamily: 'JetBrains Mono, monospace',
            lineHeight: 1.1,
          }}
        >
          {value}
        </div>
        {subtext && (
          <div
            style={{
              fontSize: '10.5px',
              color: 'var(--text-muted)',
              marginTop: '3px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
};
