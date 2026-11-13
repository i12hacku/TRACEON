import React, { useState } from 'react';
import type { WebRTCLeakResult } from '../types/ip';
import { LeakService } from '../services/leakService';
import { cyberSound } from '../services/soundService';
import { Pane } from './Pane';

interface WebRTCLeakCardProps {
  onNotify: (text: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export const WebRTCLeakCard: React.FC<WebRTCLeakCardProps> = ({ onNotify }) => {
  const [result, setResult] = useState<WebRTCLeakResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const handleRunAudit = async () => {
    setIsAuditing(true);
    cyberSound.playScan();
    try {
      const data = await LeakService.auditWebRTC();
      setResult(data);
      if (data.hasLeak) {
        cyberSound.playAlert();
        onNotify('WebRTC is exposing your local IP', 'warning');
      } else {
        cyberSound.playLockOn();
        onNotify('WebRTC test passed. No local IP exposed.', 'success');
      }
    } catch {
      onNotify('WebRTC test could not run in this browser', 'error');
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <Pane
      cmd="webrtc-leak --stun"
      tone={result?.hasLeak ? 'warn' : undefined}
      actions={
        result && (
          <span className={result.hasLeak ? 't-warn' : 't-ok'}>{result.hasLeak ? 'leaking' : 'sealed'}</span>
        )
      }
    >
      <div className="stack">
        {!result && !isAuditing && (
          <p>
            Browsers can reveal your LAN address (192.168.x.x) through WebRTC STUN requests, even with a VPN on. The
            test asks your browser for its ICE candidates and checks what comes back.
          </p>
        )}

        {isAuditing && (
          <p className="t-hi" aria-live="polite">
            gathering ICE candidates<span className="cursor">▌</span>
          </p>
        )}

        {result && !isAuditing && (
          <>
            <p>
              <span className={result.hasLeak ? 't-warn' : 't-ok'}>{result.statusText}</span>
            </p>
            <p>{result.recommendation}</p>

            {result.localIPs.length > 0 && (
              <dl className="kv">
                <dt className="t-warn">exposed</dt>
                <dd>
                  {result.localIPs.map((ip) => (
                    <div key={ip} className="t-warn">
                      {ip}
                    </div>
                  ))}
                </dd>
              </dl>
            )}
          </>
        )}

        <div>
          <button type="button" className="btn" onClick={handleRunAudit} disabled={isAuditing}>
            {isAuditing ? 'testing…' : result ? 'run test again' : 'run leak test'}
          </button>
        </div>
      </div>
    </Pane>
  );
};
