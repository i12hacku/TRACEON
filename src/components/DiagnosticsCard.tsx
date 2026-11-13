import React, { useState } from 'react';
import type { IPLocationData, ClientEnvironment } from '../types/ip';
import { IPService } from '../services/ipService';
import { cyberSound } from '../services/soundService';
import { AsciiBar, Pane } from './Pane';

interface DiagnosticsCardProps {
  data: IPLocationData;
  clientEnv: ClientEnvironment;
  onUpdateLatency: (latency: number) => void;
}

export const DiagnosticsCard: React.FC<DiagnosticsCardProps> = ({
  data,
  clientEnv,
  onUpdateLatency
}) => {
  const [isPinging, setIsPinging] = useState(false);
  const latency = data.diagnostics.latencyMs;

  const handleTestPing = async () => {
    setIsPinging(true);
    cyberSound.playScan();
    try {
      const ping = await IPService.measurePing();
      onUpdateLatency(ping);
      cyberSound.playLockOn();
    } catch {
      // Ignore
    } finally {
      setIsPinging(false);
    }
  };

  let tone = 't-ok';
  let verdict = 'fast';
  if (latency && latency > 250) {
    tone = 't-bad';
    verdict = 'slow';
  } else if (latency && latency > 120) {
    tone = 't-warn';
    verdict = 'sluggish';
  }

  return (
    <Pane
      cmd="uname -a && rtt"
      actions={
        <button type="button" className="btn" onClick={handleTestPing} disabled={isPinging}>
          {isPinging ? 'pinging…' : 'measure again'}
        </button>
      }
    >
      <div className="stack">
        <div className="score-row">
          <span className={`big-num ${tone}`}>
            {latency !== null ? latency : '--'}
            <span className="t-mute" style={{ fontSize: '0.5em' }}>
              ms
            </span>
          </span>
          <div>
            <AsciiBar value={latency ?? 0} max={400} width={20} className={tone} />
            <div className="t-mute">
              round trip to the API edge, <span className={tone}>{verdict}</span>
            </div>
          </div>
        </div>

        <dl className="kv">
          <dt>browser</dt>
          <dd>{clientEnv.browser}</dd>
          <dt>os</dt>
          <dd>{clientEnv.os}</dd>
          <dt>screen</dt>
          <dd>{clientEnv.screenRes}</dd>
          <dt>lang</dt>
          <dd>{clientEnv.language}</dd>
          <dt>tz</dt>
          <dd>{clientEnv.timeZone}</dd>
          <dt>dnt</dt>
          <dd className={clientEnv.dnt ? 't-hi' : 't-mute'}>{clientEnv.dnt ? 'on' : 'off'}</dd>
          <dt>source</dt>
          <dd className="t-mute">{data.diagnostics.source}</dd>
        </dl>
      </div>
    </Pane>
  );
};
