import React, { useState } from 'react';
import { cyberSound } from '../services/soundService';
import { Modal } from './Pane';

interface TerminalCLIModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetIP: string;
  onNotify: (text: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export const TerminalCLIModal: React.FC<TerminalCLIModalProps> = ({
  isOpen,
  onClose,
  targetIP,
  onNotify
}) => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const commands = [
    { label: 'geolocation as JSON', cmd: `curl -s https://ipwho.is/${targetIP} | jq` },
    { label: 'reverse DNS', cmd: `dig -x ${targetIP} +short` },
    { label: 'latency', cmd: `ping -c 4 ${targetIP}` },
    { label: 'network path', cmd: `traceroute ${targetIP}` },
    { label: 'registry owner', cmd: `whois ${targetIP}` },
    { label: 'your own IP, plain text', cmd: `curl ifconfig.me` }
  ];

  const handleCopyCmd = (cmd: string, idx: number) => {
    navigator.clipboard.writeText(cmd);
    cyberSound.playClick();
    setCopiedIdx(idx);
    onNotify(`Copied: ${cmd}`, 'success');
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      cmd="cat cheatsheet.sh"
      footer={<span className="t-mute">target {targetIP}</span>}
    >
      <p className="t-mute"># run these yourself to check what this page reports</p>
      <ul className="snippets">
        {commands.map((item, idx) => (
          <li key={idx}>
            <div className="head">
              <span># {item.label}</span>
              <button type="button" className="btn" onClick={() => handleCopyCmd(item.cmd, idx)}>
                {copiedIdx === idx ? 'copied' : 'copy'}
              </button>
            </div>
            <pre>
              <span className="t-mute">$ </span>
              {item.cmd}
            </pre>
          </li>
        ))}
      </ul>
    </Modal>
  );
};
