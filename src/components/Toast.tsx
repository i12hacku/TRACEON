import React from 'react';
import type { ToastMessage } from '../types/ip';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const TAG: Record<ToastMessage['type'], { text: string; tone: string }> = {
  info: { text: '[..]', tone: 't-mute' },
  success: { text: '[ok]', tone: 't-ok' },
  warning: { text: '[!!]', tone: 't-warn' },
  error: { text: '[err]', tone: 't-bad' }
};

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((toast) => {
        const tag = TAG[toast.type];
        return (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span>
              <span className={tag.tone}>{tag.text}</span> {toast.text}
            </span>
            <button type="button" className="t-mute" onClick={() => onDismiss(toast.id)} aria-label="Dismiss">
              x
            </button>
          </div>
        );
      })}
    </div>
  );
};
