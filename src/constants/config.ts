// Application Configuration Constants

// Polling intervals (in milliseconds)
export const POLLING_INTERVALS = {
  DASHBOARD_METRICS: 60_000,    // 60 seconds
  RECENT_AUDITS: 45_000,        // 45 seconds
  ACTION_ITEMS: 60_000,         // 60 seconds
  ACTIVITY_EVENTS: 30_000,      // 30 seconds
} as const;

// Cache stale times (in milliseconds)
export const STALE_TIMES = {
  DASHBOARD_METRICS: 30_000,    // 30 seconds
  FACILITIES: 300_000,          // 5 minutes (facilities change rarely)
  RECENT_AUDITS: 20_000,        // 20 seconds
  ACTION_ITEMS: 30_000,         // 30 seconds
  ACTIVITY_EVENTS: 15_000,      // 15 seconds
} as const;

// Compliance scoring configuration
export const COMPLIANCE_CONFIG = {
  // Score calculation: base score minus (findings * penalty)
  BASE_SCORE: 100,
  FINDING_PENALTY: 5,
  
  // Status-based scoring
  STATUS_SCORES: {
    compliant: { min: 95, max: 100 },
    warning: 85,
    needs_attention: 70,
    critical: 50,
    never_audited: 0,
  },
  
  // Color thresholds
  THRESHOLDS: {
    EXCELLENT: 90,    // Green
    GOOD: 75,         // Yellow
    POOR: 0,          // Red
  },
} as const;

// API configuration
export const API_CONFIG = {
  DEFAULT_PAGE_SIZE: 100,
  MAX_FACILITIES_BATCH: 5,  // Limit concurrent facility requests
  REQUEST_TIMEOUT: 30_000,  // 30 seconds
} as const;

// UI constants
export const UI_CONFIG = {
  TABLE_PAGE_SIZES: [10, 25, 50, 100],
  DEFAULT_TABLE_SIZE: 25,
  MODAL_ANIMATION_DURATION: 200,
  TOAST_DURATION: 5_000,
} as const;