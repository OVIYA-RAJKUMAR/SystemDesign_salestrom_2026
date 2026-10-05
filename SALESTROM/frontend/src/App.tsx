import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { JuryDemoModal } from './components/JuryDemoModal';
import { OverviewPage } from './pages/OverviewPage';
import { FlashSalePage } from './pages/FlashSalePage';
import { InventoryPage } from './pages/InventoryPage';
import { ConcurrencyLabPage } from './pages/ConcurrencyLabPage';
import { PaymentOrdersPage } from './pages/PaymentOrdersPage';
import { FailureSimulatorPage } from './pages/FailureSimulatorPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { ObservabilityPage } from './pages/ObservabilityPage';
import { ApiExplorerPage } from './pages/ApiExplorerPage';
import { DesignDecisionsPage } from './pages/DesignDecisionsPage';
import { api } from './services/api';

const AppContent: React.FC = () => {
  const [isJuryDemoOpen, setIsJuryDemoOpen] = useState(false);
  const [circuitBreakerState, setCircuitBreakerState] = useState<string>('CLOSED');
  const [systemHealthy, setSystemHealthy] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const metrics = await api.getMetrics();
        setCircuitBreakerState(metrics.circuit_breaker_state || 'CLOSED');
        setSystemHealthy(metrics.error_rate === 0);
      } catch (e) {
        setSystemHealthy(false);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleRunJuryScenario = (scenarioId: number) => {
    if (scenarioId === 1) navigate('/concurrency-lab');
    else if (scenarioId === 2) navigate('/inventory');
    else if (scenarioId === 3) navigate('/payments');
    else if (scenarioId === 4) navigate('/payments');
    else if (scenarioId === 6) navigate('/failure-simulator');
    else if (scenarioId === 7) navigate('/inventory');
    else if (scenarioId === 8) navigate('/observability');
    else navigate('/concurrency-lab');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Header */}
      <Header
        systemHealthy={systemHealthy}
        circuitBreakerState={circuitBreakerState}
        onOpenJuryDemo={() => setIsJuryDemoOpen(true)}
      />

      {/* Navigation */}
      <Navigation />

      {/* Main Content View */}
      <main className="flex-1 px-6 py-8">
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/flash-sale" element={<FlashSalePage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/concurrency-lab" element={<ConcurrencyLabPage />} />
          <Route path="/payments" element={<PaymentOrdersPage />} />
          <Route path="/failure-simulator" element={<FailureSimulatorPage />} />
          <Route path="/architecture" element={<ArchitecturePage />} />
          <Route path="/observability" element={<ObservabilityPage />} />
          <Route path="/api-explorer" element={<ApiExplorerPage />} />
          <Route path="/design-decisions" element={<DesignDecisionsPage />} />
        </Routes>
      </main>

      {/* Jury Demo Modal */}
      <JuryDemoModal
        isOpen={isJuryDemoOpen}
        onClose={() => setIsJuryDemoOpen(false)}
        onRunScenario={handleRunJuryScenario}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        SALESTORM | SYSCRAFTERS 2026 — High-Scale E-Commerce Flash Sale System Design Hackathon Demonstration
      </footer>

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
