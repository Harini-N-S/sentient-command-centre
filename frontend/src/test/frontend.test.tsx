import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../App';
import { CommandCentrePage } from '../pages/CommandCentrePage';
import { AlertsPage } from '../pages/AlertsPage';
import { TransactionsPage } from '../pages/TransactionsPage';
import { CustomersPage } from '../pages/CustomersPage';
import { EntityDrawer } from '../components/EntityDrawer';
import { GlobalSearchModal } from '../components/GlobalSearchModal';
import { RelationshipTree } from '../components/RelationshipTree';
import { EvidenceDossier } from '../components/EvidenceDossier';
import { api } from '../services/api';
import {
  OverviewResponse,
  PaginatedResponse,
  Alert,
  Transaction,
  Customer,
  StandardEvidencePacket,
  SearchResponse,
  RelationshipResponse,
} from '../types';

// Mock API service
vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/api')>();
  return {
    ...actual,
    api: {
      getOverview: vi.fn(),
      getHealth: vi.fn(),
      getAlerts: vi.fn(),
      getAlert: vi.fn(),
      getAlertEvidence: vi.fn(),
      getTransactions: vi.fn(),
      getTransaction: vi.fn(),
      getTransactionEvidence: vi.fn(),
      getCustomers: vi.fn(),
      getCustomer: vi.fn(),
      getCustomerEvidence: vi.fn(),
      getDevice: vi.fn(),
      getBeneficiary: vi.fn(),
      getEntityRelationships: vi.fn(),
      search: vi.fn(),
    },
  };
});

// Synthetic Test Fixtures
const mockOverview: OverviewResponse = {
  service: 'Rawbank Sentient Fraud Engine',
  environment: 'synthetic-drc-retail',
  metrics: {
    total_customers: 250,
    total_accounts: 300,
    total_transactions: 1200,
    total_devices: 280,
    total_beneficiaries: 180,
    total_alerts: 42,
    total_signals: 95,
    total_volume_usd: 1540000,
  },
  alerts_by_severity: {
    CRITICAL: 12,
    HIGH: 18,
    MEDIUM: 10,
    LOW: 2,
  },
  alerts_by_scenario: {
    ACCOUNT_TAKEOVER: 15,
    MULE_AGGREGATION: 12,
    VELOCITY_BURST: 10,
    STRUCTURING_SMURFING: 5,
  },
  top_mule_beneficiaries: [
    {
      beneficiary_id: 'BEN-00088',
      beneficiary_name: 'Alpha Telecom Agency SARL',
      routing_channel: 'AIRTEL_MONEY',
      unique_senders: 9,
      aggregated_volume_usd: 48500,
    },
  ],
  recent_critical_alerts: [
    {
      alert_id: 'ALT-00001',
      transaction_id: 'TXN-00801',
      customer_id: 'CUS-00014',
      account_id: 'ACC-00014',
      severity: 'CRITICAL',
      composite_risk_score: 94,
      scenario_type: 'ACCOUNT_TAKEOVER',
      status: 'NEW',
      reason_summary: 'Critical ATO detected: new device login followed by high value transfer.',
      created_at: '2026-09-28T10:00:00Z',
    },
  ],
  timestamp: '2026-09-28T10:05:00Z',
};

const mockAlertsPage: PaginatedResponse<Alert> = {
  items: [
    {
      alert_id: 'ALT-00001',
      transaction_id: 'TXN-00801',
      customer_id: 'CUS-00014',
      account_id: 'ACC-00014',
      severity: 'CRITICAL',
      composite_risk_score: 94,
      scenario_type: 'ACCOUNT_TAKEOVER',
      status: 'NEW',
      reason_summary: 'Critical ATO detected: new device login followed by high value transfer.',
      created_at: '2026-09-28T10:00:00Z',
    },
    {
      alert_id: 'ALT-00002',
      transaction_id: 'TXN-00802',
      customer_id: 'CUS-00020',
      account_id: 'ACC-00020',
      severity: 'HIGH',
      composite_risk_score: 78,
      scenario_type: 'VELOCITY_BURST',
      status: 'IN_REVIEW',
      reason_summary: 'Multiple transactions exceeding hourly baseline.',
      created_at: '2026-09-28T10:02:00Z',
    },
  ],
  pagination: {
    page: 1,
    page_size: 15,
    total: 2,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  },
};

