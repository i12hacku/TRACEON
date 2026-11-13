import React from 'react';
import type { IPLocationData } from '../types/ip';
import { AsciiBar, Pane } from './Pane';

interface SecurityScoreCardProps {
  security: IPLocationData['security'];
  target: string;
}

export const SecurityScoreCard: React.FC<SecurityScoreCardProps> = ({ security, target }) => {
  const { threatScore, threatLevel, isDatacenter, isTor, isVpnOrProxy, isBogon, connectionType, riskFactors } = security;

  const tone = threatScore >= 65 ? 't-bad' : threatScore >= 35 ? 't-warn' : 't-ok';

  const summary =
    threatScore < 20
      ? 'Looks like an ordinary ISP connection. No proxy, VPN or hosting flags.'
      : threatScore < 50
      ? 'Traffic comes from a datacenter, VPS or cloud proxy rather than a home ISP.'
      : 'Shows high-anonymity traits such as Tor or an anonymizing proxy.';

  const flag = (on: boolean, yes: string, no: string, bad = 't-warn') => (
    <span className={on ? bad : 't-mute'}>{on ? yes : no}</span>
  );

  return (
    <Pane
      cmd={`threat-score ${target}`}
      actions={<span className={tone}>{threatLevel.toLowerCase()} risk</span>}
      tone={threatScore >= 65 ? 'bad' : undefined}
    >
      <div className="stack">
        <div className="score-row">
          <span className={`big-num ${tone}`}>
            {threatScore}
            <span className="t-mute" style={{ fontSize: '0.5em' }}>
              /100
            </span>
          </span>
          <div>
            <AsciiBar value={threatScore} width={28} className={tone} />
            <div className="t-mute" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>&nbsp;clean</span>
              <span>hostile&nbsp;</span>
            </div>
          </div>
        </div>

        <p>{summary}</p>

        <dl className="kv kv-2">
          <dt>vpn/proxy</dt>
          <dd>{flag(isVpnOrProxy, 'detected', 'none')}</dd>
          <dt>tor exit</dt>
          <dd>{flag(isTor, 'yes', 'no', 't-bad')}</dd>
          <dt>hosting</dt>
          <dd>{flag(isDatacenter, 'datacenter', 'isp')}</dd>
          <dt>range</dt>
          <dd>{flag(isBogon, 'private', 'public')}</dd>
          <dt>link</dt>
          <dd className="t-hi">{connectionType.toLowerCase()}</dd>
        </dl>

        {riskFactors.length > 0 && (
          <ul className="log" aria-label="Findings">
            {riskFactors.map((factor, i) => (
              <li key={i}>
                <span className="t-mute">{String(i + 1).padStart(2, '0')}</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Pane>
  );
};
