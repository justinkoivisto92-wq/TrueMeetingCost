export const DURATION_OPTIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 180, label: '3 hours' },
  { value: 240, label: '4 hours' },
];

export const FREQUENCY_OPTIONS = [
  { value: 'once', label: 'One-time', multiplier: 1 },
  { value: 'weekly', label: 'Weekly', multiplier: 52 },
  { value: 'biweekly', label: 'Bi-weekly', multiplier: 26 },
  { value: 'monthly', label: 'Monthly', multiplier: 12 },
  { value: 'quarterly', label: 'Quarterly', multiplier: 4 },
];

export const PURPOSE_OPTIONS = [
  { value: 'deal', label: 'Close a deal' },
  { value: 'decision', label: 'Make a key decision' },
  { value: 'strategy', label: 'Strategic planning' },
  { value: 'status', label: 'Status update' },
  { value: 'brainstorm', label: 'Brainstorming' },
  { value: 'training', label: 'Training' },
  { value: 'other', label: 'Other' },
];

export const HOURS_PER_YEAR = 2080; // 52 weeks * 40 hours

export function hourlyRate(annualSalary) {
  return annualSalary / HOURS_PER_YEAR;
}

export function costPerMeeting(annualSalary, durationMinutes, numAttendees) {
  const hours = durationMinutes / 60;
  return hourlyRate(annualSalary) * hours * numAttendees;
}

export function getFrequencyMultiplier(frequencyValue) {
  const opt = FREQUENCY_OPTIONS.find(f => f.value === frequencyValue);
  return opt ? opt.multiplier : 1;
}

export function getFrequencyLabel(frequencyValue) {
  const opt = FREQUENCY_OPTIONS.find(f => f.value === frequencyValue);
  return opt ? opt.label : '';
}

export function annualCost(costPerMtg, frequencyValue) {
  return costPerMtg * getFrequencyMultiplier(frequencyValue);
}

export function hoursPerYear(durationMinutes, frequencyValue, numAttendees) {
  return (durationMinutes / 60) * getFrequencyMultiplier(frequencyValue) * numAttendees;
}

export function getROIVerdict(estimatedValue, cost) {
  if (!estimatedValue || !cost || cost === 0) return null;
  const ratio = estimatedValue / cost;
  if (ratio >= 1.2) return 'positive';
  if (ratio >= 0.8) return 'marginal';
  return 'negative';
}

export function getROIInsight(verdict, estimatedValue, cost, frequency, purpose) {
  const freqLabel = getFrequencyLabel(frequency).toLowerCase();
  const roi = cost > 0 ? ((estimatedValue - cost) / cost * 100).toFixed(0) : 0;
  const purposeMap = {
    deal: 'sales meeting',
    decision: 'decision meeting',
    strategy: 'strategy session',
    status: 'status update',
    brainstorm: 'brainstorming session',
    training: 'training session',
    other: 'meeting',
  };
  const purposeLabel = purposeMap[purpose] || 'meeting';

  if (verdict === 'positive') {
    return `This ${purposeLabel} is delivering strong returns — ${roi}% ROI means every dollar spent generates $${(estimatedValue / cost).toFixed(2)} in value. ${freqLabel !== 'one-time' ? `At ${freqLabel} frequency, this is one of your highest-value recurring investments.` : 'Well structured and worth the time invested.'}`;
  }
  if (verdict === 'marginal') {
    return `This ${purposeLabel} is breaking even — the value generated barely covers its cost. Consider tightening the agenda, reducing duration, or cutting the attendee list to shift this into positive ROI territory.`;
  }
  return `This ${purposeLabel} is costing more than it generates. The gap between value ($${fmt(estimatedValue)}) and cost ($${fmt(cost)}) suggests a structural issue — either the purpose is unclear, the wrong people are in the room, or the outcome isn't being captured effectively.`;
}

