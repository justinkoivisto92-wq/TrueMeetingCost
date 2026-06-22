import { DURATION_OPTIONS, FREQUENCY_OPTIONS, PURPOSE_OPTIONS } from '../utils/calculations';
import { INDUSTRY_OPTIONS } from '../utils/industryData';

export function Field({ label, children }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

export function CurrencyInput({ value, onChange, placeholder = '0' }) {
  return (
    <div className="field-input-wrap">
      <span className="field-prefix">$</span>
      <input
        type="number"
        className="field-input has-prefix"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        min="0"
      />
    </div>
  );
}

export function NumberInput({ value, onChange, placeholder = '0', min = 0 }) {
  return (
    <input
      type="number"
      className="field-input"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
    />
  );
}

export function Select({ value, onChange, options }) {
  return (
    <select
      className="field-input"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

export function DurationSelect({ value, onChange }) {
  return (
    <Select value={value} onChange={onChange} options={DURATION_OPTIONS.map(d => ({ value: d.value, label: d.label }))} />
  );
}

export function FrequencySelect({ value, onChange }) {
  return (
    <Select value={value} onChange={onChange} options={FREQUENCY_OPTIONS.map(f => ({ value: f.value, label: f.label }))} />
  );
}

export function PurposeSelect({ value, onChange }) {
  return (
    <Select value={value} onChange={onChange} options={PURPOSE_OPTIONS.map(p => ({ value: p.value, label: p.label }))} />
  );
}

export function IndustrySelect({ value, onChange }) {
  return (
    <Select value={value} onChange={onChange} options={INDUSTRY_OPTIONS} />
  );
}

export function ROIVerdict({ verdict, insight }) {
  if (!verdict) return null;
  const labels = { positive: 'Positive ROI', marginal: 'Marginal ROI', negative: 'Negative ROI' };
  return (
    <div className={`roi-card ${verdict}`}>
      <span className={`roi-badge ${verdict}`}>{labels[verdict]}</span>
      <div className="roi-content">
        <div className="roi-insight">{insight}</div>
      </div>
    </div>
  );
}

export function MetricCard({ label, value, sub }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  );
}
