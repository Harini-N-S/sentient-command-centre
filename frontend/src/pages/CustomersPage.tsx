import React, { useEffect, useState } from 'react';
import {
  Users,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../services/api';
import { Customer, PaginatedResponse } from '../types';

export const SEGMENT_API_MAP: Record<string, string> = {
  RETAIL: 'Retail',
  'Retail Individual': 'Retail',
  Retail: 'Retail',
  SME: 'SME',
  'SME Commercial': 'SME',
  CORPORATE: 'Corporate',
  'Large Corporate': 'Corporate',
  Corporate: 'Corporate',
  VIP: 'HNWI',
  'Private Banking VIP': 'HNWI',
  HNWI: 'HNWI',
  AGENCY_BANKING: 'AgencyBankingOperator',
  'Agency Banking': 'AgencyBankingOperator',
  AgencyBankingOperator: 'AgencyBankingOperator',
};

export const KYC_API_MAP: Record<string, string> = {
  FULL: 'Tier_3_Full',
  'FULL Verification': 'Tier_3_Full',
  Tier_3_Full: 'Tier_3_Full',
  PARTIAL: 'Tier_2_Standard',
  'PARTIAL Verification': 'Tier_2_Standard',
  Tier_2_Standard: 'Tier_2_Standard',
  PENDING: 'Tier_1_Basic',
  'PENDING Verification': 'Tier_1_Basic',
  Tier_1_Basic: 'Tier_1_Basic',
};

export const RISK_API_MAP: Record<string, string> = {
  HIGH: 'High',
  'HIGH Risk Tier': 'High',
  High: 'High',
  MEDIUM: 'Medium',
  'MEDIUM Risk Tier': 'Medium',
  Medium: 'Medium',
  LOW: 'Low',
  'LOW Risk Tier': 'Low',
  Low: 'Low',
};

interface CustomersPageProps {
  onSelectEntity: (type: string, id: string) => void;
  onInvestigateCopilot: (question: string, entityType?: string, entityId?: string) => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({
  onSelectEntity,
  onInvestigateCopilot,
}) => {
  const [data, setData] = useState<PaginatedResponse<Customer> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [segmentFilter, setSegmentFilter] = useState('');
  const [kycFilter, setKycFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getCustomers({
        page,
        page_size: pageSize,
        segment: segmentFilter ? SEGMENT_API_MAP[segmentFilter] || segmentFilter : undefined,
        kyc_status: kycFilter ? KYC_API_MAP[kycFilter] || kycFilter : undefined,
        risk_category: riskFilter ? RISK_API_MAP[riskFilter] || riskFilter : undefined,
        city: cityFilter?.trim() || undefined,
      });
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve customers from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, segmentFilter, kycFilter, riskFilter, cityFilter]);

  const handleReset = () => {
    setSegmentFilter('');
    setKycFilter('');
    setRiskFilter('');
    setCityFilter('');
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-light">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary" style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}>
              Customer Risk Surveillance
            </h1>
            <span className="badge badge-neutral uppercase font-mono text-[10px]">
              KYC & Segment Profiles
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Enterprise customer risk directory, KYC onboarding statuses, and behavioral baselines.
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-surface hover:bg-bg-panel border border-border-medium rounded text-xs font-semibold text-text-secondary transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-accent-gold' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
            <Filter className="w-3.5 h-3.5 text-accent-gold" />
            <span>Customer Demographics & Risk Filters</span>
          </div>
          <button
            onClick={handleReset}
            className="text-[11px] text-text-muted hover:text-accent-gold transition-colors font-mono"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] uppercase font-mono text-text-muted mb-1">
              Segment
            </label>
            <select
              value={segmentFilter}
              onChange={(e) => {
                setSegmentFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-bg-surface border border-border-medium rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-gold"
            >
              <option value="">All Segments</option>
              <option value="RETAIL">Retail Individual</option>
              <option value="SME">SME Commercial</option>
              <option value="CORPORATE">Large Corporate</option>
              <option value="VIP">Private Banking VIP</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono text-text-muted mb-1">
              KYC Status
            </label>
            <select
              value={kycFilter}
              onChange={(e) => {
                setKycFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-bg-surface border border-border-medium rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-gold"
            >
              <option value="">All KYC Statuses</option>
              <option value="FULL">FULL Verification</option>
              <option value="PARTIAL">PARTIAL Verification</option>
              <option value="PENDING">PENDING Verification</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono text-text-muted mb-1">
              Risk Category
            </label>
            <select
              value={riskFilter}
              onChange={(e) => {
                setRiskFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-bg-surface border border-border-medium rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-gold"
            >
              <option value="">All Risk Tiers</option>
              <option value="HIGH">HIGH Risk Tier</option>
              <option value="MEDIUM">MEDIUM Risk Tier</option>
              <option value="LOW">LOW Risk Tier</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono text-text-muted mb-1">
              Registered City
            </label>
            <input
              type="text"
              placeholder="e.g. Lubumbashi"
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-bg-surface border border-border-medium rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-gold"
            />
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded border border-accent-red/30 bg-accent-red/10 text-accent-red text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Unable to Load Customer Directory</div>
            <div className="text-xs text-accent-red/80 mt-1">{error}</div>
          </div>
        </div>
      )}

      {/* Customers Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-text-muted text-xs">
            <RefreshCw className="w-7 h-7 animate-spin text-accent-gold mx-auto mb-2" />
            Querying customer profiles from backend...
          </div>
        ) : data?.items && data.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-light bg-bg-panel/50 text-text-muted uppercase tracking-wider font-mono">
                  <th className="py-3 px-4">Customer ID</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Segment</th>
                  <th className="py-3 px-4">KYC Status</th>
                  <th className="py-3 px-4">Risk Category</th>
                  <th className="py-3 px-4">Registered City</th>
                  <th className="py-3 px-4">Onboarding Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {data.items.map((cus) => (
                  <tr
                    key={cus.customer_id}
                    onClick={() => onSelectEntity('customer', cus.customer_id)}
                    className="hover:bg-bg-panel/70 transition-colors group cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-accent-blue">
                      {cus.customer_id}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-text-primary">
                      {cus.full_name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-text-secondary">
                      {cus.customer_segment}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`badge ${
                          cus.kyc_status === 'FULL' || cus.kyc_status === 'Tier_3_Full'
                            ? 'badge-safe'
                            : cus.kyc_status === 'PARTIAL' || cus.kyc_status === 'Tier_2_Standard'
                            ? 'badge-medium'
                            : 'badge-neutral'
                        }`}
                      >
                        {cus.kyc_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`badge ${
                          cus.risk_category?.toUpperCase() === 'HIGH'
                            ? 'badge-critical'
                            : cus.risk_category?.toUpperCase() === 'MEDIUM'
                            ? 'badge-medium'
                            : 'badge-low'
                        }`}
                      >
                        {cus.risk_category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-text-secondary">
                      {cus.registered_city}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-text-muted">
                      {cus.registration_date || cus.created_at}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`badge ${
                          cus.is_active !== false ? 'badge-safe' : 'badge-neutral'
                        }`}
                      >
                        {cus.is_active !== false ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onInvestigateCopilot(
                            `Investigate customer ${cus.customer_id}`,
                            'customer',
                            cus.customer_id
                          );
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent-gold/10 hover:bg-accent-gold/20 border border-accent-gold/30 text-accent-gold rounded text-[11px] font-semibold transition-colors"
                        title="Investigate in Copilot"
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
            No customer profiles match criteria.
          </div>
        )}

        {/* Pagination Footer */}
        {data && data.pagination && (
          <div className="px-4 py-3 border-t border-border-light bg-bg-panel/40 flex items-center justify-between text-xs text-text-muted">
            <div>
              Showing Page <span className="font-mono font-bold text-text-primary">{data.pagination.page}</span> of{' '}
              <span className="font-mono font-bold text-text-primary">{data.pagination.total_pages}</span> (Total:{' '}
              <span className="font-mono font-bold text-text-primary">{data.pagination.total}</span> customers)
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