export function fmt(n, decimals = 0) {
  if (n === undefined || n === null || isNaN(n)) return '—';
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function fmtCurrency(n, decimals = 0) {
  if (n === undefined || n === null || isNaN(n)) return '—';
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function calcEfficiencyScore(attendeeCount, durationMinutes, totalPerMeeting, estimatedValue) {
  let attendeeScore;
  if (attendeeCount <= 5) attendeeScore = 100;
  else if (attendeeCount === 6) attendeeScore = 78;
  else if (attendeeCount === 7) attendeeScore = 58;
  else if (attendeeCount === 8) attendeeScore = 40;
  else if (attendeeCount === 9) attendeeScore = 26;
  else attendeeScore = Math.max(10, 26 - (attendeeCount - 9) * 5);

  let durationScore;
  if (durationMinutes <= 45) durationScore = 100;
  else if (durationMinutes === 60) durationScore = 76;
  else if (durationMinutes === 90) durationScore = 50;
  else if (durationMinutes === 120) durationScore = 30;
  else if (durationMinutes === 180) durationScore = 14;
  else durationScore = 8;

  let roiScore = 65;
  if (estimatedValue && totalPerMeeting > 0) {
    const ratio = estimatedValue / totalPerMeeting;
    if (ratio >= 3.0) roiScore = 100;
    else if (ratio >= 2.0) roiScore = 88;
    else if (ratio >= 1.5) roiScore = 76;
    else if (ratio >= 1.2) roiScore = 64;
    else if (ratio >= 0.8) roiScore = 38;
    else roiScore = 16;
  }

  const score = Math.round(attendeeScore * 0.3 + durationScore * 0.3 + roiScore * 0.4);

  const scoreItems = [
    { key: 'attendees', val: attendeeScore },
    { key: 'duration', val: durationScore },
    { key: 'roi', val: roiScore },
  ];
  const driver = [...scoreItems].sort((a, b) => a.val - b.val)[0].key;

  const driverMessages = {
    attendees: attendeeCount > 5
      ? `${attendeeCount} attendees exceeds the optimal range of 4–5 — each extra person adds cost and dilutes focus.`
      : 'Attendee count is in the optimal range of 4–5.',
    duration: durationMinutes > 45
      ? `At ${durationMinutes} min, this meeting runs longer than the optimal 30–45 min window.`
      : 'Duration is within the optimal 30–45 min window.',
    roi: !estimatedValue
      ? 'Add an estimated value to unlock a full ROI-driven efficiency score.'
      : (estimatedValue / totalPerMeeting) < 1.2
        ? 'Value generated is not clearly outpacing the cost of the room.'
        : 'ROI is solid and contributing positively to the score.',
  };

  let label;
  if (score >= 75) label = 'Efficient';
  else if (score >= 50) label = 'Moderate';
  else label = 'Needs Attention';

  return { score, label, attendeeScore, durationScore, roiScore, driver, driverMessage: driverMessages[driver] };
}

export function calcScenarios(rows, totalPerMeeting, totalAnnual, frequency, duration) {
  const multiplier = getFrequencyMultiplier(frequency);
  const scenarios = [];

  const toRemoveCount = Math.min(2, rows.length - 1);
  if (toRemoveCount > 0) {
    const sorted = [...rows].sort((a, b) => a.salary - b.salary);
    const toRemove = sorted.slice(0, toRemoveCount);
    const remaining = sorted.slice(toRemoveCount);
    const newPerMeeting = remaining.reduce((s, r) => s + r.costPerMeeting, 0);
    const savingPerMeeting = totalPerMeeting - newPerMeeting;
    const names = toRemove.map(r => r.name || 'Attendee').join(' & ');
    scenarios.push({
      key: 'remove2',
      title: toRemoveCount === 1 ? 'Remove Lowest-Paid Attendee' : 'Remove 2 Lowest-Paid Attendees',
      description: `Drop ${names}`,
      savingPerMeeting,
      annualSaving: savingPerMeeting * multiplier,
    });
  }

  if (duration > 15) {
    const savingPerMeeting = totalPerMeeting * (15 / duration);
    scenarios.push({
      key: 'shorten',
      title: 'Shorten by 15 Minutes',
      description: `${duration} min → ${duration - 15} min`,
      savingPerMeeting,
      annualSaving: savingPerMeeting * multiplier,
    });
  }

  if (frequency === 'weekly') {
    scenarios.push({
      key: 'biweekly',
      title: 'Switch to Bi-Weekly',
      description: 'Every week → every other week',
      savingPerMeeting: 0,
      annualSaving: totalAnnual * 0.5,
    });
  }

  const combinedAnnual = scenarios.reduce((s, sc) => s + sc.annualSaving, 0);
  if (combinedAnnual > 0) {
    const combinedPerMeeting = scenarios.reduce((s, sc) => s + sc.savingPerMeeting, 0);
    scenarios.push({
      key: 'combined',
      title: 'All Changes Combined',
      description: 'Maximum optimization scenario',
      savingPerMeeting: combinedPerMeeting,
      annualSaving: combinedAnnual,
      highlight: true,
    });
  }

  return scenarios;
}

const REC_COPY = {
  shorten: {
    formal:     'Circulate a written brief 24 hours in advance. Prepared participants in formal settings consistently reach decisions 25% faster.',
    tech:       'Send an async pre-read and set a strict timebox. Tech teams with structured pre-reads consistently cut meeting time by 25–30%.',
    consulting: 'Distribute a structured pre-read to all participants. Consultants with prepared attendees routinely run 25–30% shorter.',
    healthcare: 'Circulate a clinical agenda or case summary in advance. Structured prep is especially valuable given the cost of clinical time.',
    default:    'Set a hard stop and circulate a pre-read 24 hours in advance. Structured agendas typically reduce meeting runtime by 20–30%.',
  },
  async: {
    formal:     'A structured written brief achieves the same outcome while protecting billable and advisory time.',
    tech:       'An async Slack thread or Loom recording delivers the same value — async-first culture typically cuts meeting volume by 30%.',
    consulting: 'A concise written update achieves the same outcome while keeping billable capacity available for client work.',
    healthcare: 'A brief clinical summary or EHR message achieves the same outcome, returning time to direct patient care.',
    default:    'A Slack update or Loom recording achieves the same information transfer at near-zero cost.',
  },
  trim: {
    formal:     `they can receive a structured written summary, keeping only decision-makers in the room.`,
    tech:       `they can be looped in via an async summary — fewer people, faster decisions.`,
    consulting: `they can receive a written debrief, preserving senior billable time for client work.`,
    healthcare: `they can be briefed with a clinical summary note, protecting direct-care time.`,
    default:    `they can be briefed afterward with async summary notes.`,
  },
};

export function getRecommendations(rows, totalPerMeeting, totalAnnual, frequency, duration, estimatedValue, industry = 'general') {
  const multiplier = getFrequencyMultiplier(frequency);
  const isOnce = frequency === 'once';
  const recs = [];

  const tone = (['legal', 'financial'].includes(industry)) ? 'formal'
    : industry === 'technology' ? 'tech'
    : industry === 'consulting' ? 'consulting'
    : industry === 'healthcare' ? 'healthcare'
    : 'default';

  if (rows.length > 5) {
    const excess = rows.length - 5;
    const saving = [...rows].sort((a, b) => a.salary - b.salary)
      .slice(0, excess)
      .reduce((s, r) => s + r.costPerMeeting, 0) * (isOnce ? 1 : multiplier);
    recs.push({
      title: 'Trim to 5 attendees',
      detail: `Remove the ${excess} lowest-cost attendee${excess > 1 ? 's' : ''} from the invite — ${REC_COPY.trim[tone] || REC_COPY.trim.default}`,
      saving,
      isOnce,
    });
  }

  if (duration > 45) {
    const newDur = Math.max(30, duration - 15);
    const saving = totalPerMeeting * (1 - newDur / duration) * (isOnce ? 1 : multiplier);
    recs.push({
      title: `Cap at ${newDur} minutes`,
      detail: REC_COPY.shorten[tone] || REC_COPY.shorten.default,
      saving,
      isOnce,
    });
  }

  if (frequency === 'weekly') {
    recs.push({
      title: 'Pilot bi-weekly for 6 weeks',
      detail: 'Consolidate updates into a richer fortnightly session. Most recurring status meetings can shift bi-weekly without losing alignment.',
      saving: totalAnnual * 0.5,
      isOnce: false,
    });
  }

  if (!estimatedValue) {
    recs.push({
      title: "Quantify this meeting's business value",
      detail: 'Add an "Estimated Value Generated" figure to unlock ROI analysis. Even a rough estimate helps teams assess whether this meeting earns its cost.',
      saving: null,
      isOnce: false,
    });
  } else if (totalPerMeeting > 0 && estimatedValue / totalPerMeeting < 1.0) {
    recs.push({
      title: 'Replace with async for routine updates',
      detail: `This meeting costs more than the value it generates. ${REC_COPY.async[tone] || REC_COPY.async.default}`,
      saving: isOnce ? totalPerMeeting : totalAnnual,
      isOnce,
    });
  }

  return recs.slice(0, 4);
}
