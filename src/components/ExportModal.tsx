import React, { useState } from 'react';
import type { IPLocationData } from '../types/ip';
import { cyberSound } from '../services/soundService';
import { Modal } from './Pane';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: IPLocationData | null;
  onNotify: (text: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  data,
  onNotify
}) => {
  const [tab, setTab] = useState<'json' | 'txt'>('json');
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const jsonContent = JSON.stringify(data, null, 2);

  const txtContent = `=====================================================
TRACEON // TACTICAL INTELLIGENCE DOSSIER
=====================================================
Target Node:         ${data.ip} (${data.type})
Classification:      ${data.security.connectionType}
Generated At:        ${new Date().toISOString()}

[ GEOLOCATION TELEMETRY ]
City / Region:       ${data.city}, ${data.region}
Country:             ${data.country} (${data.countryCode})
Postal Code:         ${data.postal}
GPS Coordinates:     ${data.latitude}, ${data.longitude}
Timezone:            ${data.timezone.id} (${data.timezone.utc || 'UTC'})

[ NETWORK & ROUTING ]
Autonomous System:   ${data.asn}
Organization:        ${data.org}
ISP Carrier:         ${data.isp}
Domain:              ${data.domain || 'N/A'}

[ CYBERSECURITY THREAT ASSESSMENT ]
Threat Score:        ${data.security.threatScore}/100 [${data.security.threatLevel} RISK]
Datacenter/Cloud:    ${data.security.isDatacenter ? 'YES' : 'NO'}
VPN / Proxy:         ${data.security.isVpnOrProxy ? 'YES' : 'NO'}
Tor Relay:           ${data.security.isTor ? 'YES' : 'NO'}
Bogon / Private:     ${data.security.isBogon ? 'YES' : 'NO'}

Identified Factors:
${data.security.riskFactors.map(f => ` - ${f}`).join('\n')}

[ DIAGNOSTICS ]
Round-trip Latency:  ${data.diagnostics.latencyMs || 0} ms
Telemetry Source:    ${data.diagnostics.source}
=====================================================
CONFIDENTIAL // CLIENT ZERO-LOG INTEL
=====================================================`;

  const activeContent = tab === 'json' ? jsonContent : txtContent;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    cyberSound.playClick();
    setCopied(true);
    onNotify('Report copied', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    cyberSound.playClick();
    const blob = new Blob([activeContent], {
      type: tab === 'json' ? 'application/json' : 'text/plain'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traceon-${data.ip.replace(/[^a-zA-Z0-9]/g, '_')}.${tab}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onNotify(`Downloaded ${a.download}`, 'success');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      cmd={`export --format ${tab} ${data.ip}`}
      footer={
        <>
          <div className="seg" role="group" aria-label="Format">
            <button type="button" aria-pressed={tab === 'json'} onClick={() => { cyberSound.playClick(); setTab('json'); }}>
              json
            </button>
            <button type="button" aria-pressed={tab === 'txt'} onClick={() => { cyberSound.playClick(); setTab('txt'); }}>
              txt
            </button>
          </div>
          <div className="actions">
            <button type="button" className="btn" onClick={handleCopy}>
              {copied ? 'copied' : 'copy'}
            </button>
            <button type="button" className="btn-run" onClick={handleDownload}>
              download .{tab}
            </button>
          </div>
        </>
      }
    >
      <pre className="code">{activeContent}</pre>
    </Modal>
  );
};
