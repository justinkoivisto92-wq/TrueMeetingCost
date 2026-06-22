import { useState, useMemo } from 'react';
import { hourlyRate, fmtCurrency, fmt } from '../utils/calculations';
import { Field, CurrencyInput, NumberInput, MetricCard } from './SharedInputs';

export default function MyFootprintMode() {
  const [salary, setSalary] = useState('');
  const [meetingHoursPerWeek, setMeetingHoursPerWeek] = useState('');
  const [weeksWorked, setWeeksWorked] = useState('48');
  const [valuablePercent, setValuablePercent] = useState('60');

  const calc = useMemo(() => {
    const s = parseFloat(salary) || 0;
    const mhpw = parseFloat(meetingHoursPerWeek) || 0;
    const ww = parseFloat(weeksWorked) || 48;
    const vp = parseFloat(valuablePercent) || 60;

    if (s === 0 || mhpw === 0) return null;

    const rate = hourlyRate(s);
    const hoursPerYear = mhpw * ww;
    const salaryCostInMeetings = rate * hoursPerYear;
    const pctOfSalary = (salaryCostInMeetings / s) * 100;
    const workWeeksEquivalent = hoursPerYear / 40;
    const unproductiveCost = salaryCostInMeetings * (1 - vp / 100);
    const shortMeetingsSaving = salaryCostInMeetings * 0.20;
    const shortMeetingsHours = hoursPerYear * 0.20;

    return {
      rate,
      hoursPerYear,
      salaryCostInMeetings,
      pctOfSalary,
      workWeeksEquivalent,
      unproductiveCost,
      shortMeetingsSaving,
      shortMeetingsHours,
      vp,
      mhpw,
      ww,
    };
  }, [salary, meetingHoursPerWeek, weeksWorked, valuablePercent]);

  return (
    <div>
      <div className="card">
        <div className="card-title">
          <span className="icon-circle">👤</span>
          Your Work Profile
        </div>

        <div className="grid-2">
          <Field label="Your Annual Salary">
            <CurrencyInput value={salary} onChange={setSalary} placeholder="120,000" />
          </Field>
          <Field label="Meeting Hours per Week">
            <NumberInput value={meetingHoursPerWeek} onChange={setMeetingHoursPerWeek} placeholder="e.g. 10" min={0} />
          </Field>
        </div>

        <div className="section-gap">
          <div className="grid-2">
            <Field label="Weeks Worked per Year">
              <NumberInput value={weeksWorked} onChange={setWeeksWorked} placeholder="48" min={1} />
            </Field>
            <Field label="% of Meetings You Find Valuable">
              <div className="field-input-wrap">
                <input
                  type="number"
                  className="field-input"
                  style={{ paddingRight: 28 }}
                  value={valuablePercent}
                  onChange={e => setValuablePercent(e.target.value)}
                  placeholder="60"
                  min={0}
                  max={100}
                />
                <span style={{
                  position: 'absolute', right: 10, top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--gray-400)',
                  fontSize: 14, pointerEvents: 'none'
                }}>%</span>
              </div>
            </Field>
          </div>
        </div>
      </div>

      {calc && (
        <>
          <div className="section-gap-lg">
            <div className="metrics-grid">
              <MetricCard
                label="Salary Spent in Meetings"
                value={fmtCurrency(calc.salaryCostInMeetings)}
                sub="per year"
              />
              <MetricCard
                label="% of Salary"
                value={`${fmt(calc.pctOfSalary, 1)}%`}
                sub="of your annual comp"
              />
              <MetricCard
                label="Hours per Year"
                value={fmt(calc.hoursPerYear, 0)}
                sub={`${fmt(calc.mhpw, 1)} hrs/week × ${calc.ww} weeks`}
              />
              <MetricCard
                label="Equivalent Work Weeks"
                value={fmt(calc.workWeeksEquivalent, 1)}
                sub="full weeks in meetings"
              />
            </div>
          </div>

          <div className="section-gap">
            <div className="metrics-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <MetricCard
                label="Unproductive Meeting Cost"
                value={fmtCurrency(calc.unproductiveCost)}
                sub={`${100 - calc.vp}% of meetings you find not valuable`}
              />
              <MetricCard
                label="Valuable Meeting Cost"
                value={fmtCurrency(calc.salaryCostInMeetings - calc.unproductiveCost)}
                sub={`${calc.vp}% of meetings generating real value`}
              />
            </div>
          </div>

          {/* 20% shorter insight */}
          <div className="footprint-insight section-gap">
            <div className="insight-label">💡 If Your Meetings Were 20% Shorter</div>
            <div className="insight-text">
              You'd save <strong>{fmtCurrency(calc.shortMeetingsSaving)}</strong> in salary
              and reclaim <strong>{fmt(calc.shortMeetingsHours, 0)} hours</strong> per year —
              that's {fmt(calc.shortMeetingsHours / 40, 1)} full work weeks returned to deep work.
              {calc.pctOfSalary > 20 &&
                ` With ${fmt(calc.pctOfSalary, 0)}% of your salary going to meetings, even small reductions compound quickly.`
              }
            </div>
          </div>

          {/* Contextual breakdown */}
          <div className="card section-gap">
            <div className="card-title">
              <span className="icon-circle">📋</span>
              Your Meeting Footprint at a Glance
            </div>
            <table className="breakdown-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                  <th>Context</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Hourly rate (fully-loaded)</td>
                  <td style={{ fontWeight: 600 }}>{fmtCurrency(calc.rate, 2)}/hr</td>
                  <td style={{ color: 'var(--gray-500)', fontSize: 12 }}>Based on 2,080 working hours/year</td>
                </tr>
                <tr>
                  <td>Daily meeting time</td>
                  <td style={{ fontWeight: 600 }}>{fmt(calc.mhpw / 5, 1)} hrs/day</td>
                  <td style={{ color: 'var(--gray-500)', fontSize: 12 }}>Assuming 5-day work week</td>
                </tr>
                <tr>
                  <td>Total annual meeting cost</td>
                  <td style={{ fontWeight: 600 }}>{fmtCurrency(calc.salaryCostInMeetings)}</td>
                  <td style={{ color: 'var(--gray-500)', fontSize: 12 }}>{fmt(calc.pctOfSalary, 1)}% of your {fmtCurrency(parseFloat(salary))} salary</td>
                </tr>
                <tr>
                  <td>Value lost to poor meetings</td>
                  <td style={{ fontWeight: 600, color: 'var(--red)' }}>{fmtCurrency(calc.unproductiveCost)}</td>
                  <td style={{ color: 'var(--gray-500)', fontSize: 12 }}>Meetings you rated as not valuable</td>
                </tr>
                <tr>
                  <td>Potential saving (20% shorter)</td>
                  <td style={{ fontWeight: 600, color: 'var(--green)' }}>{fmtCurrency(calc.shortMeetingsSaving)}</td>
                  <td style={{ color: 'var(--gray-500)', fontSize: 12 }}>Without eliminating any meetings</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      {!calc && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--gray-400)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>👤</div>
          <div style={{ fontSize: 14 }}>Enter your salary and meeting hours per week to see your personal meeting footprint.</div>
        </div>
      )}
    </div>
  );
}
