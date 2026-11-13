import React, { useEffect, useState } from 'react';
import type { IPLocationData, SearchHistoryItem, ToastMessage, ClientEnvironment } from './types/ip';
import { IPService } from './services/ipService';
import { cyberSound } from './services/soundService';
import { Header } from './components/Header';
import { StatusBar } from './components/StatusBar';
import { LookupBar } from './components/LookupBar';
import { CyberMap } from './components/CyberMap';
import { IPOverviewCard } from './components/IPOverviewCard';
import { SecurityScoreCard } from './components/SecurityScoreCard';
import { NetworkRoutingCard } from './components/NetworkRoutingCard';
import { DiagnosticsCard } from './components/DiagnosticsCard';
import { WebRTCLeakCard } from './components/WebRTCLeakCard';
import { DNSLookupCard } from './components/DNSLookupCard';
import { GlobalPingCard } from './components/GlobalPingCard';
import { BogonAlert } from './components/BogonAlert';
import { PrivacyModal } from './components/PrivacyModal';
import { ExportModal } from './components/ExportModal';
import { SubnetCalcModal } from './components/SubnetCalcModal';
import { TerminalCLIModal } from './components/TerminalCLIModal';
import { CompareModal } from './components/CompareModal';
import { Toast } from './components/Toast';

