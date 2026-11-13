import React, { useEffect, useState } from 'react';
import type { IPLocationData } from '../types/ip';
import { maskIP } from './Pane';

interface StatusBarProps {
  data: IPLocationData | null;
  maskedIP: boolean;
  isLoading: boolean;
  onOpenPrivacy: () => void;
}

// tmux-style status line pinned to the bottom of the viewport.
export const StatusBar: React.FC<StatusBarProps> = ({ data, maskedIP, isLoading, onOpenPrivacy }) => {
  const [clock, setClock] = useState('');

  useEffect(() => {
    const tick = () => setClock(new Date().toISOString().slice(0, 19).replace('T', ' ') + 'Z');
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const ip = data ? (maskedIP ? maskIP(data.ip) : data.ip) : '—';
  const rtt = data?.diagnostics.latencyMs;

  return (
    <div className="statusbar" role="status">
      <div>
        <span className="seg-inv">TRACEON</span>
        <span className="cell">{isLoading ? 'resolving…' : data?.isLookup ? `target ${ip}` : `you ${ip}`}</span>
        {rtt != null && <span className="cell hide-sm">rtt {rtt}ms</span>}
        {data && <span className="cell hide-sm">{data.asn}</span>}
      </div>
      <div>
        <button type="button" className="hide-sm" onClick={onOpenPrivacy}>
          runs in your browser, nothing logged
        </button>
        <span className="seg-inv">
          <span className="hide-sm">{clock.slice(0, 11)}</span>
          {clock.slice(11)}
        </span>
      </div>
    </div>
  );
};
