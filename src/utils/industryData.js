export const INDUSTRY_OPTIONS = [
  { value: 'general',       label: 'General' },
  { value: 'technology',    label: 'Technology' },
  { value: 'healthcare',    label: 'Healthcare' },
  { value: 'financial',     label: 'Financial Services' },
  { value: 'legal',         label: 'Legal' },
  { value: 'consulting',    label: 'Consulting' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail',        label: 'Retail & Consumer' },
  { value: 'education',     label: 'Education' },
  { value: 'government',    label: 'Government & Nonprofit' },
  { value: 'realestate',    label: 'Real Estate' },
  { value: 'media',         label: 'Media & Marketing' },
];

// avgAttendees, avgDuration (min), avgCost ($/meeting)
// optLow/optHigh for attendees and duration are universal meeting-effectiveness ranges
export const INDUSTRY_BENCHMARKS = {
  general:       { avgAttendees: 7,  avgDuration: 52, avgCost: 300, optAttendeesLow: 4, optAttendeesHigh: 5, optDurationLow: 30, optDurationHigh: 45 },
  technology:    { avgAttendees: 5,  avgDuration: 45, avgCost: 285, optAttendeesLow: 3, optAttendeesHigh: 5, optDurationLow: 25, optDurationHigh: 40 },
  healthcare:    { avgAttendees: 8,  avgDuration: 52, avgCost: 310, optAttendeesLow: 5, optAttendeesHigh: 7, optDurationLow: 30, optDurationHigh: 45 },
  financial:     { avgAttendees: 5,  avgDuration: 50, avgCost: 420, optAttendeesLow: 3, optAttendeesHigh: 5, optDurationLow: 30, optDurationHigh: 45 },
  legal:         { avgAttendees: 4,  avgDuration: 60, avgCost: 520, optAttendeesLow: 3, optAttendeesHigh: 4, optDurationLow: 30, optDurationHigh: 50 },
  consulting:    { avgAttendees: 6,  avgDuration: 60, avgCost: 480, optAttendeesLow: 4, optAttendeesHigh: 5, optDurationLow: 30, optDurationHigh: 45 },
  manufacturing: { avgAttendees: 7,  avgDuration: 55, avgCost: 250, optAttendeesLow: 4, optAttendeesHigh: 6, optDurationLow: 30, optDurationHigh: 45 },
  retail:        { avgAttendees: 6,  avgDuration: 45, avgCost: 220, optAttendeesLow: 4, optAttendeesHigh: 5, optDurationLow: 25, optDurationHigh: 40 },
  education:     { avgAttendees: 9,  avgDuration: 60, avgCost: 190, optAttendeesLow: 5, optAttendeesHigh: 8, optDurationLow: 30, optDurationHigh: 50 },
  government:    { avgAttendees: 10, avgDuration: 65, avgCost: 210, optAttendeesLow: 5, optAttendeesHigh: 8, optDurationLow: 30, optDurationHigh: 55 },
  realestate:    { avgAttendees: 5,  avgDuration: 45, avgCost: 280, optAttendeesLow: 3, optAttendeesHigh: 5, optDurationLow: 25, optDurationHigh: 40 },
  media:         { avgAttendees: 7,  avgDuration: 50, avgCost: 260, optAttendeesLow: 4, optAttendeesHigh: 6, optDurationLow: 30, optDurationHigh: 45 },
};

export function getIndustryLabel(key) {
  return INDUSTRY_OPTIONS.find(i => i.value === key)?.label || 'General';
}

// Returns a tone group used to select recommendation language
export function getIndustryTone(industry) {
  if (['legal', 'financial'].includes(industry)) return 'formal';
  if (industry === 'technology') return 'tech';
  if (industry === 'consulting') return 'consulting';
  if (industry === 'healthcare') return 'healthcare';
  return 'default';
}
