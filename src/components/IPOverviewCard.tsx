import React, { useEffect, useState } from 'react';
import type { IPLocationData } from '../types/ip';
import { cyberSound } from '../services/soundService';
import { maskIP } from './Pane';

interface IPOverviewCardProps {
  data: IPLocationData;
  maskedIP: boolean;
  onToggleMask: () => void;
  onNotify: (text: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  children?: React.ReactNode;
}

export const IPOverviewCard: React.FC<IPOverviewCardProps> = ({
  data,
  maskedIP,
  onToggleMask,
  onNotify,
  children
}) => {
  const [copiedIP, setCopiedIP] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [localTime, setLocalTime] = useState<string>('');
  // The type-on reveal runs once when the hero mounts; later lookups reuse the same nodes.
  const reveal = 'reveal';

  // Ticking remote local time clock
  useEffect(() => {
    const updateLocalClock = () => {
      try {
        const timeStr = new Intl.DateTimeFormat('en-GB', {
          timeZone: data.timezone.id || 'UTC',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(new Date());
        setLocalTime(timeStr);
      } catch {
        setLocalTime('--:--:--');
      }
    };

    updateLocalClock();
    const timer = setInterval(updateLocalClock, 1000);
    return () => clearInterval(timer);
  }, [data.timezone.id]);

  const displayIP = maskedIP ? maskIP(data.ip) : data.ip;

  const handleCopyIP = () => {
    navigator.clipboard.writeText(data.ip);
    cyberSound.playClick();
    setCopiedIP(true);
    onNotify(`Copied ${data.ip}`, 'success');
    setTimeout(() => setCopiedIP(false), 2000);
  };

  const handleCopyCoords = () => {
    const coordStr = `${data.latitude}, ${data.longitude}`;
    navigator.clipboard.writeText(coordStr);
    cyberSound.playClick();
    setCopiedCoords(true);
    onNotify(`Copied ${coordStr}`, 'success');
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const handleShare = async () => {
    cyberSound.playClick();
    const shareUrl = `${window.location.origin}/?lookup=${encodeURIComponent(data.ip)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `IP lookup: ${data.ip}`,
          text: `${data.ip} geolocates to ${data.city}, ${data.country}`,
          url: shareUrl
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(shareUrl);
      onNotify('Link to this lookup copied', 'success');
    }
  };

  const cmd = data.isLookup ? `curl -s ipwho.is/${displayIP} | jq .ip` : 'curl -s ifconfig.me';

  return (
    <section className="hero" aria-label={data.isLookup ? 'Looked-up IP address' : 'Your public IP address'}>
      <div>
        <div className={`cmdline ${reveal}`}>
          <span className="prompt">$</span> {cmd}
          <span className="t-mute">{data.isLookup ? '   # remote target' : '   # this is you'}</span>
        </div>

        <div className={`ip-big ${data.type === 'IPv6' ? 'v6' : ''} ${reveal} reveal-2`}>
          <span className="sr-only">{maskedIP ? 'IP address, partly hidden: ' : 'IP address: '}</span>
          {displayIP}
          <span className="cursor" aria-hidden="true">▌</span>
        </div>

        <div className={`ip-meta ${reveal} reveal-3`}>
          <span className="t-hi">{data.type.toLowerCase()}</span>
          <span>{data.security.connectionType.toLowerCase()}</span>
          <span>
            {data.city}, {data.countryCode}
          </span>
          <span className="t-mute">{data.asn}</span>
          {data.security.isBogon && <span className="t-warn">private range</span>}
        </div>

        <div className="ip-actions">
          <button type="button" className="btn" onClick={handleCopyIP}>
            {copiedIP ? 'copied' : 'copy ip'}
          </button>
          <button type="button" className="btn" onClick={handleShare}>
            share link
          </button>
          <button type="button" className={`btn ${maskedIP ? 'btn-warn' : ''}`} aria-pressed={maskedIP} onClick={onToggleMask}>
            {maskedIP ? 'unmask' : 'mask'}
          </button>
        </div>

        {children}
      </div>

      <div className="hero-geo">
        <div className="cmdline">
          <span className="prompt">$</span> geoiplookup {displayIP}
        </div>
        <dl className="kv">
          <dt>city</dt>
          <dd className="t-hi">{data.city}</dd>
          <dt>region</dt>
          <dd>
            {data.region} {data.postal !== 'N/A' && <span className="t-mute">{data.postal}</span>}
          </dd>
          <dt>country</dt>
          <dd>
            {data.flag?.emoji} {data.country} <span className="t-mute">{data.countryCode}</span>
          </dd>
          <dt>continent</dt>
          <dd>
            {data.continent || 'unknown'} {data.callingCode && <span className="t-mute">{data.callingCode}</span>}
          </dd>
          <dt>coords</dt>
          <dd>
            <button type="button" className="linkish" onClick={handleCopyCoords} title="Copy coordinates">
              {data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}
            </button>{' '}
            <span className="t-mute">{copiedCoords ? 'copied' : ''}</span>
            <div className="t-mute">
              {decimalToDms(data.latitude, false)} {decimalToDms(data.longitude, true)}
            </div>
          </dd>
          <dt>local time</dt>
          <dd>
            <span className="t-hi">{localTime}</span>{' '}
            <span className="t-mute">
              {data.timezone.id} {data.timezone.utc && `UTC${data.timezone.utc}`}
            </span>
          </dd>
        </dl>
      </div>
    </section>
  );
};

function decimalToDms(deg: number, isLng: boolean): string {
  const absDeg = Math.abs(deg);
  const d = Math.floor(absDeg);
  const minFloat = (absDeg - d) * 60;
  const m = Math.floor(minFloat);
  const s = Math.round((minFloat - m) * 60);
  const dir = isLng ? (deg >= 0 ? 'E' : 'W') : deg >= 0 ? 'N' : 'S';
  return `${d}°${m}'${s}"${dir}`;
}
