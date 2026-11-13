import React, { useState } from 'react';
import { cyberSound } from '../services/soundService';

interface HeaderProps {
  maskedIP: boolean;
  onToggleMaskIP: () => void;
  scanlines: boolean;
  onToggleScanlines: () => void;
  onOpenPrivacy: () => void;
  onOpenExport: () => void;
  onOpenSubnet?: () => void;
  onOpenCLI?: () => void;
  onOpenCompare?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  maskedIP,
  onToggleMaskIP,
  scanlines,
  onToggleScanlines,
  onOpenPrivacy,
  onOpenExport,
  onOpenSubnet,
  onOpenCLI,
  onOpenCompare
}) => {
  const [isMuted, setIsMuted] = useState(cyberSound.getMuted());

  const handleToggleMute = () => {
    const muted = cyberSound.toggleMute();
    setIsMuted(muted);
  };

  const click = (fn?: () => void) => () => {
    cyberSound.playClick();
    fn?.();
  };

  return (
    <header className="topbar">
      <h1 className="brand">
        guest@traceon<span className="t-mute">:~/recon</span>
      </h1>

      <nav className="tools" aria-label="Tools">
        {onOpenSubnet && (
          <button type="button" className="btn" onClick={click(onOpenSubnet)} title="IPv4 subnet calculator">
            ipcalc
          </button>
        )}
        {onOpenCLI && (
          <button type="button" className="btn" onClick={click(onOpenCLI)} title="Copy terminal commands for this IP">
            cheatsheet
          </button>
        )}
        {onOpenCompare && (
          <button type="button" className="btn" onClick={click(onOpenCompare)} title="Compare your IP with the looked-up IP">
            diff
          </button>
        )}
        <button type="button" className="btn" onClick={click(onOpenExport)} title="Export this report as JSON or text">
          export
        </button>

        <span className="t-mute" aria-hidden="true">│</span>

        <button
          type="button"
          className={`btn ${maskedIP ? 'btn-warn' : ''}`}
          aria-pressed={maskedIP}
          onClick={click(onToggleMaskIP)}
          title="Hide the last octets, for screen sharing"
        >
          mask:{maskedIP ? 'on' : 'off'}
        </button>
        <button
          type="button"
          className="btn"
          aria-pressed={scanlines}
          onClick={click(onToggleScanlines)}
          title="CRT scanline overlay"
        >
          crt:{scanlines ? 'on' : 'off'}
        </button>
        <button type="button" className="btn" aria-pressed={!isMuted} onClick={handleToggleMute} title="Interface sounds">
          sound:{isMuted ? 'off' : 'on'}
        </button>
        <button type="button" className="btn" onClick={click(onOpenPrivacy)} title="How this app handles your data">
          privacy
        </button>
      </nav>
    </header>
  );
};
