import React, { useState } from 'react';
import { LeakService } from '../services/leakService';
import { cyberSound } from '../services/soundService';
import { Modal } from './Pane';

interface SubnetCalcModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultIP?: string;
  onNotify: (text: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export const SubnetCalcModal: React.FC<SubnetCalcModalProps> = ({
  isOpen,
  onClose,
  defaultIP = '192.168.1.1',
  onNotify
}) => {
  const [ipInput, setIpInput] = useState<string>(defaultIP);
  const [cidr, setCidr] = useState<number>(24);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const result = LeakService.calculateSubnet(ipInput, cidr);

  const handleCopy = () => {
    const summary = `Subnet CIDR: ${result.ip}/${result.cidr}
Netmask: ${result.netmask}
Wildcard: ${result.wildcard}
Network Address: ${result.networkAddress}
Broadcast Address: ${result.broadcastAddress}
Usable Host Range: ${result.firstUsableIP} - ${result.lastUsableIP}
Total Usable Hosts: ${result.usableHosts.toLocaleString()}`;

    navigator.clipboard.writeText(summary);
    cyberSound.playClick();
    setCopied(true);
    onNotify('Subnet summary copied', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      cmd={`ipcalc ${result.ip}/${result.cidr}`}
      width={620}
      footer={
        <>
          <span className="t-mute">
            class {result.ipClass}, {result.isPrivate ? 'private (RFC 1918)' : 'publicly routable'}
          </span>
          <button type="button" className="btn" onClick={handleCopy}>
            {copied ? 'copied' : 'copy summary'}
          </button>
        </>
      }
    >
      <div className="field-row">
        <label htmlFor="ipcalc-ip" className="t-mute">
          address
        </label>
        <input
          id="ipcalc-ip"
          type="text"
          value={ipInput}
          onChange={(e) => setIpInput(e.target.value)}
          placeholder="192.168.1.1"
          className="field"
          spellCheck={false}
        />
        <label htmlFor="ipcalc-cidr" className="t-mute">
          prefix /
        </label>
        <input
          id="ipcalc-cidr"
          type="number"
          min="1"
          max="32"
          value={cidr}
          onChange={(e) => setCidr(Number(e.target.value))}
          className="field field-narrow"
        />
      </div>

      <div className="seg" role="group" aria-label="Common prefixes">
        {[8, 16, 24, 26, 28, 29, 30, 32].map((val) => (
          <button
            key={val}
            type="button"
            aria-pressed={cidr === val}
            onClick={() => {
              cyberSound.playClick();
              setCidr(val);
            }}
          >
            /{val}
          </button>
        ))}
      </div>

      <dl className="kv">
        <dt>netmask</dt>
        <dd>{result.netmask}</dd>
        <dt>wildcard</dt>
        <dd>{result.wildcard}</dd>
        <dt>network</dt>
        <dd className="t-hi">{result.networkAddress}</dd>
        <dt>broadcast</dt>
        <dd className="t-warn">{result.broadcastAddress}</dd>
        <dt>hostmin</dt>
        <dd>{result.firstUsableIP}</dd>
        <dt>hostmax</dt>
        <dd>{result.lastUsableIP}</dd>
        <dt>hosts/net</dt>
        <dd className="t-hi">{result.usableHosts.toLocaleString()}</dd>
      </dl>
    </Modal>
  );
};
