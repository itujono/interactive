export const SCENE_CONSTANTS = {
  // System sizes
  NUM_STARS: 400,
  NUM_PLANETS: 5,
  MAX_USERS: 5,

  // Camera settings
  AUTO_PAN_SPEED: 0.2,
  CAMERA_LERP_FACTOR: 0.05,

  // Star settings
  STAR: {
    SIZE: {
      MIN: 1,
      MAX: 4,
    },
    TWINKLE: {
      SPEED: {
        MIN: 0.002,
        MAX: 0.006,
      },
      BRIGHTNESS: {
        MIN: 180,
        MAX: 255,
      },
    },
    LAYERS: {
      MIN: 1,
      MAX: 3,
    },
  },

  // Planet settings
  PLANET: {
    SPAWN: {
      ATTEMPTS: 100,
      MIN_DISTANCE: 150,
      AREA_MULTIPLIER: 1.5,
      OFFSET: 0.25,
    },
    SIZE: {
      MIN: 40,
      MAX: 100,
    },
    COLOR: {
      HUE_RANGE: 360,
      SATURATION: {
        MIN: 40,
        MAX: 80,
      },
      BRIGHTNESS: {
        MIN: 70,
        MAX: 90,
      },
      SECONDARY_BRIGHTNESS_FACTOR: 0.7,
    },
    ROTATION: {
      SPEED: {
        MIN: 0.001,
        MAX: 0.003,
      },
    },
    RINGS: {
      CHANCE: 0.2,
      HUE_VARIANCE: 30,
      SATURATION_FACTOR: 0.8,
      BRIGHTNESS_FACTOR: 0.9,
      WIDTH: {
        MIN: 1.8,
        MAX: 2.2,
      },
      TILT: {
        MIN: 0.15,
        MAX: 0.3,
      },
      DETAIL: {
        STEPS: 40,
        LINES: 12,
      },
      INNER_RADIUS_FACTOR: 0.6,
      ALPHA: {
        MAX: 200,
        DETAIL_MAX: 150,
      },
    },
  },

  // User particle settings
  USER: {
    VELOCITY: {
      MIN: 0.5,
      MAX: 1,
    },
    TEXT: {
      NAME_SIZE: 14,
      DETAILS_SIZE: 10,
      SPACING: 8,
    },
    PARALLAX_FACTOR: 0.3,
  },
} as const;
