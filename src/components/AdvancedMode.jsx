import { useState, useMemo, useEffect } from 'react';
import {
  hourlyRate, annualCost, getROIVerdict, getROIInsight,
  fmtCurrency, fmt, FREQUENCY_OPTIONS, getFrequencyMultiplier,
  calcEfficiencyScore, calcScenarios, getRecommendations,
} from '../utils/calculations';
import {
  Field, CurrencyInput, DurationSelect, FrequencySelect,
  PurposeSelect, IndustrySelect, ROIVerdict, MetricCard
} from './SharedInputs';
import EfficiencyScore from './EfficiencyScore';
import IndustryBenchmarks from './IndustryBenchmarks';
import ScenarioModeling from './ScenarioModeling';
import AIAnalysis from './AIAnalysis';
import Recommendations from './Recommendations';
import ShareCopyButtons from './ShareCopyButtons';

let nextId = 1;
function makeAttendee() {
  return { id: nextId++, name: '', role: '', salary: '' };
}

export default function AdvancedMode() {
  const [attendees, setAttendees] = useState([makeAttendee(), makeAttendee()]);
  const [duration, setDuration] = useState(60);
  const [frequency, setFrequency] = useState('weekly');
  const [purpose, setPurpose] = useState('decision');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [roiTab, setRoiTab] = useState('per-meeting');
  const [valueType, setValueType] = useState('per-meeting'); // 'per-meeting' | 'annual'
  const [industry, setIndustry] = useState('general');

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith('#share=')) return;
    try {
      const data = JSON.parse(decodeURIComponent(escape(atob(hash.slice(7)))));
      if (Array.isArray(data.attendees) && data.attendees.length > 0) {
        setAttendees(data.attendees.map(a => ({
          ...makeAttendee(),
          name: a.name || '',
          role: a.role || '',
          salary: String(a.salary || ''),
        })));
      }
      if (data.duration)   setDuration(data.duration);
      if (data.frequency)  setFrequency(data.frequency);
      if (data.purpose)    setPurpose(data.purpose);
      if (data.estimatedValue) setEstimatedValue(String(data.estimatedValue));
      if (data.industry)      setIndustry(data.industry);
    } catch {
      // invalid hash — ignore
    }
  }, []);

  const updateAttendee = (id, field, value) =>
    setAttendees(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));

  const removeAttendee = id =>
    setAttendees(prev => prev.filter(a => a.id !== id));

  const addAttendee = () =>
    setAttendees(prev => [...prev, makeAttendee()]);

  const calc = useMemo(() => {
    const durationHours = duration / 60;
    const valid = attendees.filter(a => parseFloat(a.salary) > 0);
    if (valid.length === 0) return null;

    const rows = valid.map(a => {
      const sal = parseFloat(a.salary) || 0;
      const rate = hourlyRate(sal);
      const mtgCost = rate * durationHours;
      return {
        ...a,
        salary: sal,
        hourlyRate: rate,
        costPerMeeting: mtgCost,
        annualCost: mtgCost * getFrequencyMultiplier(frequency),
      };
    });

    const totalPerMeeting = rows.reduce((s, r) => s + r.costPerMeeting, 0);
    const totalAnnual     = rows.reduce((s, r) => s + r.annualCost, 0);
    const totalHours      = (duration / 60) * getFrequencyMultiplier(frequency) * valid.length;
    const costPerMinute   = totalPerMeeting / duration;
    const isOnce          = frequency === 'once';

    return { rows, totalPerMeeting, totalAnnual, totalHours, costPerMinute, isOnce };
  }, [attendees, duration, frequency]);

  const freqLabel = FREQUENCY_OPTIONS.find(f => f.value === frequency)?.label || '';

  const evNum = parseFloat(estimatedValue) || null;

  // Normalize to per-meeting and annual values regardless of which the user entered
  const evPerMeeting = useMemo(() => {
    if (!evNum) return null;
    if (valueType === 'per-meeting') return evNum;
    const mult = getFrequencyMultiplier(frequency);
    return mult > 1 ? evNum / mult : evNum;
  }, [evNum, valueType, frequency]);

  const evAnnual = useMemo(() => {
    if (!evNum || frequency === 'once') return null;
    if (valueType === 'annual') return evNum;
    return evNum * getFrequencyMultiplier(frequency);
  }, [evNum, valueType, frequency]);

  const perMeetingVerdict = useMemo(() => {
    if (!calc || !evPerMeeting) return null;
    return getROIVerdict(evPerMeeting, calc.totalPerMeeting);
  }, [calc, evPerMeeting]);

  const annualVerdict = useMemo(() => {
    if (!calc || !evAnnual) return null;
    return getROIVerdict(evAnnual, calc.totalAnnual);
  }, [calc, evAnnual]);

  const perMeetingInsight = useMemo(() => {
    if (!perMeetingVerdict || !calc || !evPerMeeting) return null;
    return getROIInsight(perMeetingVerdict, evPerMeeting, calc.totalPerMeeting, frequency, purpose);
  }, [perMeetingVerdict, calc, evPerMeeting, frequency, purpose]);

  const annualInsight = useMemo(() => {
    if (!annualVerdict || !calc || !evAnnual) return null;
    return getROIInsight(annualVerdict, evAnnual, calc.totalAnnual, frequency, purpose);
  }, [annualVerdict, calc, evAnnual, frequency, purpose]);

  const efficiencyScore = useMemo(() => {
    if (!calc) return null;
    return calcEfficiencyScore(calc.rows.length, duration, calc.totalPerMeeting, evPerMeeting);
  }, [calc, duration, evPerMeeting]);

  const scenarios = useMemo(() => {
    if (!calc) return [];
    return calcScenarios(calc.rows, calc.totalPerMeeting, calc.totalAnnual, frequency, duration);
  }, [calc, frequency, duration]);

  const recommendations = useMemo(() => {
    if (!calc) return [];
    return getRecommendations(calc.rows, calc.totalPerMeeting, calc.totalAnnual, frequency, duration, evPerMeeting, industry);
  }, [calc, frequency, duration, evPerMeeting, industry]);

  const meetingData = useMemo(() => {
    if (!calc) return null;
    return {
      attendees: calc.rows,
      duration,
      frequency,
      purpose,
      industry,
      totalPerMeeting: calc.totalPerMeeting,
      totalAnnual:     calc.totalAnnual,
      estimatedValue:  evPerMeeting,
      isOnce:          calc.isOnce,
    };
  }, [calc, duration, frequency, purpose, industry, evPerMeeting]);

  return (
    <div>
      {/* ── Meeting settings ── */}
      <div className="card">
        <div className="card-title">
          <span className="icon-circle">⚙</span>
          Meeting Settings
        </div>
        <div className="grid-4">
          <Field label="Duration">
            <DurationSelect value={duration} onChange={v => setDuration(Number(v))} />
          </Field>
          <Field label="Frequency">
            <FrequencySelect value={frequency} onChange={setFrequency} />
          </Field>
          <Field label="Meeting Purpose">
            <PurposeSelect value={purpose} onChange={setPurpose} />
          </Field>
          <Field label="Your Industry">
            <IndustrySelect value={industry} onChange={setIndustry} />
          </Field>
        </div>
        <div className="section-gap">
          <div className="field" style={{ maxWidth: 400 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label className="field-label" style={{ margin: 0 }}>Estimated Value Generated</label>
              <div className="value-type-toggle">
                <button type="button" className={`vt-btn${valueType === 'per-meeting' ? ' active' : ''}`} onClick={() => setValueType('per-meeting')}>Per meeting</button>
                <button type="button" className={`vt-btn${valueType === 'annual' ? ' active' : ''}`} onClick={() => setValueType('annual')}>Annual</button>
              </div>
            </div>
            <CurrencyInput value={estimatedValue} onChange={setEstimatedValue} placeholder="e.g. 10,000" />
          </div>
        </div>
      </div>

      {/* ── Attendees ── */}
      <div className="card section-gap">
        <div className="card-title">
          <span className="icon-circle">👥</span>
          Attendees
          <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--gray-400)', fontWeight: 400 }}>
            {attendees.length} {attendees.length === 1 ? 'person' : 'people'}
          </span>
        </div>

        <div className="attendee-list">
          {attendees.map((a, idx) => (
            <div className="attendee-row" key={a.id}>
              <div className="field">
                <label className="field-label">Name</label>
                <input
                  type="text"
                  className="field-input"
                  value={a.name}
                  onChange={e => updateAttendee(a.id, 'name', e.target.value)}
                  placeholder={`Attendee ${idx + 1}`}
                />
              </div>
              <div className="field">
                <label className="field-label">Role / Title</label>
                <input
                  type="text"
                  className="field-input"
                  value={a.role}
                  onChange={e => updateAttendee(a.id, 'role', e.target.value)}
                  placeholder="e.g. VP Sales"
                />
              </div>
              <div className="field">
                <label className="field-label">Annual Salary</label>
                <CurrencyInput
                  value={a.salary}
                  onChange={v => updateAttendee(a.id, 'salary', v)}
                  placeholder="120,000"
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  className="btn-danger-ghost"
                  onClick={() => removeAttendee(a.id)}
                  disabled={attendees.length <= 1}
                  style={{ opacity: attendees.length <= 1 ? 0.3 : 1 }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16 }}>
          <button className="btn btn-outline" onClick={addAttendee}>+ Add Attendee</button>
        </div>
      </div>

      {/* ── Results ── */}
      {calc && (
        <>
          {/* Metrics */}
          <div className="section-gap-lg">
            <div className="metrics-grid">
              <MetricCard
                label="Cost per Meeting"
                value={fmtCurrency(calc.totalPerMeeting)}
                sub={`${fmtCurrency(calc.totalPerMeeting / calc.rows.length)} avg per person`}
              />
              <MetricCard
                label="Cost per Minute"
                value={fmtCurrency(calc.costPerMinute, 2)}
                sub="across all attendees"
              />
              <MetricCard
                label={calc.isOnce ? 'Total Cost' : 'Annual Cost'}
                value={fmtCurrency(calc.totalAnnual)}
                sub={calc.isOnce ? 'one-time' : freqLabel.toLowerCase()}
              />
              <MetricCard
                label={calc.isOnce ? 'Person-Hours' : 'Person-Hours / Year'}
                value={fmt(calc.totalHours, 1)}
                sub={`${fmt((duration / 60) * getFrequencyMultiplier(frequency), 1)} hrs per person`}
              />
            </div>
          </div>

          {/* Breakdown by attendee */}
          <div className="card section-gap">
            <div className="card-title">
              <span className="icon-circle">📊</span>
              Cost Breakdown by Attendee
            </div>
            <table className="breakdown-table">
              <thead>
                <tr>
                  <th>Name / Role</th>
                  <th>Annual Salary</th>
                  <th>Hourly Rate</th>
                  <th>Cost / Meeting</th>
                  <th>{calc.isOnce ? 'Total' : 'Annual Cost'}</th>
                  <th>% of Total</th>
                </tr>
              </thead>
              <tbody>
                {calc.rows.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--gray-800)' }}>{r.name || 'Attendee'}</div>
                      {r.role && <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{r.role}</div>}
                    </td>
                    <td>{fmtCurrency(r.salary)}</td>
                    <td>{fmtCurrency(r.hourlyRate, 2)}/hr</td>
                    <td>{fmtCurrency(r.costPerMeeting, 2)}</td>
                    <td>{fmtCurrency(r.annualCost)}</td>
                    <td>{fmt((r.costPerMeeting / calc.totalPerMeeting) * 100, 1)}%</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td colSpan={3}>Total ({calc.rows.length} attendees)</td>
                  <td>{fmtCurrency(calc.totalPerMeeting)}</td>
                  <td>{fmtCurrency(calc.totalAnnual)}</td>
                  <td>100%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ROI Analysis */}
          {estimatedValue && (perMeetingVerdict || annualVerdict) && (
            <div className="card section-gap">
              <div className="card-title">
                <span className="icon-circle">📈</span>
                ROI Analysis
              </div>

              {!calc.isOnce && (
                <div className="tab-bar">
                  <button className={`tab-btn ${roiTab === 'per-meeting' ? 'active' : ''}`} onClick={() => setRoiTab('per-meeting')}>
                    Per Meeting
                  </button>
                  <button className={`tab-btn ${roiTab === 'annual' ? 'active' : ''}`} onClick={() => setRoiTab('annual')}>
                    Annual View
                  </button>
                </div>
              )}

              {(calc.isOnce || roiTab === 'per-meeting') && perMeetingVerdict && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13, color: 'var(--gray-500)' }}>
                    <span>Value generated: <strong style={{ color: 'var(--gray-800)' }}>{fmtCurrency(evPerMeeting)}</strong></span>
                    <span>Meeting cost: <strong style={{ color: 'var(--gray-800)' }}>{fmtCurrency(calc.totalPerMeeting)}</strong></span>
                    <span>Net: <strong style={{ color: evPerMeeting - calc.totalPerMeeting >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {fmtCurrency(evPerMeeting - calc.totalPerMeeting)}
                    </strong></span>
                  </div>
                  <ROIVerdict verdict={perMeetingVerdict} insight={perMeetingInsight} />
                </div>
              )}

              {!calc.isOnce && roiTab === 'annual' && annualVerdict && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13, color: 'var(--gray-500)' }}>
                    <span>Annual value: <strong style={{ color: 'var(--gray-800)' }}>{fmtCurrency(evAnnual)}</strong></span>
                    <span>Annual cost: <strong style={{ color: 'var(--gray-800)' }}>{fmtCurrency(calc.totalAnnual)}</strong></span>
                    <span>Annual net: <strong style={{ color: evAnnual - calc.totalAnnual >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmtCurrency(evAnnual - calc.totalAnnual)}</strong></span>
                  </div>
                  <ROIVerdict verdict={annualVerdict} insight={annualInsight} />
                </div>
              )}
            </div>
          )}

          {!estimatedValue && (
            <div className="section-gap">
              <p style={{ fontSize: 13, color: 'var(--gray-400)', textAlign: 'center' }}>
                Enter an estimated value generated to see ROI analysis
              </p>
            </div>
          )}

          {/* ── PRO: Meeting Efficiency Score ── */}
          {efficiencyScore && (
            <EfficiencyScore
              score={efficiencyScore.score}
              label={efficiencyScore.label}
              driverMessage={efficiencyScore.driverMessage}
              attendeeScore={efficiencyScore.attendeeScore}
              durationScore={efficiencyScore.durationScore}
              roiScore={efficiencyScore.roiScore}
            />
          )}

          {/* ── PRO: Industry Benchmarks ── */}
          <IndustryBenchmarks
            attendeeCount={calc.rows.length}
            duration={duration}
            costPerMeeting={calc.totalPerMeeting}
            industry={industry}
          />

          {/* ── PRO: Scenario Modeling ── */}
          {scenarios.length > 0 && (
            <ScenarioModeling scenarios={scenarios} isOnce={calc.isOnce} />
          )}

          {/* ── PRO: AI-Generated Analysis ── */}
          {meetingData && <AIAnalysis meetingData={meetingData} />}

          {/* ── PRO: Personalized Recommendations ── */}
          {recommendations.length > 0 && (
            <Recommendations recommendations={recommendations} isOnce={calc.isOnce} />
          )}

          {/* ── PRO: Copy Results + Share ── */}
          {meetingData && <ShareCopyButtons meetingData={meetingData} />}
        </>
      )}

      {!calc && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--gray-400)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
          <div style={{ fontSize: 14 }}>Add attendees with salaries to calculate the true cost of this meeting.</div>
        </div>
      )}
    </div>
  );
}
