import React, { useState } from 'react';
import type { SearchHistoryItem } from '../types/ip';
import { cyberSound } from '../services/soundService';

interface LookupBarProps {
  onLookup: (query: string) => Promise<void>;
  onResetToSelf: () => void;
  isLoading: boolean;
  history: SearchHistoryItem[];
  onClearHistory: () => void;
}

const PRESET_IPS = [
  { label: 'cloudflare', ip: '1.1.1.1' },
  { label: 'google', ip: '8.8.8.8' },
  { label: 'quad9', ip: '9.9.9.9' },
  { label: 'opendns', ip: '208.67.222.222' }
];

export const LookupBar: React.FC<LookupBarProps> = ({
  onLookup,
  onResetToSelf,
  isLoading,
  history,
  onClearHistory
}) => {
  const [query, setQuery] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    cyberSound.playScan();
    onLookup(query.trim());
    setShowHistory(false);
  };

  const handleSelectPreset = (ip: string) => {
    setQuery(ip);
    cyberSound.playClick();
    onLookup(ip);
    setShowHistory(false);
  };

  const handleSelectHistory = (item: SearchHistoryItem) => {
    setQuery(item.query);
    cyberSound.playClick();
    onLookup(item.query);
    setShowHistory(false);
  };

  return (
    <div className="lookup">
      <form onSubmit={handleSubmit}>
        <label htmlFor="lookup-q" className="sr-only">
          IP address or domain to look up
        </label>
        <div className="lookup-row">
          <span className="prompt" aria-hidden="true">lookup&nbsp;›</span>
          <input
            id="lookup-q"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="any IPv4, IPv6 or domain"
            className="lookup-input"
            autoComplete="off"
            spellCheck={false}
          />
          {history.length > 0 && (
            <button
              type="button"
              className="btn"
              aria-expanded={showHistory}
              onClick={() => {
                cyberSound.playClick();
                setShowHistory(!showHistory);
              }}
            >
              history {history.length}
            </button>
          )}
          <button type="submit" className="btn-run" disabled={isLoading || !query.trim()}>
            {isLoading ? 'tracing…' : 'run ⏎'}
          </button>
        </div>

        {showHistory && history.length > 0 && (
          <div className="history">
            <div className="history-head">
              <span>~/.traceon_history</span>
              <button
                type="button"
                className="btn btn-warn"
                onClick={() => {
                  cyberSound.playClick();
                  onClearHistory();
                  setShowHistory(false);
                }}
              >
                clear
              </button>
            </div>
            <ol>
              {history.map((item, idx) => (
                <li key={`${item.ip}-${idx}`}>
                  <button type="button" onClick={() => handleSelectHistory(item)}>
                    <span className="t-mute">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </span>
                    <span className="t-hi" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.query}
                    </span>
                    <span className="t-mute">
                      {item.city}, {item.country}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        )}
      </form>

      <div className="presets">
        <span className="t-mute">try</span>
        {PRESET_IPS.map((preset) => (
          <button
            key={preset.ip}
            type="button"
            className="linkish"
            onClick={() => handleSelectPreset(preset.ip)}
            title={preset.label}
          >
            {preset.ip}
          </button>
        ))}
        <button
          type="button"
          className="btn"
          onClick={() => {
            setQuery('');
            cyberSound.playClick();
            onResetToSelf();
            setShowHistory(false);
          }}
        >
          back to my ip
        </button>
      </div>
    </div>
  );
};
