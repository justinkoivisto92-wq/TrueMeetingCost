const LABEL_COLOR = { Efficient: '#16a34a', Moderate: '#d97706', 'Needs Attention': '#dc2626' };

function SubScore({ label, score }) {
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626';
  return (
    <div className="eff-subscore">
      <div className="eff-subscore-header">
        <span className="eff-subscore-label">{label}</span>
        <span className="eff-subscore-val" style={{ color }}>{score}</span>
      </div>
      <div className="eff-bar-track">
        <div className="eff-bar-fill" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

export default function EfficiencyScore({ score, label, driverMessage, attendeeScore, durationScore, roiScore }) {
  const color = LABEL_COLOR[label] || '#6b7280';
  const r = 72;
  const cx = 100, cy = 100;
  const circumference = 2 * Math.PI * r;
  const halfCirc = circumference / 2;
  const progressLength = Math.max(0, Math.min((score / 100) * halfCirc, halfCirc - 0.5));

  return (
    <div className="card section-gap">
      <div className="card-title">
        <span className="icon-circle">⚡</span>
        Meeting Efficiency Score
        <span className="pro-badge">PRO</span>
      </div>
      <div className="efficiency-layout">
        <div className="efficiency-gauge-wrap">
          <svg viewBox="0 0 200 115" className="efficiency-gauge">
            <circle
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={14}
              strokeDasharray={`${halfCirc.toFixed(2)} ${halfCirc.toFixed(2)}`}
              strokeLinecap="round"
              transform={`rotate(-180 ${cx} ${cy})`}
            />
            {score > 1 && (
              <circle
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={color}
                strokeWidth={14}
                strokeDasharray={`${progressLength.toFixed(2)} ${(circumference - progressLength).toFixed(2)}`}
                strokeLinecap="round"
                transform={`rotate(-180 ${cx} ${cy})`}
              />
            )}
            <text x={cx} y={cy + 5} textAnchor="middle" fontSize={34} fontWeight={700} fill="#0C447C" fontFamily="Inter, sans-serif">
              {score}
            </text>
            <text x={cx} y={cy + 20} textAnchor="middle" fontSize={11} fill="#9ca3af" fontFamily="Inter, sans-serif">
              out of 100
            </text>
          </svg>
          <div className="efficiency-label" style={{ color }}>{label}</div>
        </div>

        <div className="efficiency-details">
          <div className="eff-subscores">
            <SubScore label="Attendees (30%)" score={attendeeScore} />
            <SubScore label="Duration (30%)" score={durationScore} />
            <SubScore label="ROI (40%)" score={roiScore} />
          </div>
          <div className="eff-driver-box">
            <span className="eff-driver-label">Primary Driver</span>
            <span className="eff-driver-text">{driverMessage}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
