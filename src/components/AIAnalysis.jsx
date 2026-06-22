import { useState } from 'react';

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || '';

const PURPOSE_LABELS = {
  deal: 'Close a Deal', decision: 'Make a Key Decision', strategy: 'Strategic Planning',
  status: 'Status Update', brainstorm: 'Brainstorming Session', training: 'Training Session', other: 'Meeting',
};

function buildPrompt({ attendees, duration, frequency, purpose, totalPerMeeting, totalAnnual, estimatedValue, isOnce }) {
  const purposeLabel = PURPOSE_LABELS[purpose] || 'Meeting';
  const nameList = attendees.map(a => a.name || 'Attendee').join(', ');
  const roiLine = estimatedValue
    ? `Estimated value per meeting: $${estimatedValue.toFixed(0)} | ROI ratio: ${(estimatedValue / totalPerMeeting).toFixed(2)}x`
    : 'No estimated value provided';
  const annualLine = isOnce ? 'One-time meeting' : `Annual cost: $${totalAnnual.toFixed(0)} (${frequency})`;

  return `You are a senior management consultant specializing in organizational effectiveness. Analyze this meeting and write a concise 3-paragraph executive memo (150–200 words total). Write in plain, direct language for a senior executive audience. No bullet points. No headers. Do not repeat the raw data verbatim — synthesize it into insight.

Meeting data:
- Purpose: ${purposeLabel}
- Attendees: ${attendees.length} people (${nameList})
- Duration: ${duration} minutes
- Cost per meeting: $${totalPerMeeting.toFixed(0)}
- ${annualLine}
- ${roiLine}

Paragraph 1: Overall assessment — is this meeting earning its keep? Be specific about the cost numbers.
Paragraph 2: The single most impactful optimization opportunity with an estimated dollar impact.
Paragraph 3: One concrete action the meeting organizer can take this week to improve outcomes.`;
}

export default function AIAnalysis({ meetingData }) {
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!API_KEY) {
      setError('AI analysis is not yet configured. Check back soon.');
      return;
    }
    setLoading(true);
    setError('');
    setMemo('');

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 512,
          messages: [{ role: 'user', content: buildPrompt(meetingData) }],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `API error ${res.status}`);
      }

      const data = await res.json();
      setMemo(data.content?.[0]?.text || '');
    } catch (e) {
      setError(e.message || 'Failed to generate analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card section-gap">
      <div className="card-title">
        <span className="icon-circle">🤖</span>
        AI-Generated Analysis
        <span className="pro-badge">PRO</span>
      </div>

      <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 16, lineHeight: 1.55 }}>
        Generate a consultant-style executive memo based on your actual meeting inputs — attendee cost, duration, ROI, and purpose — powered by Claude AI.
      </p>

      <button className="btn btn-primary" onClick={generate} disabled={loading} style={{ minWidth: 180 }}>
        {loading ? 'Generating…' : 'Generate Analysis'}
      </button>

      {error && <div className="ai-error" style={{ marginTop: 14 }}>{error}</div>}

      {memo && (
        <div className="ai-memo" style={{ marginTop: 16 }}>
          {memo.split('\n\n').filter(Boolean).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      )}
    </div>
  );
}
