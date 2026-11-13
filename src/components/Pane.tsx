import React, { useEffect } from 'react';
import { cyberSound } from '../services/soundService';

interface PaneProps {
  cmd: React.ReactNode;
  actions?: React.ReactNode;
  tone?: 'warn' | 'bad';
  className?: string;
  children: React.ReactNode;
}

// A bordered terminal pane whose title is the shell command that produced its output.
export const Pane: React.FC<PaneProps> = ({ cmd, actions, tone, className = '', children }) => (
  <section className={`pane ${tone ? `pane-${tone}` : ''} ${className}`}>
    <header className="pane-bar">
      <h2 className="pane-title">
        <span className="prompt">$</span> {cmd}
      </h2>
      {actions && <div className="pane-actions">{actions}</div>}
    </header>
    {children}
  </section>
);

// Renders a value as a fixed-width ASCII meter, e.g. [######..........]
export const AsciiBar: React.FC<{ value: number; max?: number; width?: number; className?: string }> = ({
  value,
  max = 100,
  width = 24,
  className = ''
}) => {
  const filled = Math.round((Math.min(Math.max(value, 0), max) / max) * width);
  return (
    <span className={`bar ${className}`} aria-hidden="true">
      [<span className="bar-fill">{'#'.repeat(filled)}</span>
      <span className="bar-empty">{'.'.repeat(width - filled)}</span>]
    </span>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  cmd: string;
  width?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, cmd, width = 680, children, footer }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const close = () => {
    cyberSound.playClick();
    onClose();
  };

  return (
    <div className="modal-back" onClick={close}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={cmd}
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-head">
          <span>
            <span className="prompt">$</span> {cmd}
          </span>
          <button type="button" className="btn" onClick={close} aria-label="Close" autoFocus>
            esc
          </button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-foot">{footer}</footer>}
      </div>
    </div>
  );
};

export function maskIP(ip: string): string {
  if (ip.includes(':')) {
    const parts = ip.split(':');
    return `${parts[0]}:${parts[1] || '****'}:****:****`;
  }
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.***`;
  }
  return '***.***.***.***';
}
