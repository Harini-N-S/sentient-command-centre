import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { EntityDrawer } from './components/EntityDrawer';

import { CommandCentrePage } from './pages/CommandCentrePage';
import { AlertsPage } from './pages/AlertsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { CustomersPage } from './pages/CustomersPage';

import { api } from './services/api';

export type AppPage = 'command-centre' | 'alerts' | 'transactions' | 'customers';

export function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('command-centre');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Critical Alert badge count
  const [criticalCount, setCriticalCount] = useState<number>(0);

  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerEntityType, setDrawerEntityType] = useState<string>('alert');
  const [drawerEntityId, setDrawerEntityId] = useState<string>('');

  // Alerts Page Filter
  const [alertsInitialSeverity, setAlertsInitialSeverity] = useState<string | undefined>(undefined);

  // Load overview once to populate sidebar badges
  useEffect(() => {
    async function loadStats() {
      try {
        const overview = await api.getOverview();
        if (overview.alerts_by_severity?.CRITICAL) {
          setCriticalCount(overview.alerts_by_severity.CRITICAL);
        }
      } catch {
        // Backend offline or starting
      }
    }
    loadStats();
  }, []);

  const handleSelectEntity = (type: string, id: string) => {
    setDrawerEntityType(type);
    setDrawerEntityId(id);
    setIsDrawerOpen(true);
  };

  const handleNavigateToAlerts = (filterSeverity?: string) => {
    setAlertsInitialSeverity(filterSeverity);
    setCurrentPage('alerts');
  };

  const handleInvestigate = (_question: string, entityType?: string, entityId?: string) => {
    if (entityType && entityId) {
      handleSelectEntity(entityType, entityId);
    }
  };

  return (
    <div className="app-container min-h-screen bg-bg-base text-text-primary flex flex-col font-sans selection:bg-accent-gold/20 selection:text-accent-gold">
      {/* Top Navigation */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        activeView={currentPage}
        systemStatus="CONNECTED"
      />

      {/* Main Layout Container */}
      <div className="main-layout flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentView={currentPage}
          onSelectView={(page) => {
            if (page === 'alerts') {
              setAlertsInitialSeverity(undefined);
            }
            setCurrentPage(page);
          }}
          criticalCount={criticalCount}
        />

        {/* Primary Workspace Scroll Area */}
        <main className="content-area flex-1 overflow-y-auto p-6 lg:p-8 bg-bg-base">
          <div className="workspace-inner max-w-7xl mx-auto">
            {currentPage === 'command-centre' && (
              <CommandCentrePage
                onSelectEntity={handleSelectEntity}
                onNavigateToAlerts={handleNavigateToAlerts}
                onInvestigateCopilot={handleInvestigate}
              />
            )}

            {currentPage === 'alerts' && (
              <AlertsPage
                initialSeverity={alertsInitialSeverity}
                onSelectEntity={handleSelectEntity}
                onInvestigateCopilot={handleInvestigate}
              />
            )}

            {currentPage === 'transactions' && (
              <TransactionsPage
                onSelectEntity={handleSelectEntity}
                onInvestigateCopilot={handleInvestigate}
              />
            )}

            {currentPage === 'customers' && (
              <CustomersPage
                onSelectEntity={handleSelectEntity}
                onInvestigateCopilot={handleInvestigate}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global Search Modal (Ctrl+K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectEntity={(entityType: string, entityId: string) => {
          handleSelectEntity(entityType, entityId);
        }}
      />

      {/* Slide-Over Entity & Evidence Drawer */}
      <EntityDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        entityType={drawerEntityType}
        entityId={drawerEntityId}
        onSelectEntity={handleSelectEntity}
        onInvestigateCopilot={handleInvestigate}
      />
    </div>
  );
}

export default App;
