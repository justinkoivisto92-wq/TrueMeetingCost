import { useState } from 'react';
import { fmtCurrency, fmt } from '../utils/calculations';

function buildText({ attendees, duration, frequency, purpose, totalPerMeeting, totalAnnual, estimatedValue, isOnce }) {
  const lines = [
    'TRUE MEETING COST REPORT',
    '─────────────────────────',
    `Purpose: ${purpose}`,
    `Duration: ${duration} min | Frequency: ${frequency}`,
    `Attendees: ${attendees.length}`,
    '',
    `Cost per Meeting: ${fmtCurrency(totalPerMeeting)}`,
  ];
  if (!isOnce) lines.push(`Annual Cost: ${fmtCurrency(totalAnnual)}`);
  if (estimatedValue) {
    lines.push(`Estimated Value: ${fmtCurrency(estimatedValue)}`);
    lines.push(`ROI Ratio: ${(estimatedValue / totalPerMeeting).toFixed(2)}x`);
  }
  lines.push('', 'Generated at truemeetingcost.com');
  return lines.join('\n');
}

function buildShareUrl({ attendees, duration, frequency, purpose, estimatedValue }) {
  const payload = {
    attendees: attendees.map(a => ({ name: a.name, role: a.role, salary: a.salary })),
    duration,
    frequency,
    purpose,
    estimatedValue,
  };
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  return `${window.location.origin}${window.location.pathname}#share=${encoded}`;
}

export default function ShareCopyButtons({ meetingData }) {
  const [copyLabel, setCopyLabel] = useState('📋 Copy Results');
  const [shareLabel, setShareLabel] = useState('🔗 Share Meeting');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildText(meetingData));
      setCopyLabel('✓ Copied!');
      setTimeout(() => setCopyLabel('📋 Copy Results'), 2200);
    } catch {
      setCopyLabel('Copy failed');
      setTimeout(() => setCopyLabel('📋 Copy Results'), 2200);
    }
  };

  const handleShare = async () => {
    const url = buildShareUrl(meetingData);
    try {
      await navigator.clipboard.writeText(url);
      setShareLabel('✓ Link Copied!');
      setTimeout(() => setShareLabel('🔗 Share Meeting'), 2500);
    } catch {
      setShareLabel('Share failed');
      setTimeout(() => setShareLabel('🔗 Share Meeting'), 2500);
    }
  };

  return (
    <div className="share-copy-bar section-gap">
      <button className="btn btn-ghost" onClick={handleCopy}>{copyLabel}</button>
      <button className="btn btn-ghost" onClick={handleShare}>{shareLabel}</button>
    </div>
  );
}
