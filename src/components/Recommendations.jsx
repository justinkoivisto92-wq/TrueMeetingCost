import { fmtCurrency } from '../utils/calculations';

export default function Recommendations({ recommendations, isOnce }) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="card section-gap">
      <div className="card-title">
        <span className="icon-circle">✅</span>
        Personalized Recommendations
        <span className="pro-badge">PRO</span>
      </div>
      <div className="recs-list">
        {recommendations.map((rec, i) => (
          <div key={i} className="rec-item">
            <div className="rec-number">{i + 1}</div>
            <div className="rec-content">
              <div className="rec-title">{rec.title}</div>
              <div className="rec-detail">{rec.detail}</div>
              {rec.saving != null && (
                <div className="rec-saving">
                  Estimated saving: <strong>{fmtCurrency(rec.saving)}</strong>
                  {!rec.isOnce && ' / year'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
