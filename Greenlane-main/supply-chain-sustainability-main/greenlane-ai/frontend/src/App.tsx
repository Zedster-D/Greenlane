import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { AICopilotDrawer } from './components/common/AICopilotDrawer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { NetworkPage } from './pages/NetworkPage';
import { EmissionsPage } from './pages/EmissionsPage';
import { ScenariosPage } from './pages/ScenariosPage';
import { OptimizerPage } from './pages/OptimizerPage';
import { CopilotPage } from './pages/CopilotPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { RiskPage } from './pages/RiskPage';
import { ESGPage } from './pages/ESGPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  if (isLanding) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-dark-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-dark-950/60 pb-12">
          {children}
        </main>
      </div>
      <AICopilotDrawer />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/overview" element={<DashboardPage />} />
            <Route path="/network" element={<NetworkPage />} />
            <Route path="/emissions" element={<EmissionsPage />} />
            <Route path="/scenarios" element={<ScenariosPage />} />
            <Route path="/optimizer" element={<OptimizerPage />} />
            <Route path="/copilot" element={<CopilotPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/risk" element={<RiskPage />} />
            <Route path="/esg" element={<ESGPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
