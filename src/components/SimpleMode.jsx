import { useState, useMemo } from 'react';
import {
  costPerMeeting, annualCost, hoursPerYear, getROIVerdict, getROIInsight,
  fmtCurrency, fmt, FREQUENCY_OPTIONS
} from '../utils/calculations';
import {
  Field, CurrencyInput, NumberInput, DurationSelect, FrequencySelect,
  PurposeSelect, IndustrySelect, ROIVerdict, MetricCard
} from './SharedInputs';
import IndustryBenchmarks from './IndustryBenchmarks';

export default function SimpleMode() {
  const [attendees, setAttendees] = useState('');
  const [salary, setSalary] = useState('');
  const [duration, setDuration] = useState(60);
  const [frequency, setFrequency] = useState('weekly');
  const [purpose, setPurpose] = useState('status');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [industry, setIndustry] = useState('general');

  const calc = useMemo(() => {
    const n = parseFloat(attendees) || 0;
    const s = parseFloat(salary) || 0;
    const d = parseFloat(duration) || 60;
    if (n === 0 || s === 0) return null;

    const perMeeting = costPerMeeting(s, d, n);
    const perMinute = perMeeting / d;
    const annual = annualCost(perMeeting, frequency);
    const hrs = hoursPerYear(d, frequency, n);
    const isOnce = frequency === 'once';

    return { perMeeting, perMinute, annual, hrs, isOnce };
  }, [attendees, salary, duration, frequency]);

  const verdict = useMemo(() => {
    if (!calc || !estimatedValue) return null;
    return getROIVerdict(parseFloat(estimatedValue), calc.perMeeting);
  }, [calc, estimatedValue]);

  const insight = useMemo(() => {
    if (!verdict || !calc) return null;
    return getROIInsight(verdict, parseFloat(estimatedValue), calc.perMeeting, frequency, purpose);
  }, [verdict, calc, estimatedValue, frequency, purpose]);

  const freqLabel = FREQUENCY_OPTIONS.find(f => f.value === frequency)?.label || '';

  return (
    <div>
      {/* Inputs */}
      <div className="card">
        <div className="card-title">
          <span className="icon-circle">⚙</span>
          Meeting Parameters
        </div>

        <div className="grid-3">
          <Field label="Number of Attendees">
            <NumberInput value={attendees} onChange={setAttendees} placeholder="e.g. 8" min={1} />
          </Field>
          <Field label="Average Annual Salary">
            <CurrencyInput value={salary} onChange={setSalary} placeholder="120,000" />
          </Field>
          <Field label="Meeting Duration">
            <DurationSelect value={duration} onChange={v => setDuration(Number(v))} />
          </Field>
        </div>

        <div className="section-gap">
          <div className="grid-4">
            <Field label="Frequency">
              <FrequencySelect value={frequency} onChange={setFrequency} />
            </Field>
            <Field label="Meeting Purpose">
              <PurposeSelect value={purpose} onChange={setPurpose} />
            </Field>
            <Field label="Estimated Value Generated">
              <CurrencyInput value={estimatedValue} onChange={setEstimatedValue} placeholder="e.g. 5,000" />
            </Field>
            <Field label="Your Industry">
              <IndustrySelect value={industry} onChange={setIndustry} />
            </Field>
          </div>
        </div>
      </div>

      {/* Results */}
      {calc && (
        <>
          <div className="section-gap-lg">
            <div className="metrics-grid">
              <MetricCard
                label="Cost per Meeting"
                value={fmtCurrency(calc.perMeeting)}
                sub={`${fmt(calc.perMeeting / (parseFloat(attendees) || 1), 0)} per person`}
              />
              <MetricCard
                label="Cost per Minute"
                value={fmtCurrency(calc.perMinute, 2)}
                sub="every minute counts"
              />
              <MetricCard
                label={calc.isOnce ? 'Total Cost' : 'Annual Cost'}
                value={fmtCurrency(calc.annual)}
                sub={calc.isOnce ? 'one-time' : freqLabel.toLowerCase()}
              />
              <MetricCard
                label={calc.isOnce ? 'Person-Hours' : 'Person-Hours / Year'}
                value={fmt(calc.hrs, 1)}
                sub={calc.isOnce ? `${fmt(calc.hrs / (parseFloat(attendees)||1), 1)} hrs per person` : `${fmt(calc.hrs / (parseFloat(attendees)||1), 1)} hrs per person`}
              />
            </div>
          </div>

          {verdict && (
            <div className="section-gap">
              <ROIVerdict verdict={verdict} insight={insight} />
            </div>
          )}

          {!estimatedValue && (
            <div className="section-gap">
              <p style={{ fontSize: 13, color: 'var(--gray-400)', textAlign: 'center' }}>
                Enter an estimated value generated to see ROI verdict
              </p>
            </div>
          )}

          <IndustryBenchmarks
            attendeeCount={parseFloat(attendees) || 0}
            duration={duration}
            costPerMeeting={calc.perMeeting}
            industry={industry}
          />
        </>
      )}

      {!calc && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--gray-400)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>💡</div>
          <div style={{ fontSize: 14 }}>Enter the number of attendees and average salary to calculate meeting cost.</div>
        </div>
      )}
    </div>
  );
}
