import React, { useState } from 'react';
import type { DNSRecord } from '../types/ip';
import { LeakService } from '../services/leakService';
import { cyberSound } from '../services/soundService';
import { Pane } from './Pane';

interface DNSLookupCardProps {
  initialDomain?: string;
  onNotify: (text: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

const RECORD_TYPES = ['A', 'AAAA', 'MX', 'TXT', 'CNAME', 'NS'];

export const DNSLookupCard: React.FC<DNSLookupCardProps> = ({ initialDomain, onNotify }) => {
  const [domain, setDomain] = useState<string>(initialDomain || 'cloudflare.com');
  const [recordType, setRecordType] = useState<string>('A');
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasQueried, setHasQueried] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!domain.trim() || isLoading) return;

    setIsLoading(true);
    cyberSound.playScan();
    try {
      const data = await LeakService.queryDNS(domain.trim(), recordType);
      setRecords(data);
      setHasQueried(true);
      cyberSound.playLockOn();
    } catch (err: any) {
      setRecords([]);
      setHasQueried(true);
      cyberSound.playAlert();
      onNotify(err.message || 'DNS query failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAll = () => {
    if (records.length === 0) return;
    const txt = records.map((r) => `${r.name}\t${r.TTL}\tIN\t${r.type}\t${r.data}`).join('\n');
    navigator.clipboard.writeText(txt);
    cyberSound.playClick();
    setCopied(true);
    onNotify(`Copied ${records.length} record(s)`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Pane
      cmd={`dig ${recordType} ${domain || '<domain>'} +https`}
      actions={
        records.length > 0 && (
          <button type="button" className="btn" onClick={handleCopyAll}>
            {copied ? 'copied' : 'copy all'}
          </button>
        )
      }
    >
      <div className="stack">
        <form onSubmit={handleQuery} className="field-row">
          <label htmlFor="dig-domain" className="sr-only">
            Domain
          </label>
          <input
            id="dig-domain"
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            className="field"
            spellCheck={false}
          />
          <div className="seg" role="group" aria-label="Record type">
            {RECORD_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                aria-pressed={recordType === type}
                onClick={() => {
                  cyberSound.playClick();
                  setRecordType(type);
                }}
              >
                {type}
              </button>
            ))}
          </div>
          <button type="submit" className="btn-run" disabled={isLoading || !domain.trim()}>
            {isLoading ? 'querying…' : 'dig'}
          </button>
        </form>

        {records.length > 0 && (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>name</th>
                  <th className="num">ttl</th>
                  <th>type</th>
                  <th>answer</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec, idx) => (
                  <tr key={idx}>
                    <td className="t-mute">{rec.name}</td>
                    <td className="num t-mute">{rec.TTL}</td>
                    <td>{rec.type}</td>
                    <td className="t-hi" style={{ overflowWrap: 'anywhere' }}>
                      {rec.data}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {hasQueried && records.length === 0 && !isLoading && (
          <p className="t-mute">
            ;; no {recordType} records for {domain}. Try another record type.
          </p>
        )}

        {!hasQueried && (
          <p className="t-mute">;; queries go over DNS-over-HTTPS (RFC 8484), straight from your browser.</p>
        )}
      </div>
    </Pane>
  );
};