const mockTransactionsPage: PaginatedResponse<Transaction> = {
  items: [
    {
      transaction_id: 'TXN-00801',
      customer_id: 'CUS-00014',
      account_id: 'ACC-00014',
      beneficiary_id: 'BEN-00088',
      device_id: 'DEV-00125',
      amount: 4800,
      currency: 'USD',
      amount_usd_equivalent: 4800,
      channel: 'MOBILE_APP',
      transaction_type: 'TRANSFER',
      location_city: 'Kinshasa',
      status: 'FLAGGED',
      timestamp: '2026-09-28T09:59:00Z',
    },
  ],
  pagination: {
    page: 1,
    page_size: 15,
    total: 1,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  },
};

const mockCustomersPage: PaginatedResponse<Customer> = {
  items: [
    {
      customer_id: 'CUS-00014',
      full_name: 'Christelle Mutombo',
      customer_segment: 'RETAIL',
      kyc_status: 'FULL',
      risk_category: 'HIGH',
      registered_city: 'Kinshasa',
      registration_date: '2023-04-12',
      is_active: true,
    },
  ],
  pagination: {
    page: 1,
    page_size: 15,
    total: 1,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  },
};

const mockEvidencePacket: StandardEvidencePacket = {
  query: 'ALT-00001',
  generated_at: '2026-09-28T10:05:00Z',
  target_entity: { alert_id: 'ALT-00001' },
  exact_data: [
    {
      type: 'EXACT_DATA',
      source_table: 'transactions',
      source_id: 'TXN-00801',
      field: 'amount',
      value: 4800,
      description: 'Transaction amount $4,800 USD via MOBILE_APP',
      timestamp: '2026-09-28T09:59:00Z',
    },
  ],
  calculated_information: [
    {
      type: 'CALCULATED',
      source_table: 'signals',
      source_id: 'SIG-00101',
      field: 'velocity_multiplier',
      value: '4.8x',
      description: 'Transaction is 4.8x customer historical daily baseline',
    },
  ],
  retrieved_evidence: [
    {
      type: 'RETRIEVED_EVIDENCE',
      source_table: 'auth_logs',
      source_id: 'AUTH-00389',
      field: 'device_state',
      value: 'UNTRUSTED_NEW',
      description: 'First login recorded on unrecognised Android device in Lubumbashi',
    },
  ],
  counter_evidence: [
    {
      type: 'COUNTER_EVIDENCE',
      source_table: 'customers',
      source_id: 'CUS-00014',
      field: 'kyc_status',
      value: 'FULL',
      description: 'Customer is FULL KYC verified with 3+ years clean tenure',
    },
  ],
  relationships: [],
  evidence_gaps: [
    {
      gap_type: 'DEVICE_GEOLOCATION_UNAVAILABLE',
      description: 'Cell tower telemetry coordinates missing for mobile session',
      impact: 'Physical location of device cannot be confirmed',
    },
  ],
  source_references: [
    { id: 'TXN-00801', source_id: 'TXN-00801', table: 'transactions', description: 'Transaction' },
    { id: 'AUTH-00389', source_id: 'AUTH-00389', table: 'auth_logs', description: 'Auth event' },
  ],
};

const mockSearchResponse: SearchResponse = {
  query: 'CUS-00014',
  total_matches: 1,
  results: [
    {
      entity_type: 'customer',
      entity_id: 'CUS-00014',
      title: 'Christelle Mutombo',
      subtitle: 'Customer • Retail • Kinshasa',
      relevance: 1.0,
    },
  ],
};

const mockRelationships: RelationshipResponse = {
  target_entity_type: 'customer',
  target_entity_id: 'CUS-00014',
  max_depth: 2,
  total_connections: 3,
  relationships: [
    {
      entity_type: 'account',
      entity_id: 'ACC-00014',
      relationship: 'OWNS',
      hop_depth: 1,
    },
    {
      entity_type: 'device',
      entity_id: 'DEV-00125',
      relationship: 'AUTHENTICATED_ON',
      hop_depth: 1,
    },
    {
      entity_type: 'transaction',
      entity_id: 'TXN-00801',
      relationship: 'INITIATED',
      hop_depth: 2,
    },
  ],
};

