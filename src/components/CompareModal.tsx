import React from 'react';
import type { IPLocationData } from '../types/ip';
import { Modal } from './Pane';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  visitorData: IPLocationData | null;
  currentData: IPLocationData | null;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  visitorData,
  currentData
}) => {
  if (!visitorData || !currentData) return null;

  const distanceKm = Math.round(
    calculateDistance(
      visitorData.latitude,
      visitorData.longitude,
      currentData.latitude,
      currentData.longitude
    )
  );
  const distanceMiles = Math.round(distanceKm * 0.621371);
  const isDifferent = visitorData.ip !== currentData.ip;

  const node = (d: IPLocationData) => (
    <dl className="kv">
      <dt>ip</dt>
      <dd className="t-hi">{d.ip}</dd>
      <dt>location</dt>
      <dd>
        {d.city}, {d.region}, {d.country} {d.flag?.emoji}
      </dd>
      <dt>asn</dt>
      <dd>{d.asn}</dd>
      <dt>isp</dt>
      <dd>{d.isp}</dd>
      <dt>threat</dt>
      <dd>
        {d.security.threatScore}/100 <span className="t-mute">{d.security.threatLevel.toLowerCase()}</span>
      </dd>
    </dl>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} cmd="diff you.ip target.ip" width={820}>
      <p>
        {isDifferent ? (
          <>
            The two addresses are <span className="t-hi">{distanceKm.toLocaleString()} km</span>{' '}
            <span className="t-mute">({distanceMiles.toLocaleString()} mi)</span> apart. If the target is your VPN exit,
            that's how far your traffic appears to move.
          </>
        ) : (
          <span className="t-mute">
            Both sides are your own IP. Look up another address, or turn on your VPN and reload, then compare again.
          </span>
        )}
      </p>
      <div className="compare">
        <div>
          <h3>--- a/you.ip</h3>
          {node(visitorData)}
        </div>
        <div className="node-b">
          <h3>+++ b/target.ip</h3>
          {node(currentData)}
        </div>
      </div>
    </Modal>
  );
};

// Haversine distance formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