export const App: React.FC = () => {
  const [visitorData, setVisitorData] = useState<IPLocationData | null>(null);
  const [currentData, setCurrentData] = useState<IPLocationData | null>(null);
  const [clientEnv, setClientEnv] = useState<ClientEnvironment>(IPService.getClientEnvironment());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // User preferences & UI toggles
  const [maskedIP, setMaskedIP] = useState<boolean>(() => {
    return localStorage.getItem('cyber_ip_masked') === 'true';
  });
  const [scanlines, setScanlines] = useState<boolean>(() => {
    return localStorage.getItem('cyber_scanlines') === 'true';
  });
  const [history, setHistory] = useState<SearchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('cyber_ip_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSubnetOpen, setIsSubnetOpen] = useState(false);
  const [isCLIOpen, setIsCLIOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, type: ToastMessage['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleMaskIP = () => {
    setMaskedIP((prev) => {
      const next = !prev;
      localStorage.setItem('cyber_ip_masked', String(next));
      addToast(next ? 'IP masked. Last two octets are hidden.' : 'IP unmasked', 'info');
      return next;
    });
  };

  const toggleScanlines = () => {
    setScanlines((prev) => {
      const next = !prev;
      localStorage.setItem('cyber_scanlines', String(next));
      return next;
    });
  };

  // Initial detection on mount + URL query parsing
  useEffect(() => {
    setClientEnv(IPService.getClientEnvironment());

    const initDetection = async () => {
      setIsLoading(true);
      setError(null);

      // Check if URL contains ?lookup= or ?ip=
      const params = new URLSearchParams(window.location.search);
      const urlQuery = params.get('lookup') || params.get('ip');

      try {
        const selfData = await IPService.getVisitorIP();
        setVisitorData(selfData);

        if (urlQuery && urlQuery.trim() !== selfData.ip) {
          try {
            const lookupResult = await IPService.lookupIP(urlQuery.trim());
            setCurrentData(lookupResult);
            addToHistory(urlQuery.trim(), lookupResult);
            addToast(`Loaded ${urlQuery.trim()}`, 'success');
          } catch (lookupErr: any) {
            setCurrentData(selfData);
            addToast(lookupErr.message || 'Lookup failed. Showing your own IP instead.', 'warning');
          }
        } else {
          setCurrentData(selfData);
        }
      } catch (err: any) {
        console.error('Detection error:', err);
        setError(err.message || 'Could not detect your public IP. Check your connection or disable ad-blockers for this page.');
        cyberSound.playAlert();
      } finally {
        setIsLoading(false);
      }
    };

    initDetection();
  }, []);

  const addToHistory = (query: string, result: IPLocationData) => {
    const newItem: SearchHistoryItem = {
      ip: result.ip,
      query,
      city: result.city,
      country: result.country,
      timestamp: Date.now()
    };
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.query.toLowerCase() !== query.toLowerCase());
      const updated = [newItem, ...filtered].slice(0, 10);
      localStorage.setItem('cyber_ip_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('cyber_ip_history');
    addToast('History cleared', 'info');
  };

  const handleLookup = async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await IPService.lookupIP(query);
      setCurrentData(result);
      addToHistory(query, result);
      addToast(`Loaded ${result.ip}`, 'success');
    } catch (err: any) {
      cyberSound.playAlert();
      setError(err.message || `No result for "${query}". Check the address or domain and try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetToSelf = () => {
    if (visitorData) {
      setCurrentData(visitorData);
      setError(null);
    } else {
      // Re-fetch
      setIsLoading(true);
      IPService.getVisitorIP()
        .then((data) => {
          setVisitorData(data);
          setCurrentData(data);
          setError(null);
        })
        .catch((err) => setError(err.message))
        .finally(() => setIsLoading(false));
    }
  };

  const handleUpdateLatency = (newLatency: number) => {
    if (currentData) {
      setCurrentData({
        ...currentData,
        diagnostics: {
          ...currentData.diagnostics,
          latencyMs: newLatency
        }
      });
    }
  };

  const lookupBar = (
    <LookupBar
      onLookup={handleLookup}
      onResetToSelf={handleResetToSelf}
      isLoading={isLoading}
      history={history}
      onClearHistory={handleClearHistory}
    />
  );

  return (
    <div className={scanlines ? 'scanlines' : ''}>
      <div className="shell">
        <Header
          maskedIP={maskedIP}
          onToggleMaskIP={toggleMaskIP}
          scanlines={scanlines}
          onToggleScanlines={toggleScanlines}
          onOpenPrivacy={() => setIsPrivacyOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
          onOpenSubnet={() => setIsSubnetOpen(true)}
          onOpenCLI={() => setIsCLIOpen(true)}
          onOpenCompare={() => setIsCompareOpen(true)}
        />

        <main>
          {error && (
            <div className="alert" role="alert">
              <span>
                <strong>[err]</strong> {error}
              </span>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setError(null);
                  handleResetToSelf();
                }}
              >
                show my ip
              </button>
            </div>
          )}

          {isLoading && !currentData && (
            <div className="booting" aria-live="polite">
              <div className="cmdline">
                <span className="prompt">$</span> curl -s ifconfig.me
              </div>
              <div className="ip-big">
                ···.···.···.···<span className="cursor">▌</span>
              </div>
              <p className="t-mute">Asking public geolocation APIs for your address.</p>
            </div>
          )}

          {!isLoading && !currentData && <div className="hero">{lookupBar}</div>}

          {currentData && (
            <>
              <IPOverviewCard
                data={currentData}
                maskedIP={maskedIP}
                onToggleMask={toggleMaskIP}
                onNotify={addToast}
              >
                {lookupBar}
              </IPOverviewCard>

              <BogonAlert
                data={currentData}
                onLookupPreset={handleLookup}
                onResetToSelf={handleResetToSelf}
              />

              <div className="panes">
                <SecurityScoreCard security={currentData.security} target={currentData.ip} />
                <NetworkRoutingCard data={currentData} onNotify={addToast} />

                <CyberMap currentData={currentData} visitorData={visitorData} maskedIP={maskedIP} />

                <DNSLookupCard initialDomain={currentData.domain || 'google.com'} onNotify={addToast} />
                <WebRTCLeakCard onNotify={addToast} />

                <GlobalPingCard onNotify={addToast} />
                <DiagnosticsCard data={currentData} clientEnv={clientEnv} onUpdateLatency={handleUpdateLatency} />
              </div>
            </>
          )}
        </main>
      </div>

      <StatusBar
        data={currentData}
        maskedIP={maskedIP}
        isLoading={isLoading}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        data={currentData}
        onNotify={addToast}
      />

      <SubnetCalcModal
        isOpen={isSubnetOpen}
        onClose={() => setIsSubnetOpen(false)}
        defaultIP={currentData?.ip || '192.168.1.1'}
        onNotify={addToast}
      />

      <TerminalCLIModal
        isOpen={isCLIOpen}
        onClose={() => setIsCLIOpen(false)}
        targetIP={currentData?.ip || '127.0.0.1'}
        onNotify={addToast}
      />

      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        visitorData={visitorData}
        currentData={currentData}
      />

      <Toast toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
};

export default App;
