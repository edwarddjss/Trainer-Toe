export const TIMEOUTS = {
  VOICE_CONNECTION: 10000,
  AUDIO_PLAYBACK: 5000,
  DISCONNECT_DELAY: 3000,
  FOLLOW_UP_DELAY: 5000,
  PROCESS_EXIT_DELAY: 1000,
} as const;

export const CACHE_SETTINGS = {
  MAX_MEMORY_ITEMS: 100,
  CLEANUP_THRESHOLD: 1000,
  COMPRESSION_LEVEL: 6,
} as const;

export const RATE_LIMITING = {
  COOLDOWN_MS: 30000,
  CLEANUP_INTERVAL: 1000,
} as const;

export const EXERCISE_TIMINGS = {
  PUSHUPS: { repDuration: 3500, restDuration: 1500 },
  SITUPS: { repDuration: 3000, restDuration: 1000 },
  JUMPING_JACKS: { repDuration: 1200, restDuration: 300 },
  BURPEES: { repDuration: 7000, restDuration: 3000 },
  SQUATS: { repDuration: 4000, restDuration: 1500 },
  LUNGES: { repDuration: 4500, restDuration: 1500 },
  MOUNTAIN_CLIMBERS: { repDuration: 1000, restDuration: 300 },
  HIGH_KNEES: { repDuration: 800, restDuration: 300 },
  CRUNCHES: { repDuration: 2500, restDuration: 800 },
  DEFAULT: { repDuration: 2000, restDuration: 800 },
} as const;

export const VOICE_SETTINGS = {
  MODEL: 'eleven_turbo_v2_5',
  STABILITY: 0.5,
  SIMILARITY_BOOST: 0.8,
  STYLE: 0.3,
  USE_SPEAKER_BOOST: true,
} as const;

export const WORKOUT_DEFAULTS = {
  DEFAULT_INTERVAL_MINUTES: 60,
  FITNESS_LEVEL_INCREMENT: 10,
  MAX_FITNESS_LEVEL: 10,
  RECENT_EXERCISES_LIMIT: 5,
} as const;

export const COST_ESTIMATES = {
  CHARS_PER_REQUEST: 20,
  COST_PER_CHAR: 0.0001,
} as const;