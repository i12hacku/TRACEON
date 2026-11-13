import React from 'react';
import { Modal } from './Pane';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} cmd="man traceon-privacy">
      <section>
        <h3 className="t-hi">NAME</h3>
        <p>TRACEON, an IP lookup that runs entirely in your browser.</p>
      </section>

      <section>
        <h3 className="t-hi">DESCRIPTION</h3>
        <p>
          There is no backend. Lookups go straight from your browser to public geolocation and DNS-over-HTTPS APIs
          over HTTPS. Nothing is sent to or stored on a server we run.
        </p>
      </section>

      <section>
        <h3 className="t-hi">FILES</h3>
        <dl className="kv">
          <dt>localStorage</dt>
          <dd>
            Your last 10 lookups and your mask, crt and sound settings. Clear them from history, or with your
            browser's site data settings.
          </dd>
        </dl>
      </section>

      <section>
        <h3 className="t-hi">OPTIONS</h3>
        <dl className="kv">
          <dt>mask</dt>
          <dd>Hides the last two octets so your IP stays off screen shares and streams.</dd>
          <dt>cookies</dt>
          <dd>None. No ads, trackers or fingerprinting scripts.</dd>
        </dl>
      </section>

      <section>
        <h3 className="t-hi">SEE ALSO</h3>
        <p className="t-mute">
          Your public IP reveals your rough city and ISP. To hide it, use a trusted VPN or Tor Browser, and switch to
          encrypted DNS.
        </p>
      </section>
    </Modal>
  );
};
