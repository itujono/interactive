export const SCENE_CONSTANTS = {
  // System sizes
  NUM_PARTICLES: 1000,
  MAX_USERS: 5,

  // Flow field settings
  FIELD_SCALE: 20, // Size of each flow field cell
  FIELD_CHANGE_SPEED: 0.001,
  FIELD_NOISE_SCALE: 0.1,

  // Mouse force settings
  FORCE: {
    MAX_STRENGTH: 5,
    GROWTH_RATE: 0.2,
    RADIUS: 200,
  },

  // Particle settings
  PARTICLE: {
    SPEED: {
      MIN: 2,
      MAX: 4,
    },
    ALPHA: {
      MIN: 20,
      MAX: 50,
    },
    COLOR: {
      HUE_RANGE: 360,
      SATURATION: 80,
      BRIGHTNESS: 100,
      ALPHA: 0.5,
    },
  },

  // User particle settings
  USER: {
    SPEED: {
      MIN: 1,
      MAX: 2,
    },
    ALPHA: {
      MIN: 200,
      MAX: 255,
    },
    COLOR: {
      HUE: {
        MIN: 200,
        MAX: 280,
      },
      SATURATION: {
        MIN: 70,
        MAX: 90,
      },
      BRIGHTNESS: {
        MIN: 80,
        MAX: 100,
      },
    },
    TEXT: {
      NAME_SIZE: 14,
      DETAILS_SIZE: 10,
      SPACING: 8,
    },
  },

  // Background settings
  BACKGROUND: {
    COLOR: 0,
    OPACITY: 0.9,
  },
} as const;
