/**
 * GreenLane AI — Application Context
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, KPISummary } from '../api/client';

interface AppContextType {
  dataset: string;
  setDataset: (dataset: string) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  carbonPrice: number;
  setCarbonPrice: (price: number) => void;
  kpis: KPISummary | null;
  loadingKPIs: boolean;
  refreshKPIs: () => void;
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dataset, setDatasetState] = useState<string>(() => localStorage.getItem('greenlane_dataset') || 'demo');
  const [currency, setCurrencyState] = useState<string>(() => localStorage.getItem('greenlane_currency') || 'EUR');
  const [carbonPrice, setCarbonPrice] = useState<number>(50.0);
  const [kpis, setKPIs] = useState<KPISummary | null>(null);
  const [loadingKPIs, setLoadingKPIs] = useState<boolean>(true);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const setDataset = (newDataset: string) => {
    setDatasetState(newDataset);
    localStorage.setItem('greenlane_dataset', newDataset);
    showToast(`Switched active dataset to ${newDataset === 'demo' ? 'VastraGlobal Exports (Demo)' : 'Paris Logistics (Original CSV)'}`);
  };

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('greenlane_currency', newCurrency);
    const symbols: Record<string, string> = { EUR: '€ EUR', INR: '₹ INR', USD: '$ USD', GBP: '£ GBP' };
    showToast(`Reporting currency set to ${symbols[newCurrency] || newCurrency}`);
  };

  const refreshKPIs = () => {
    setLoadingKPIs(true);
    api.getKPIs(dataset)
      .then(data => {
        setKPIs(data);
        setLoadingKPIs(false);
      })
      .catch(err => {
        console.error('Failed to load KPIs:', err);
        setLoadingKPIs(false);
      });
  };

  useEffect(() => {
    refreshKPIs();
  }, [dataset]);

  return (
    <AppContext.Provider
      value={{
        dataset,
        setDataset,
        currency,
        setCurrency,
        carbonPrice,
        setCarbonPrice,
        kpis,
        loadingKPIs,
        refreshKPIs,
        isCopilotOpen,
        setIsCopilotOpen,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
