import { fmtCurrency } from '../utils/calculations';

export default function ScenarioModeling({ scenarios, isOnce }) {
  if (!scenarios || scenarios.length === 0) return null;

  return (
    <div className="card section-gap">
      <div className="card-title">
        <span className="icon-circle">🔮</span>
        Scenario Modeling
        <span className="pro-badge">PRO</span>
      </div>
      <div className="scenario-grid">
        {scenarios.map(sc => (
          <div key={sc.key} className={`scenario-card${sc.highlight ? ' scenario-highlight' : ''}`}>
            <div className="scenario-title">{sc.title}</div>
            <div className="scenario-desc">{sc.description}</div>
            <div className="scenario-savings">
              {!isOnce && sc.savingPerMeeting > 0 && (
                <div className="scenario-saving-line">
                  <span className="scenario-saving-label">Per meeting</span>
                  <span className="scenario-saving-val">{fmtCurrency(sc.savingPerMeeting)}</span>
                </div>
              )}
              <div className="scenario-saving-line">
                <span className="scenario-saving-label">{isOnce ? 'Saving' : 'Annual saving'}</span>
                <span className={`scenario-saving-val${sc.highlight ? ' scenario-saving-hero' : ''}`}>
                  {fmtCurrency(isOnce ? sc.savingPerMeeting : sc.annualSaving)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
