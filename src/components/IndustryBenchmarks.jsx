import { fmtCurrency, fmt } from '../utils/calculations';
import { INDUSTRY_BENCHMARKS, getIndustryLabel } from '../utils/industryData';

function BenchmarkBar({ label, value, displayFn, industryAvg, optLow, optHigh }) {
  const maxVal = Math.max(value, industryAvg, optHigh || 0) * 1.55;
  const pct = v => Math.min((v / maxVal) * 100, 97);

  const yourPct = pct(value);
  const avgPct  = pct(industryAvg);
  const optLowPct  = optLow  != null ? pct(optLow)  : null;
  const optHighPct = optHigh != null ? pct(optHigh) : null;

  const isInOptimal = optLow != null && value >= optLow && value <= optHigh;
  const diff = value - industryAvg;
  const pctDiff = Math.abs(Math.round((diff / industryAvg) * 100));

  let callout, calloutColor;
  if (isInOptimal) {
    callout = '✓ In optimal range';
    calloutColor = '#16a34a';
  } else if (diff < 0) {
    callout = `${displayFn(Math.abs(diff))} below industry avg — good`;
    calloutColor = '#16a34a';
  } else {
    callout = `${displayFn(diff)} above industry avg (${pctDiff}% over)`;
    calloutColor = '#dc2626';
  }

  return (
    <div className="benchmark-item">
      <div className="benchmark-header">
        <span className="benchmark-label">{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="benchmark-your-val">{displayFn(value)}</span>
          <span className="benchmark-callout" style={{ color: calloutColor }}>{callout}</span>
        </div>
      </div>

      <div className="benchmark-bar-wrap">
        <div className="benchmark-track" />

        {optLowPct != null && (
          <div className="benchmark-opt-zone" style={{
            left: `${optLowPct}%`,
            width: `${optHighPct - optLowPct}%`,
          }} />
        )}

        <div className="benchmark-avg-marker" style={{ left: `${avgPct}%` }}>
          <span className="bm-mlabel">avg {displayFn(industryAvg)}</span>
        </div>

        {optLowPct != null && (
          <div className="benchmark-opt-label" style={{ left: `${(optLowPct + optHighPct) / 2}%` }}>
            optimal
          </div>
        )}

        <div className="benchmark-your-dot" style={{ left: `${yourPct}%` }}>
          <span className="bm-mlabel bm-your-mlabel">yours</span>
        </div>
      </div>
    </div>
  );
}

export default function IndustryBenchmarks({ attendeeCount, duration, costPerMeeting, industry = 'general' }) {
  const bm = INDUSTRY_BENCHMARKS[industry] || INDUSTRY_BENCHMARKS.general;
  const industryLabel = getIndustryLabel(industry);

  return (
    <div className="card section-gap">
      <div className="card-title">
        <span className="icon-circle">📊</span>
        Industry Benchmarks
        <span className="pro-badge">PRO</span>
      </div>
      <div className="benchmarks-list">
        <BenchmarkBar
          label="Attendees"
          value={attendeeCount}
          displayFn={v => `${fmt(v, 0)} people`}
          industryAvg={bm.avgAttendees}
          optLow={bm.optAttendeesLow}
          optHigh={bm.optAttendeesHigh}
        />
        <BenchmarkBar
          label="Duration"
          value={duration}
          displayFn={v => `${fmt(v, 0)} min`}
          industryAvg={bm.avgDuration}
          optLow={bm.optDurationLow}
          optHigh={bm.optDurationHigh}
        />
        <BenchmarkBar
          label="Cost per Meeting"
          value={costPerMeeting}
          displayFn={v => fmtCurrency(v)}
          industryAvg={bm.avgCost}
          optLow={null}
          optHigh={null}
        />
      </div>
      <p className="benchmark-source">
        Benchmarks based on {industryLabel} industry research — avg {bm.avgAttendees} attendees,{' '}
        {bm.avgDuration} min duration, ~{fmtCurrency(bm.avgCost)}/meeting.
      </p>
    </div>
  );
}
