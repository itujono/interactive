export const SCENE_CONSTANTS = {
  // System sizes
  NUM_CLOUDS: 5,
  NUM_PARTICLES: 50,
  MAX_USERS: 10,
  MAX_PLANTS: 30,

  // Wind settings
  WIND_FORCE_DECAY: 0.99,
  WIND_ANGLE_LERP: 0.1,
  MAX_WIND_FORCE: 1.0,
  MIN_WIND_FORCE: 0.1,

  // Plant settings
  MIN_PLANT_SIZE: 50,
  MAX_PLANT_SIZE: 200,
  MIN_BRANCHES: 3,
  MAX_BRANCHES: 8,
  BRANCH_LENGTH_VARIANCE: 0.3,
  BRANCH_ANGLE_VARIANCE: Math.PI / 6,

  // Particle settings
  PARTICLE_SIZE_RANGE: [5, 15],
  PARTICLE_LIFESPAN: 200,
  PARTICLE_VELOCITY_RANGE: [1, 3],

  // Colors
  BACKGROUND_COLOR: [0, 0, 100], // HSB values
  PLANT_COLOR_RANGE: {
    HUE: [80, 140],
    SATURATION: [30, 70],
    BRIGHTNESS: [40, 80],
  },
  FLOWER_COLOR_RANGE: {
    HUE: [0, 360],
    SATURATION: [50, 90],
    BRIGHTNESS: [70, 100],
  },
  CLOUD_COLOR: [0, 0, 100, 0.8], // HSB + alpha

  // Animation
  WAVE_SPEED: 0.02,
  SWAY_AMOUNT: 0.1,

  WIND: {
    DECAY_RATE: 0.99,
    INTERPOLATION_SPEED: 0.1,
    INDICATOR_POSITION: { x: 50, y: 50 },
  },
  CLOUD: {
    HEIGHT_RANGE: {
      MIN: 0.05,
      MAX: 0.2,
    },
    SPEED_RANGE: {
      MIN: 0.2,
      MAX: 0.4,
    },
    SIZE: {
      WIDTH: {
        MIN: 100,
        MAX: 200,
      },
      HEIGHT: {
        MIN: 40,
        MAX: 60,
      },
    },
  },
  PLANT: {
    TYPES: {
      TREE: {
        GROWTH_SPEED: 0.003,
        HEIGHT: {
          MIN: 150,
          MAX: 250,
        },
        HOLD_TIME: 1000,
      },
      FLOWER: {
        GROWTH_SPEED: 0.01,
        HEIGHT: {
          MIN: 50,
          MAX: 100,
        },
        HOLD_TIME: 500,
      },
      GRASS: {
        GROWTH_SPEED: 0.01,
        HEIGHT: {
          MIN: 50,
          MAX: 100,
        },
        HOLD_TIME: 0,
      },
    },
    GROWTH_MULTIPLIER: {
      TREE: 2,
      OTHER: 3,
    },
  },
  USER: {
    MAX_USERS: 5,
    TEXT: {
      NAME_SIZE: 14,
      DETAILS_SIZE: 10,
      SPACING: 8,
    },
  },
} as const;
