import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../services/api';
import { Transaction, PaginatedResponse } from '../types';

export const CHANNEL_API_MAP: Record<string, string> = {
  MOBILE_APP: 'IllicoCash_App',
  ONLINE_BANKING: 'RawbankOnline_Web',
  AGENCY_BANKING: 'Agency_Express_POS',
  ATM: 'ATM_Cardless',
  BRANCH: 'Branch',
  IllicoCash_App: 'IllicoCash_App',
  RawbankOnline_Web: 'RawbankOnline_Web',
  Agency_Express_POS: 'Agency_Express_POS',
  ATM_Cardless: 'ATM_Cardless',
  'Mobile Banking App': 'IllicoCash_App',
  'Web Portal': 'RawbankOnline_Web',
  'Online Banking': 'RawbankOnline_Web',
  'Agency Banking': 'Agency_Express_POS',
  'ATM Terminal': 'ATM_Cardless',
  'ATM / Cardless': 'ATM_Cardless',
};

interface TransactionsPageProps {
  onSelectEntity: (type: string, id: string) => void;
  onInvestigateCopilot: (question: string, entityType?: string, entityId?: string) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  onSelectEntity,
  onInvestigateCopilot,
}) => {
  const [data, setData] = useState<PaginatedResponse<Transaction> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [channelFilter, setChannelFilter] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [beneficiaryFilter, setBeneficiaryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const mappedChannel = channelFilter ? (CHANNEL_API_MAP[channelFilter] || channelFilter) : undefined;
      const cleanCurrency =
        currencyFilter &&
        currencyFilter !== 'CDF & USD' &&
        currencyFilter !== 'ALL' &&
        currencyFilter !== 'CDF/USD'
          ? currencyFilter
          : undefined;

      const res = await api.getTransactions({
        page,
        page_size: pageSize,
        channel: mappedChannel,
        currency: cleanCurrency,
        customer_id: customerFilter.trim() || undefined,
        beneficiary_id: beneficiaryFilter.trim() || undefined,
        location_city: cityFilter.trim() || undefined,
        sort_by: 'timestamp',
        sort_order: 'desc',
      });
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, channelFilter, currencyFilter, customerFilter, beneficiaryFilter, cityFilter]);

  const handleReset = () => {
    setChannelFilter('');
    setCurrencyFilter('');
    setCustomerFilter('');
    setBeneficiaryFilter('');
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
              Synthetic Transaction Ledger
            </h1>
            <span className="badge badge-neutral uppercase font-mono text-[10px]">
              Multi-Currency Core
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Real-time transaction stream across CDF/USD retail, corporate, and mobile money rails.
          </p>
        </div>

        <button
          onClick={fetchTransactions}
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
            <span>Transaction Query Filters</span>
          </div>
          <button
            onClick={handleReset}
            className="text-[11px] text-text-muted hover:text-accent-gold transition-colors font-mono"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-[10px] uppercase font-mono text-text-muted mb-1">
              Channel
            </label>
            <select
              value={channelFilter}
              onChange={(e) => {
                setChannelFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-bg-surface border border-border-medium rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-gold"
            >
              <option value="">All Channels</option>
              <option value="MOBILE_APP">Mobile Banking App</option>
              <option value="ONLINE_BANKING">Web Portal</option>
              <option value="AGENCY_BANKING">Agency Banking</option>
              <option value="ATM">ATM Terminal</option>
              <option value="BRANCH">Branch Counter</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono text-text-muted mb-1">
              Currency
            </label>
            <select
              value={currencyFilter}
              onChange={(e) => {
                setCurrencyFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-bg-surface border border-border-medium rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-gold"
            >
              <option value="">CDF & USD</option>
              <option value="USD">USD (US Dollar)</option>
              <option value="CDF">CDF (Franc Congolais)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono text-text-muted mb-1">
              Customer ID
            </label>
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

          <div>
            <label className="block text-[10px] uppercase font-mono text-text-muted mb-1">
              Beneficiary ID
            </label>
            <input
              type="text"
              placeholder="e.g. BEN-00088"
              value={beneficiaryFilter}
              onChange={(e) => {
                setBeneficiaryFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-bg-surface border border-border-medium rounded px-2.5 py-1.5 text-xs font-mono text-text-primary focus:outline-none focus:border-accent-gold"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono text-text-muted mb-1">
              Location City
            </label>
            <input
              type="text"
              placeholder="e.g. Kinshasa"
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
            <div className="font-semibold">Unable to Load Transactions</div>
            <div className="text-xs text-accent-red/80 mt-1">{error}</div>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-text-muted text-xs">
            <RefreshCw className="w-7 h-7 animate-spin text-accent-gold mx-auto mb-2" />
            Querying synthetic ledger records...
          </div>
        ) : data?.items && data.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-light bg-bg-panel/50 text-text-muted uppercase tracking-wider font-mono">
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Beneficiary</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">USD Equivalent</th>
                  <th className="py-3 px-4">Channel / City</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {data.items.map((txn) => (
                  <tr
                    key={txn.transaction_id}
                    onClick={() => onSelectEntity('transaction', txn.transaction_id)}
                    className="hover:bg-bg-panel/70 transition-colors group cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-accent-cyan">
                      {txn.transaction_id}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-text-secondary">
                      {new Date(txn.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEntity('customer', txn.customer_id);
                        }}
                        className="font-mono text-accent-blue hover:underline flex items-center gap-1"
                      >
                        {txn.customer_id}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEntity('beneficiary', txn.beneficiary_id);
                        }}
                        className="font-mono text-accent-gold hover:underline flex items-center gap-1"
                      >
                        {txn.beneficiary_id}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-text-primary">
                      {txn.currency}{' '}
                      {txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-text-muted">
                      ${txn.amount_usd_equivalent.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono uppercase text-[11px] text-text-primary">
                        {txn.channel}
                      </div>
                      <div className="text-[10px] text-text-muted">{txn.location_city}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`badge ${
                          txn.status === 'COMPLETED'
                            ? 'badge-safe'
                            : txn.status === 'FLAGGED'
                            ? 'badge-critical'
                            : 'badge-neutral'
                        }`}
                      >
                        {txn.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onInvestigateCopilot(
                            `Why is transaction ${txn.transaction_id} suspicious?`,
                            'transaction',
                            txn.transaction_id
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
            No transactions match query parameters.
          </div>
        )}

        {/* Pagination Footer */}
        {data && data.pagination && (
          <div className="px-4 py-3 border-t border-border-light bg-bg-panel/40 flex items-center justify-between text-xs text-text-muted">
            <div>
              Showing Page <span className="font-mono font-bold text-text-primary">{data.pagination.page}</span> of{' '}
              <span className="font-mono font-bold text-text-primary">{data.pagination.total_pages}</span> (Total:{' '}
              <span className="font-mono font-bold text-text-primary">{data.pagination.total}</span> records)
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
