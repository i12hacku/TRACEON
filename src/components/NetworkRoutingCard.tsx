import React, { useState } from 'react';
import type { IPLocationData } from '../types/ip';
import { cyberSound } from '../services/soundService';
import { Pane } from './Pane';

interface NetworkRoutingCardProps {
  data: IPLocationData;
  onNotify: (text: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export const NetworkRoutingCard: React.FC<NetworkRoutingCardProps> = ({ data, onNotify }) => {
  const [copiedAsn, setCopiedAsn] = useState(false);

  const handleCopyAsn = () => {
    navigator.clipboard.writeText(String(data.asn));
    cyberSound.playClick();
    setCopiedAsn(true);
    onNotify(`Copied ${data.asn}`, 'success');
    setTimeout(() => setCopiedAsn(false), 2000);
  };

  const bgpUrl = `https://bgp.he.net/${encodeURIComponent(data.asn)}`;

  return (
    <Pane
      cmd={`whois ${data.asn}`}
      actions={
        <>
          <button type="button" className="btn" onClick={handleCopyAsn}>
            {copiedAsn ? 'copied' : 'copy asn'}
          </button>
          <a href={bgpUrl} target="_blank" rel="noopener noreferrer" className="btn" title="Open on bgp.he.net">
            bgp.he.net
          </a>
        </>
      }
    >
      <div className="stack">
        <div>
          <div className="big-num t-hi">{data.asn}</div>
          <div className="t-mute">{data.org || 'autonomous system'}</div>
        </div>

        <dl className="kv">
          <dt>isp</dt>
          <dd>{data.isp}</dd>
          <dt>org</dt>
          <dd>{data.org}</dd>
          {data.domain && (
            <>
              <dt>domain</dt>
              <dd>{data.domain}</dd>
            </>
          )}
          <dt>protocol</dt>
          <dd>
            {data.type} <span className="t-mute">{data.type === 'IPv6' ? '128-bit global unicast' : '32-bit dotted decimal'}</span>
          </dd>
          <dt>rir</dt>
          <dd>{getRIR(data.continent || data.countryCode)}</dd>
        </dl>
      </div>
    </Pane>
  );
};

function getRIR(zone: string): string {
  const z = zone.toUpperCase();
  if (z.includes('EU') || z.includes('EUROPE')) return 'RIPE NCC (Europe, Middle East)';
  if (z.includes('AS') || z.includes('ASIA') || z.includes('OC') || z.includes('OCEANIA')) return 'APNIC (Asia Pacific)';
  if (z.includes('NA') || z.includes('NORTH AMERICA') || z === 'US' || z === 'CA') return 'ARIN (North America)';
  if (z.includes('SA') || z.includes('SOUTH AMERICA')) return 'LACNIC (Latin America, Caribbean)';
  if (z.includes('AF') || z.includes('AFRICA')) return 'AFRINIC (Africa)';
  return 'IANA';
}