describe('Rawbank Sentient Fraud Intelligence Platform - Phase 7 Frontend Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Command Centre Renders
  it('1. Command Centre renders with proper title and operational context', async () => {
    vi.mocked(api.getOverview).mockResolvedValueOnce(mockOverview);
    render(
      <CommandCentrePage
        onSelectEntity={vi.fn()}
        onNavigateToAlerts={vi.fn()}
        onInvestigateCopilot={vi.fn()}
      />
    );

    expect(screen.getByText('Sentient Command Centre')).toBeInTheDocument();
    expect(screen.getByText(/Live Synthetic Environment/i)).toBeInTheDocument();
  });

  // 2. Overview Data Loads
  it('2. Overview data loads and populates KPIs, live critical alerts, and mule funnels', async () => {
    vi.mocked(api.getOverview).mockResolvedValueOnce(mockOverview);
    render(
      <CommandCentrePage
        onSelectEntity={vi.fn()}
        onNavigateToAlerts={vi.fn()}
        onInvestigateCopilot={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Total Alerts')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument(); // Critical Alerts
      expect(screen.getByText('ALT-00001')).toBeInTheDocument();
      expect(screen.getByText('Alpha Telecom Agency SARL')).toBeInTheDocument();
    });
  });

  // 3. Alerts Load
  it('3. Alerts load in the Alerts Workspace', async () => {
    vi.mocked(api.getAlerts).mockResolvedValueOnce(mockAlertsPage);
    render(
      <AlertsPage
        onSelectEntity={vi.fn()}
        onInvestigateCopilot={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Fraud Alerts Triage')).toBeInTheDocument();
      expect(screen.getByText('ALT-00001')).toBeInTheDocument();
      expect(screen.getByText('ALT-00002')).toBeInTheDocument();
      expect(screen.getByText('94')).toBeInTheDocument();
    });
  });

  // 4. Alert Filtering Works
  it('4. Alert filtering updates query parameters to backend', async () => {
    vi.mocked(api.getAlerts).mockResolvedValue(mockAlertsPage);
    render(
      <AlertsPage
        onSelectEntity={vi.fn()}
        onInvestigateCopilot={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('ALT-00001')).toBeInTheDocument();
    });

    const severitySelect = screen.getByDisplayValue('All Severities');
    fireEvent.change(severitySelect, { target: { value: 'CRITICAL' } });

    await waitFor(() => {
      expect(api.getAlerts).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'CRITICAL',
        })
      );
    });
  });

  // 5. Alert Detail Loads
  it('5. Alert detail loads in the Entity Drawer with core fields', async () => {
    vi.mocked(api.getAlert).mockResolvedValueOnce(mockAlertsPage.items[0]);
    render(
      <EntityDrawer
        isOpen={true}
        onClose={vi.fn()}
        entityType="alert"
        entityId="ALT-00001"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('ALT-00001')).toBeInTheDocument();
      expect(screen.getByText('Deterministic Severity')).toBeInTheDocument();
      expect(screen.getByText('Composite Risk Score')).toBeInTheDocument();
      expect(screen.getByText('ACCOUNT TAKEOVER')).toBeInTheDocument();
    });
  });

  // 6. Customer Detail Loads
  it('6. Customer detail loads in the Entity Drawer', async () => {
    vi.mocked(api.getCustomer).mockResolvedValueOnce(mockCustomersPage.items[0]);
    render(
      <EntityDrawer
        isOpen={true}
        onClose={vi.fn()}
        entityType="customer"
        entityId="CUS-00014"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Christelle Mutombo')).toBeInTheDocument();
      expect(screen.getByText('RETAIL')).toBeInTheDocument();
      expect(screen.getByText('FULL')).toBeInTheDocument();
    });
  });

  // 7. Transaction Detail Loads
  it('7. Transaction detail loads in the Entity Drawer', async () => {
    vi.mocked(api.getTransaction).mockResolvedValueOnce(mockTransactionsPage.items[0]);
    render(
      <EntityDrawer
        isOpen={true}
        onClose={vi.fn()}
        entityType="transaction"
        entityId="TXN-00801"
      />
    );

    await waitFor(() => {
      expect(screen.getAllByText('TXN-00801')[0]).toBeInTheDocument();
      expect(screen.getAllByText(/4,800/)[0]).toBeInTheDocument();
      expect(screen.getByText(/MOBILE_APP/i)).toBeInTheDocument();
    });
  });

  // 8. Search Works
  it('8. Global search queries backend and renders matching entities', async () => {
    vi.mocked(api.search).mockResolvedValueOnce(mockSearchResponse);
    render(
      <GlobalSearchModal
        isOpen={true}
        onClose={vi.fn()}
        onSelectEntity={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(/Search by ID/i);
    fireEvent.change(input, { target: { value: 'CUS-00014' } });

    await waitFor(() => {
      expect(api.search).toHaveBeenCalledWith('CUS-00014', expect.any(Number));
      expect(screen.getByText('Christelle Mutombo')).toBeInTheDocument();
    });
  });

  // 9. Relationship View Renders
  it('9. Relationship network renders bounded multi-hop connections', async () => {
    vi.mocked(api.getEntityRelationships).mockResolvedValueOnce(mockRelationships);
    render(
      <RelationshipTree
        entityType="customer"
        entityId="CUS-00014"
        onSelectEntity={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('ACC-00014')).toBeInTheDocument();
      expect(screen.getByText('DEV-00125')).toBeInTheDocument();
      expect(screen.getByText('TXN-00801')).toBeInTheDocument();
    });
  });

  // 17. API Error State Renders
  it('17. API error state renders gracefully with user-friendly message', async () => {
    vi.mocked(api.getOverview).mockRejectedValueOnce(
      new Error('Backend connection refused at port 8000')
    );
    render(
      <CommandCentrePage
        onSelectEntity={vi.fn()}
        onNavigateToAlerts={vi.fn()}
        onInvestigateCopilot={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Backend Telemetry Unreachable')).toBeInTheDocument();
      expect(
        screen.getByText('Backend connection refused at port 8000')
      ).toBeInTheDocument();
    });
  });

  // 18. Loading States Render
  it('18. Loading spinners and text render during asynchronous requests', () => {
    // Return pending promise
    vi.mocked(api.getAlerts).mockReturnValueOnce(new Promise(() => {}));
    render(
      <AlertsPage
        onSelectEntity={vi.fn()}
        onInvestigateCopilot={vi.fn()}
      />
    );

    expect(
      screen.getByText(/Querying alerts catalog from backend database/i)
    ).toBeInTheDocument();
  });

  // 19. Synthetic Transaction Ledger Channel Filter
  it('19. TransactionsPage channel filter maps human-readable options to database values', async () => {
    vi.mocked(api.getTransactions).mockResolvedValue(mockTransactionsPage);
    render(
      <TransactionsPage
        onSelectEntity={vi.fn()}
        onInvestigateCopilot={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('TXN-00801')).toBeInTheDocument();
    });

    const channelSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(channelSelect, { target: { value: 'MOBILE_APP' } });

    await waitFor(() => {
      expect(api.getTransactions).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: 'IllicoCash_App',
        })
      );
    });

    // Selecting Web Portal should map to RawbankOnline_Web
    fireEvent.change(channelSelect, { target: { value: 'ONLINE_BANKING' } });

    await waitFor(() => {
      expect(api.getTransactions).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: 'RawbankOnline_Web',
        })
      );
    });

    // Selecting Agency Banking should map to Agency_Express_POS
    fireEvent.change(channelSelect, { target: { value: 'AGENCY_BANKING' } });

    await waitFor(() => {
      expect(api.getTransactions).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: 'Agency_Express_POS',
        })
      );
    });

    // Selecting ATM Terminal should map to ATM_Cardless
    fireEvent.change(channelSelect, { target: { value: 'ATM' } });

    await waitFor(() => {
      expect(api.getTransactions).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: 'ATM_Cardless',
        })
      );
    });
  });

  // 20. Synthetic Transaction Ledger Currency Filter
  it('20. TransactionsPage currency filter sends specific currencies and handles combined CDF & USD cleanly', async () => {
    vi.mocked(api.getTransactions).mockResolvedValue(mockTransactionsPage);
    render(
      <TransactionsPage
        onSelectEntity={vi.fn()}
        onInvestigateCopilot={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('TXN-00801')).toBeInTheDocument();
    });

    const currencySelect = screen.getByDisplayValue('CDF & USD');

    // Selecting USD
    fireEvent.change(currencySelect, { target: { value: 'USD' } });

    await waitFor(() => {
      expect(api.getTransactions).toHaveBeenCalledWith(
        expect.objectContaining({
          currency: 'USD',
        })
      );
    });

    // Selecting CDF
    fireEvent.change(currencySelect, { target: { value: 'CDF' } });

    await waitFor(() => {
      expect(api.getTransactions).toHaveBeenCalledWith(
        expect.objectContaining({
          currency: 'CDF',
        })
      );
    });

    // Selecting CDF & USD back (unfiltered)
    fireEvent.change(currencySelect, { target: { value: '' } });

    await waitFor(() => {
      expect(api.getTransactions).toHaveBeenCalledWith(
        expect.objectContaining({
          currency: undefined,
        })
      );
    });
  });

  // 21. Synthetic Transaction Ledger Reset Filters
  it('21. TransactionsPage reset button clears all filters and returns unfiltered list', async () => {
    vi.mocked(api.getTransactions).mockResolvedValue(mockTransactionsPage);
    render(
      <TransactionsPage
        onSelectEntity={vi.fn()}
        onInvestigateCopilot={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('TXN-00801')).toBeInTheDocument();
    });

    const channelSelect = screen.getByDisplayValue('All Channels');
    fireEvent.change(channelSelect, { target: { value: 'MOBILE_APP' } });

    const cityInput = screen.getByPlaceholderText(/e\.g\. Kinshasa/i);
    fireEvent.change(cityInput, { target: { value: 'Kinshasa' } });

    await waitFor(() => {
      expect(api.getTransactions).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: 'IllicoCash_App',
          location_city: 'Kinshasa',
        })
      );
    });

    // Click Reset
    const resetBtn = screen.getByText('Reset Filters');
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(api.getTransactions).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: undefined,
          currency: undefined,
          customer_id: undefined,
          beneficiary_id: undefined,
          location_city: undefined,
        })
      );
    });
  });

  // 22. Customer Risk Surveillance Initial Render
  it('22. CustomersPage renders header and queries customer profiles', async () => {
    vi.mocked(api.getCustomers).mockResolvedValue(mockCustomersPage);
    render(
      <CustomersPage
        onSelectEntity={vi.fn()}
        onInvestigateCopilot={vi.fn()}
      />
    );

    expect(screen.getByText('Customer Risk Surveillance')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('CUS-00014')).toBeInTheDocument();
      expect(screen.getByText('Christelle Mutombo')).toBeInTheDocument();
    });
  });

  // 23. Customer Segment Filter
  it('23. CustomersPage segment filter maps UI dropdown options to database values', async () => {
    vi.mocked(api.getCustomers).mockResolvedValue(mockCustomersPage);
    render(
      <CustomersPage
        onSelectEntity={vi.fn()}
        onInvestigateCopilot={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('CUS-00014')).toBeInTheDocument();
    });

    const [segmentSelect] = screen.getAllByRole('combobox');

    // Selecting Retail Individual -> maps to Retail
    fireEvent.change(segmentSelect, { target: { value: 'RETAIL' } });
    await waitFor(() => {
      expect(api.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({
          segment: 'Retail',
        })
      );
    });

    // Selecting Private Banking VIP -> maps to HNWI
    fireEvent.change(segmentSelect, { target: { value: 'VIP' } });
    await waitFor(() => {
      expect(api.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({
          segment: 'HNWI',
        })
      );
    });

    // Selecting SME Commercial -> maps to SME
    fireEvent.change(segmentSelect, { target: { value: 'SME' } });
    await waitFor(() => {
      expect(api.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({
          segment: 'SME',
        })
      );
    });

    // Selecting Large Corporate -> maps to Corporate
    fireEvent.change(segmentSelect, { target: { value: 'CORPORATE' } });
    await waitFor(() => {
      expect(api.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({
          segment: 'Corporate',
        })
      );
    });

    // Selecting All Segments -> sends undefined
    fireEvent.change(segmentSelect, { target: { value: '' } });
    await waitFor(() => {
      expect(api.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({
          segment: undefined,
        })
      );
    });
  });

  // 24. Customer KYC Status Filter
  it('24. CustomersPage KYC status filter maps UI dropdown options to database values', async () => {
    vi.mocked(api.getCustomers).mockResolvedValue(mockCustomersPage);
    render(
      <CustomersPage
        onSelectEntity={vi.fn()}
        onInvestigateCopilot={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('CUS-00014')).toBeInTheDocument();
    });

    const [, kycSelect] = screen.getAllByRole('combobox');

    // Selecting FULL Verification -> maps to Tier_3_Full
    fireEvent.change(kycSelect, { target: { value: 'FULL' } });
    await waitFor(() => {
      expect(api.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({
          kyc_status: 'Tier_3_Full',
        })
      );
    });

    // Selecting PARTIAL Verification -> maps to Tier_2_Standard
    fireEvent.change(kycSelect, { target: { value: 'PARTIAL' } });
    await waitFor(() => {
      expect(api.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({
          kyc_status: 'Tier_2_Standard',
        })
      );
    });

    // Selecting PENDING Verification -> maps to Tier_1_Basic
    fireEvent.change(kycSelect, { target: { value: 'PENDING' } });
    await waitFor(() => {
      expect(api.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({
          kyc_status: 'Tier_1_Basic',
        })
      );
    });

    // Selecting All KYC Statuses -> sends undefined
    fireEvent.change(kycSelect, { target: { value: '' } });
    await waitFor(() => {
      expect(api.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({
          kyc_status: undefined,
        })
      );
    });
  });

  // 25. Customer Risk Tier Filter
  it('25. CustomersPage risk category filter maps UI dropdown options to database values', async () => {
    vi.mocked(api.getCustomers).mockResolvedValue(mockCustomersPage);
    render(
      <CustomersPage
        onSelectEntity={vi.fn()}
        onInvestigateCopilot={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('CUS-00014')).toBeInTheDocument();
    });

    const [, , riskSelect] = screen.getAllByRole('combobox');

    // Selecting HIGH Risk Tier -> maps to High
    fireEvent.change(riskSelect, { target: { value: 'HIGH' } });
    await waitFor(() => {
      expect(api.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({
          risk_category: 'High',
        })
      );
    });

    // Selecting MEDIUM Risk Tier -> maps to Medium
    fireEvent.change(riskSelect, { target: { value: 'MEDIUM' } });
    await waitFor(() => {
      expect(api.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({
          risk_category: 'Medium',
        })
      );
    });

    // Selecting LOW Risk Tier -> maps to Low
    fireEvent.change(riskSelect, { target: { value: 'LOW' } });
    await waitFor(() => {
      expect(api.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({
          risk_category: 'Low',
        })
      );
    });

    // Selecting All Risk Tiers -> sends undefined
    fireEvent.change(riskSelect, { target: { value: '' } });
    await waitFor(() => {
      expect(api.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({
          risk_category: undefined,
        })
      );
    });
  });

  // 26. Customer Registered City Filter
  it('26. CustomersPage registered city filter passes trimmed city parameter', async () => {
    vi.mocked(api.getCustomers).mockResolvedValue(mockCustomersPage);
    render(
      <CustomersPage
        onSelectEntity={vi.fn()}
        onInvestigateCopilot={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('CUS-00014')).toBeInTheDocument();
    });

    const cityInput = screen.getByPlaceholderText(/e\.g\. Lubumbashi/i);
    fireEvent.change(cityInput, { target: { value: 'Kinshasa' } });

    await waitFor(() => {
      expect(api.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({
          city: 'Kinshasa',
        })
      );
    });
  });

  // 27. Combined Customer Filters
  it('27. CustomersPage combined filters pass all parameters simultaneously', async () => {
    vi.mocked(api.getCustomers).mockResolvedValue(mockCustomersPage);
    render(
      <CustomersPage
        onSelectEntity={vi.fn()}
        onInvestigateCopilot={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('CUS-00014')).toBeInTheDocument();
    });

    const [segmentSelect, kycSelect, riskSelect] = screen.getAllByRole('combobox');
    const cityInput = screen.getByPlaceholderText(/e\.g\. Lubumbashi/i);

    fireEvent.change(segmentSelect, { target: { value: 'RETAIL' } });
    fireEvent.change(kycSelect, { target: { value: 'PARTIAL' } });
    fireEvent.change(riskSelect, { target: { value: 'LOW' } });
    fireEvent.change(cityInput, { target: { value: 'Kinshasa' } });

    await waitFor(() => {
      expect(api.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({
          segment: 'Retail',
          kyc_status: 'Tier_2_Standard',
          risk_category: 'Low',
          city: 'Kinshasa',
        })
      );
    });
  });

  // 28. Reset Customer Filters
  it('28. CustomersPage reset button clears all filters and restores full customer list', async () => {
    vi.mocked(api.getCustomers).mockResolvedValue(mockCustomersPage);
    render(
      <CustomersPage
        onSelectEntity={vi.fn()}
        onInvestigateCopilot={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('CUS-00014')).toBeInTheDocument();
    });

    const [segmentSelect] = screen.getAllByRole('combobox');
    const cityInput = screen.getByPlaceholderText(/e\.g\. Lubumbashi/i);

    fireEvent.change(segmentSelect, { target: { value: 'VIP' } });
    fireEvent.change(cityInput, { target: { value: 'Goma' } });

    await waitFor(() => {
      expect(api.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({
          segment: 'HNWI',
          city: 'Goma',
        })
      );
    });

    const resetBtn = screen.getByText('Reset Filters');
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(api.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({
          segment: undefined,
          kyc_status: undefined,
          risk_category: undefined,
          city: undefined,
        })
      );
    });
  });
});
