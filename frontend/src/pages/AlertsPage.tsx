import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../services/api';
import { Alert, PaginatedResponse, SeverityLevel } from '../types';

interface AlertsPageProps {
  initialSeverity?: string;
  onSelectEntity: (type: string, id: string) => void;
  onInvestigateCopilot: (question: string, entityType?: string, entityId?: string) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  initialSeverity,
  onSelectEntity,
  onInvestigateCopilot,
}) => {
  const [data, setData] = useState<PaginatedResponse<Alert> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [severityFilter, setSeverityFilter] = useState<string>(initialSeverity || '');
  const [scenarioFilter, setScenarioFilter] = useState<string>('');
  const [customerFilter, setCustomerFilter] = useState<string>('');
  const [ruleCodeFilter, setRuleCodeFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('composite_risk_score');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [page, setPage] = useState<number>(1);
  const pageSize = 15;

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAlerts({
        page,
        page_size: pageSize,
        severity: severityFilter || undefined,
        rule_code: ruleCodeFilter || undefined,
        customer_id: customerFilter || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve alerts from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [page, severityFilter, scenarioFilter, customerFilter, ruleCodeFilter, sortBy, sortOrder]);

  const handleResetFilters = () => {
    setSeverityFilter('');
    setScenarioFilter('');
    setCustomerFilter('');
    setRuleCodeFilter('');
    setSortBy('composite_risk_score');
    setSortOrder('desc');
    setPage(1);
  };

  const getSeverityBadge = (severity: SeverityLevel) => {
    switch (severity) {
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-light">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary" style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}>
              Fraud Alerts Triage
            </h1>
            <span className="badge badge-neutral uppercase font-mono text-[10px]">
              Deterministic Engine
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Prioritised alerts generated from deterministic ruleset and composite scoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAlerts}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-surface hover:bg-bg-panel border border-border-medium rounded text-xs font-semibold text-text-secondary transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-accent-gold' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
            <Filter className="w-3.5 h-3.5 text-accent-gold" />
            <span>Triage Filters & Ordering</span>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-[11px] text-text-muted hover:text-accent-gold transition-colors font-mono"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Severity Filter */}
          <div>
            <label className="block text-[10px] uppercase font-mono text-text-muted mb-1">
              Severity
            </label>
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-bg-surface border border-border-medium rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-gold"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          {/* Customer Filter */}
          <div>
            <label className="block text-[10px] uppercase font-mono text-text-muted mb-1">
              Customer ID
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. CUS-00014"
                value={customerFilter}
                onChange={(e) => {
                  setCustomerFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-bg-surface border border-border-medium rounded px-2.5 py-1.5 text-xs font-mono text-text-primary focus:outline-none focus:border-accent-gold"
              />
            </div>
          </div>

          {/* Rule Code Filter */}
          <div>
            <label className="block text-[10px] uppercase font-mono text-text-muted mb-1">
              Rule Code
            </label>
            <input
              type="text"
              placeholder="e.g. VELOCITY_BURST"
              value={ruleCodeFilter}
              onChange={(e) => {
                setRuleCodeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-bg-surface border border-border-medium rounded px-2.5 py-1.5 text-xs font-mono text-text-primary focus:outline-none focus:border-accent-gold"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] uppercase font-mono text-text-muted mb-1">
              Sort Field
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-bg-surface border border-border-medium rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-gold"
            >
              <option value="composite_risk_score">Composite Risk Score</option>
              <option value="created_at">Alert Timestamp</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-[10px] uppercase font-mono text-text-muted mb-1">
              Sort Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full bg-bg-surface border border-border-medium rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-gold"
            >
              <option value="desc">Descending (Highest / Newest)</option>
              <option value="asc">Ascending (Lowest / Oldest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded border border-accent-red/30 bg-accent-red/10 text-accent-red text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Unable to Load Alerts</div>
            <div className="text-xs text-accent-red/80 mt-1">{error}</div>
          </div>
        </div>
      )}

      {/* Alerts Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-text-muted text-xs">
            <RefreshCw className="w-7 h-7 animate-spin text-accent-gold mx-auto mb-2" />
            Querying alerts catalog from backend database...
          </div>
        ) : data?.items && data.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-light bg-bg-panel/50 text-text-muted uppercase tracking-wider font-mono">
                  <th className="py-3 px-4">Alert ID</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Scenario</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Transaction</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Investigation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {data.items.map((alt) => (
                  <tr
                    key={alt.alert_id}
                    onClick={() => onSelectEntity('alert', alt.alert_id)}
                    className="hover:bg-bg-panel/70 transition-colors group cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-text-primary">
                      {alt.alert_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={getSeverityBadge(alt.severity)}>
                        {alt.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-accent-gold">
                        {alt.composite_risk_score}
                      </span>
                      <span className="text-[10px] text-text-muted"> / 100</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-text-primary">
                        {alt.scenario_type.replace(/_/g, ' ')}
                      </div>
                      <div className="text-[11px] text-text-muted truncate max-w-xs">
                        {alt.reason_summary}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEntity('customer', alt.customer_id);
                        }}
                        className="font-mono text-accent-blue hover:underline flex items-center gap-1"
                      >
                        {alt.customer_id}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEntity('transaction', alt.transaction_id);
                        }}
                        className="font-mono text-accent-cyan hover:underline flex items-center gap-1"
                      >
                        {alt.transaction_id}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="badge badge-neutral text-[10px] font-mono">
                        {alt.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-text-secondary font-mono text-[11px]">
                      {new Date(alt.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onInvestigateCopilot(
                            `Why was alert ${alt.alert_id} triggered?`,
                            'alert',
                            alt.alert_id
                          );
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent-gold/10 hover:bg-accent-gold/20 border border-accent-gold/30 text-accent-gold rounded text-[11px] font-semibold transition-colors"
                        title="Investigate with Copilot"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Investigate</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-text-muted text-xs">
            No alerts match current filter criteria.
          </div>
        )}

        {/* Pagination Footer */}
        {data && data.pagination && (
          <div className="px-4 py-3 border-t border-border-light bg-bg-panel/40 flex items-center justify-between text-xs text-text-muted">
            <div>
              Showing Page <span className="font-mono font-bold text-text-primary">{data.pagination.page}</span> of{' '}
              <span className="font-mono font-bold text-text-primary">{data.pagination.total_pages}</span> (Total:{' '}
              <span className="font-mono font-bold text-text-primary">{data.pagination.total}</span> alerts)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={!data.pagination.has_prev}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 border border-border-medium rounded hover:bg-bg-surface disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={!data.pagination.has_next}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 border border-border-medium rounded hover:bg-bg-surface disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
