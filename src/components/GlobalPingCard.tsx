import React, { useState } from 'react';
import type { GlobalPingNode } from '../types/ip';
import { INITIAL_PING_NODES, LeakService } from '../services/leakService';
import { cyberSound } from '../services/soundService';
import { AsciiBar, Pane } from './Pane';

interface GlobalPingCardProps {
  onNotify: (text: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

const TONE: Record<GlobalPingNode['status'], string> = {
  pending: 't-mute',
  testing: 't-hi',
  optimal: 't-ok',
  moderate: 't-ok',
  slow: 't-warn',
  error: 't-bad'
};

export const GlobalPingCard: React.FC<GlobalPingCardProps> = ({ onNotify }) => {
  const [nodes, setNodes] = useState<GlobalPingNode[]>(INITIAL_PING_NODES);
  const [isTesting, setIsTesting] = useState(false);

  const handleTestAll = async () => {
    setIsTesting(true);
    cyberSound.playScan();

    const updated = [...nodes];
    for (let i = 0; i < updated.length; i++) {
      updated[i] = { ...updated[i], status: 'testing' };
      setNodes([...updated]);

      try {
        const ms = await LeakService.pingNode(updated[i]);
        let status: GlobalPingNode['status'] = 'optimal';
        if (ms > 220) status = 'slow';
        else if (ms > 130) status = 'moderate';
        else if (ms > 70) status = 'optimal';

        updated[i] = { ...updated[i], latencyMs: ms, status };
      } catch {
        updated[i] = { ...updated[i], status: 'error' };
      }
      setNodes([...updated]);
    }

    setIsTesting(false);
    cyberSound.playLockOn();
    onNotify(`Pinged ${updated.length} regions`, 'success');
  };

  return (
    <Pane
      cmd="mtr --report regions.txt"
      actions={
        <button type="button" className="btn" onClick={handleTestAll} disabled={isTesting}>
          {isTesting ? 'pinging…' : 'ping all'}
        </button>
      }
    >
      <div className="tbl-wrap" style={{ maxHeight: 'none' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>region</th>
              <th className="num">rtt</th>
              <th aria-hidden="true"></th>
            </tr>
          </thead>
          <tbody>
            {nodes.map((node) => (
              <tr key={node.id}>
                <td>
                  {node.flag} {node.region} <span className="t-mute">{node.location}</span>
                </td>
                <td className={`num ${TONE[node.status]}`}>
                  {node.status === 'testing'
                    ? '…'
                    : node.status === 'error'
                    ? 'fail'
                    : node.latencyMs !== null
                    ? `${node.latencyMs}ms`
                    : '--'}
                </td>
                <td className={TONE[node.status]}>
                  <AsciiBar value={node.latencyMs ?? 0} max={300} width={12} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Pane>
  );
};
