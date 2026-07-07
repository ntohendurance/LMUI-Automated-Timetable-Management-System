// Shared scheduling constants.
const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const TIME_SLOTS = ['SLOT_8_10', 'SLOT_10_12', 'SLOT_12_14', 'SLOT_14_16', 'SLOT_16_18']

// Map each time slot to a coarse period used for lecturer preferences.
const SLOT_PERIOD = {
  SLOT_8_10: 'MORNING',
  SLOT_10_12: 'MORNING',
  SLOT_12_14: 'AFTERNOON',
  SLOT_14_16: 'AFTERNOON',
  SLOT_16_18: 'EVENING',
}

// Index helpers for adjacency / back-to-back checks.
const SLOT_INDEX = TIME_SLOTS.reduce((acc, s, i) => ({ ...acc, [s]: i }), {})

// Default assumed class size when a course has no explicit enrolment count.
const DEFAULT_CLASS_SIZE = 30

const LEVELS = ['YEAR_1', 'YEAR_2', 'YEAR_3', 'YEAR_4']

// Human-readable labels for descriptions.
const SLOT_LABELS = {
  SLOT_8_10: '8-10AM',
  SLOT_10_12: '10-12PM',
  SLOT_12_14: '12-2PM',
  SLOT_14_16: '2-4PM',
  SLOT_16_18: '4-6PM',
}

module.exports = {
  DAYS,
  TIME_SLOTS,
  SLOT_PERIOD,
  SLOT_INDEX,
  DEFAULT_CLASS_SIZE,
  LEVELS,
  SLOT_LABELS,
}
