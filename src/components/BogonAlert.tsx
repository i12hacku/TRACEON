import React from 'react';
import type { IPLocationData } from '../types/ip';
import { Pane } from './Pane';

interface BogonAlertProps {
  data: IPLocationData;
  onLookupPreset: (ip: string) => void;
  onResetToSelf: () => void;
}

export const BogonAlert: React.FC<BogonAlertProps> = ({
  data,
  onLookupPreset,
  onResetToSelf
}) => {
  if (!data.security.isBogon) return null;

  return (
    <div style={{ paddingTop: 48 }}>
      <Pane cmd={`ipcalc --class ${data.ip}`} tone="warn">
        <p>
          <span className="t-warn">{data.ip}</span> is a private, loopback or reserved address (RFC 1918 and
          friends). It only exists inside a local network such as your router, a Docker bridge or localhost, so it has
          no public location or owner to look up.
        </p>
        <p className="field-row">
          <button type="button" className="btn btn-warn" onClick={onResetToSelf}>
            show my public ip
          </button>
          <button type="button" className="btn" onClick={() => onLookupPreset('1.1.1.1')}>
            look up 1.1.1.1
          </button>
        </p>
      </Pane>
    </div>
  );
};
