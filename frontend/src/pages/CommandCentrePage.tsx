import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Activity,
  CreditCard,
  Users,
  Smartphone,
  Building,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { OverviewResponse, Alert } from '../types';
import { MetricCard } from '../components/MetricCard';

interface CommandCentrePageProps {
  onSelectEntity: (type: string, id: string) => void;
  onNavigateToAlerts: (filterSeverity?: string) => void;
  onInvestigateCopilot: (question: string, entityType?: string, entityId?: string) => void;
}

export const CommandCentrePage: React.FC<CommandCentrePageProps> = ({
  onSelectEntity,
  onNavigateToAlerts,
  onInvestigateCopilot,
}) => {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getOverview();
      if (!res.recent_critical_alerts || res.recent_critical_alerts.length === 0) {
        try {
          const criticalAlertsResp = await api.getAlerts({ severity: 'CRITICAL', page_size: 5 });
          res.recent_critical_alerts = criticalAlertsResp.items;
        } catch {
          // Fallback if alerts endpoint is busy
        }
      }
      setData(res);
      setLastRefreshed(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to fetch operational overview from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const getSeverityBadge = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return 'badge-critical';
      case 'HIGH':
        return 'badge-high';
      case 'MEDIUM':
        return 'badge-medium';
      case 'LOW':
        return 'badge-low';
      default:
        return 'badge-neutral';
    }
  };

  return (
    <div className="command-centre-container">
      {/* Header & Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-light">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary" style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}>
              Sentient Command Centre
            </h1>
            <span className="badge badge-safe font-mono text-[10px]">
              Live Synthetic Environment
            </span>
            <span className="badge badge-gold font-mono text-[10px] hidden sm:inline-flex">
              BCC Compliance Active
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Real-time fraud surveillance, high-risk triage, and synthetic telemetry across Rawbank DRC operations (Kinshasa & Lubumbashi hubs).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-text-muted">
            Updated: {lastRefreshed.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchOverview}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-surface hover:bg-bg-panel border border-border-medium rounded text-xs font-semibold text-text-secondary transition-colors disabled:opacity-50"
            aria-label="Refresh telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-accent-gold' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded border border-accent-red/30 bg-accent-red/10 text-accent-red text-sm flex items-start justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Backend Telemetry Unreachable</div>
              <div className="text-xs text-accent-red/80 mt-1">{error}</div>
            </div>
          </div>
          <button
            onClick={fetchOverview}
            className="text-xs underline hover:text-text-primary font-mono ml-4"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Operational KPIs: Primary Tier (4 compact cards) */}
      <div className="kpi-grid-primary">
        <MetricCard
          label="Total Alerts"
          value={data?.metrics.total_alerts ?? 0}
          icon={<ShieldAlert className="w-4 h-4" />}
          variant="gold"
          subtext="Deterministic Surveillance"
          onClick={() => onNavigateToAlerts()}
        />
        <MetricCard
          label="Critical Alerts"
          value={data?.alerts_by_severity?.CRITICAL ?? 0}
          icon={<AlertTriangle className="w-4 h-4" />}
          variant="critical"
          subtext="Requires Immediate Action"
          onClick={() => onNavigateToAlerts('CRITICAL')}
        />
        <MetricCard
          label="High Risk Alerts"
          value={data?.alerts_by_severity?.HIGH ?? 0}
          icon={<Activity className="w-4 h-4" />}
          variant="high"
          subtext="Forensic Review Queue"
          onClick={() => onNavigateToAlerts('HIGH')}
        />
        <MetricCard
          label="Total Transactions"
          value={data?.metrics.total_transactions ?? 0}
          icon={<CreditCard className="w-4 h-4" />}
          variant="default"
          subtext={`$${Math.round(data?.metrics.total_volume_usd ?? 2311184).toLocaleString()} USD Volume`}
        />
      </div>

      {/* Operational KPIs: Secondary Tier (3 compact cards) */}
      <div className="kpi-grid-secondary">
        <MetricCard
          label="Active Signals"
          value={data?.metrics.total_signals ?? 0}
          icon={<TrendingUp className="w-4 h-4" />}
          variant="gold"
          subtext="11 Deterministic Rules"
        />
        <MetricCard
          label="Customers"
          value={data?.metrics.total_customers ?? 0}
          icon={<Users className="w-4 h-4" />}
          variant="default"
          subtext="Retail & Corporate Baselines"
        />
        <MetricCard
          label="Suspicious Devices"
          value={data?.metrics.total_devices ?? 0}
          icon={<Smartphone className="w-4 h-4" />}
          variant="critical"
          subtext="Flagged Hardware (of 150 tracked)"
        />
      </div>

      {/* Main Dashboard Layout: 2-Column Grid */}
      <div className="dashboard-grid-2col">
        {/* Left Primary Column: Immediate Operational Triage Table */}
        <div className="dashboard-main-col">
          <div className="panel">
            <div className="panel-header">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-accent-red" />
                <span className="panel-title">Immediate Operational Triage</span>
                <span className="badge badge-critical text-[10px]">Priority Stream</span>
              </div>
              <button
                onClick={() => onNavigateToAlerts()}
                className="btn btn-secondary text-xs"
              >
                <span>View All ({data?.metrics.total_alerts ?? 0})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="panel-body p-0">
              {loading ? (
                <div className="state-box">
                  <RefreshCw className="w-6 h-6 animate-spin text-accent-gold mb-2" />
                  <span className="text-xs text-text-muted">Aggregating alerts from synthetic fraud engine...</span>
                </div>
              ) : data?.recent_critical_alerts && data.recent_critical_alerts.length > 0 ? (
                <div className="dense-table-wrapper">
                  <table className="dense-table">
                    <thead>
                      <tr>
                        <th style={{ width: '110px' }}>Alert ID</th>
                        <th style={{ width: '100px' }}>Severity</th>
                        <th style={{ width: '110px' }}>Risk Score</th>
                        <th>Scenario</th>
                        <th style={{ width: '110px' }}>Customer</th>
                        <th style={{ width: '120px' }}>Transaction</th>
                        <th style={{ width: '115px', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent_critical_alerts.map((alt: Alert) => (
                        <tr
                          key={alt.alert_id}
                          className="clickable"
                          onClick={() => onSelectEntity('alert', alt.alert_id)}
                        >
                          <td className="font-mono font-bold text-accent-gold">
                            {alt.alert_id}
                          </td>
                          <td>
                            <span className={`badge ${getSeverityBadge(alt.severity)}`}>
                              {alt.severity}
                            </span>
                          </td>
                          <td>
                            <span className="font-mono font-bold text-accent-gold text-sm">
                              {alt.composite_risk_score}
                            </span>
                            <span className="text-[10px] text-text-muted"> / 100</span>
                          </td>
                          <td className="text-text-secondary font-medium">
                            {alt.scenario_type.replace(/_/g, ' ')}
                          </td>
                          <td>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectEntity('customer', alt.customer_id);
                              }}
                              className="font-mono text-accent-blue hover:underline text-xs"
                            >
                              {alt.customer_id}
                            </button>
                          </td>
                          <td>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectEntity('transaction', alt.transaction_id);
                              }}
                              className="font-mono text-accent-cyan hover:underline text-xs"
                            >
                              {alt.transaction_id}
                            </button>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onInvestigateCopilot(
                                  `Why was alert ${alt.alert_id} triggered?`,
                                  'alert',
                                  alt.alert_id
                                );
                              }}
                              className="btn-investigate"
                              title="Investigate with Copilot"
                            >
                              <Sparkles className="w-3 h-3 text-accent-gold" />
                              <span>Investigate</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="state-box">
                  <span className="text-xs text-text-muted">No active critical alerts in synthetic pipeline.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Rail: Scenario Distribution & Mule Watchlist */}
        <div className="dashboard-side-col">
          {/* Alert Scenarios Distribution */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Alert Scenarios</span>
              <span className="badge badge-neutral text-[10px]">Deterministic Rules</span>
            </div>
            <div className="panel-body">
              {loading ? (
                <div className="state-box">Loading scenarios...</div>
              ) : data?.alerts_by_scenario ? (
                <div className="scenario-list">
                  {Object.entries(data.alerts_by_scenario).map(([scenario, count]) => {
                    const total = data.metrics.total_alerts || 1;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={scenario} className="scenario-item">
                        <div className="scenario-meta">
                          <span className="scenario-name">
                            {scenario.replace(/_/g, ' ')}
                          </span>
                          <span className="scenario-count">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="scenario-track">
                          <div
                            className="scenario-bar"
                            style={{ width: `${Math.max(pct, 4)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="state-box">No scenario telemetry available.</div>
              )}
            </div>
          </div>

          {/* Mule Funnel Watchlist */}
          <div className="panel">
            <div className="panel-header">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-accent-gold" />
                <span className="panel-title">Mule Funnel Watchlist</span>
              </div>
              <span className="badge badge-critical text-[10px]">AML Surveillance</span>
            </div>
            <div className="panel-body">
              <p className="text-[11px] text-text-muted mb-3">
                Destination entities aggregating velocity from multiple unique sending accounts.
              </p>

              {loading ? (
                <div className="state-box">Loading mule targets...</div>
              ) : data?.top_mule_beneficiaries && data.top_mule_beneficiaries.length > 0 ? (
                <div className="mule-list">
                  {data.top_mule_beneficiaries.map((mule) => (
                    <div
                      key={mule.beneficiary_id}
                      onClick={() => onSelectEntity('beneficiary', mule.beneficiary_id)}
                      className="mule-card"
                    >
                      <div className="mule-info">
                        <div className="mule-name">
                          <span>{mule.beneficiary_name}</span>
                          <ExternalLink className="w-3 h-3 text-text-muted" />
                        </div>
                        <div className="mule-meta">
                          <span className="font-mono text-text-mono">{mule.beneficiary_id}</span>
                          <span>•</span>
                          <span>{mule.routing_channel}</span>
                        </div>
                      </div>
                      <div className="mule-stats">
                        <span className="badge badge-critical font-mono text-[10px]">
                          {mule.unique_senders} Senders
                        </span>
                        <div className="mule-amount">
                          ${mule.aggregated_volume_usd?.toLocaleString() || 0} USD
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="state-box">No mule accounts detected.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
