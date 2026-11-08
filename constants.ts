/**
 * Game configuration and constants for "Wrong Button".
 */
export const CONFIG = {
  // --- Baseline Game Info ---
  title: {
    value: 'Wrong Button',
    type: 'string',
    label: 'Game Title',
    group: 'GAME',
  },
  baseCanvasWidth: {
    value: 1376,
    type: 'number',
    label: 'Base Canvas Width',
    group: 'GAME',
  },
  baseCanvasHeight: {
    value: 768,
    type: 'number',
    label: 'Base Canvas Height',
    group: 'GAME',
  },

  // --- System Constants ---
  targetFPS: {
    value: 60,
    type: 'number',
    label: 'Target FPS',
    group: 'SYSTEM',
  },
  stepMs: {
    value: 1000 / 60,
    type: 'number',
    label: 'Step MS',
    group: 'SYSTEM',
  },
  maxSubSteps: {
    value: 5,
    type: 'number',
    label: 'Max Sub Steps',
    group: 'SYSTEM',
  },

  // --- Theme ---
  // Hand-printed "Button Museum" palette (see utils/theme.ts + utils/art.ts).
  // All artwork is drawn procedurally on canvas / in SVG — no image assets.
  backgroundColor: {
    value: '#F3E7D1',
    type: 'color',
    label: 'Background Color (paper)',
    group: 'THEME',
  },
  primaryColor: {
    value: '#CB5243',
    type: 'color',
    label: 'Primary Color (museum red)',
    group: 'THEME',
  },
  fontFamily: {
    value: "'Fraunces', Georgia, serif",
    type: 'string',
    label: 'Font Family (display)',
    group: 'THEME',
  },

  // --- Audio ---
  defaultMusicVolume: {
    value: 0.5,
    type: 'number',
    label: 'Default Music Volume',
    group: 'AUDIO',
  },
  defaultSfxVolume: {
    value: 0.7,
    type: 'number',
    label: 'Default SFX Volume',
    group: 'AUDIO',
  },

  // --- Gameplay Rules (Playground tunable) ---
  initialRoundDuration: {
    value: 3.5,
    type: 'number',
    label: 'Initial Time (s)',
    group: 'Rules',
  },
  minRoundDuration: {
    value: 1.2,
    type: 'number',
    label: 'Fastest Time (s)',
    group: 'Rules',
  },
  waitRoundDuration: {
    value: 1.8,
    type: 'number',
    label: 'Wait Round Time (s)',
    group: 'Rules',
  },
  basePointsPerRound: {
    value: 100,
    type: 'number',
    label: 'Base Points / Round',
    group: 'Rules',
  },
  timeBonusMultiplier: {
    value: 50,
    type: 'number',
    label: 'Speed Bonus Mult',
    group: 'Rules',
  },

  // --- Asset Dimensions & Aspect Ratios ---
  // Legacy entries kept for config back-compat. The current art is fully
  // procedural (canvas + SVG "hand-printed" style); the only shipped binary
  // assets are the woff2 fonts and assets/audio/bgm_button_museum.mp3.
  // Button entries below describe the drawn specimen diameter (r=96).
  assetBackdropAspectRatio: {
    value: 1376 / 768,
    type: 'number',
    label: 'Backdrop Aspect Ratio (procedural paper stage)',
    group: 'ASSETS',
  },
  assetBackdropWidth: {
    value: 1376,
    type: 'number',
    label: 'Backdrop Width',
    group: 'ASSETS',
  },
  assetBackdropHeight: {
    value: 768,
    type: 'number',
    label: 'Backdrop Height',
    group: 'ASSETS',
  },

  assetButtonRedAspectRatio: {
    value: 1.0,
    type: 'number',
    label: 'Button Red Aspect Ratio',
    group: 'ASSETS',
  },
  assetButtonRedWidth: {
    value: 192,
    type: 'number',
    label: 'Button Red Width',
    group: 'ASSETS',
  },
  assetButtonRedHeight: {
    value: 192,
    type: 'number',
    label: 'Button Red Height',
    group: 'ASSETS',
  },

  assetButtonBlueAspectRatio: {
    value: 1.0,
    type: 'number',
    label: 'Button Blue Aspect Ratio',
    group: 'ASSETS',
  },
  assetButtonBlueWidth: {
    value: 192,
    type: 'number',
    label: 'Button Blue Width',
    group: 'ASSETS',
  },
  assetButtonBlueHeight: {
    value: 192,
    type: 'number',
    label: 'Button Blue Height',
    group: 'ASSETS',
  },

  assetButtonYellowAspectRatio: {
    value: 1.0,
    type: 'number',
    label: 'Button Yellow Aspect Ratio',
    group: 'ASSETS',
  },
  assetButtonYellowWidth: {
    value: 192,
    type: 'number',
    label: 'Button Yellow Width',
    group: 'ASSETS',
  },
  assetButtonYellowHeight: {
    value: 192,
    type: 'number',
    label: 'Button Yellow Height',
    group: 'ASSETS',
  },

  assetButtonGreenAspectRatio: {
    value: 1.0,
    type: 'number',
    label: 'Button Green Aspect Ratio',
    group: 'ASSETS',
  },
  assetButtonGreenWidth: {
    value: 192,
    type: 'number',
    label: 'Button Green Width',
    group: 'ASSETS',
  },
  assetButtonGreenHeight: {
    value: 192,
    type: 'number',
    label: 'Button Green Height',
    group: 'ASSETS',
  },

  assetDangerAspectRatio: {
    value: 658 / 557,
    type: 'number',
    label: 'Legacy Danger Icon Aspect Ratio (unused)',
    group: 'ASSETS',
  },
  assetDangerWidth: {
    value: 658,
    type: 'number',
    label: 'Legacy Danger Icon Width (unused)',
    group: 'ASSETS',
  },
  assetDangerHeight: {
    value: 557,
    type: 'number',
    label: 'Legacy Danger Icon Height (unused)',
    group: 'ASSETS',
  },

  assetTrophyAspectRatio: {
    value: 527 / 618,
    type: 'number',
    label: 'Legacy Trophy Badge Aspect Ratio (unused)',
    group: 'ASSETS',
  },
  assetTrophyWidth: {
    value: 527,
    type: 'number',
    label: 'Legacy Trophy Badge Width (unused)',
    group: 'ASSETS',
  },
  assetTrophyHeight: {
    value: 618,
    type: 'number',
    label: 'Legacy Trophy Badge Height (unused)',
    group: 'ASSETS',
  },
};

// Merge customized config values if present (injected by Playground)
const {playgroundConfig} = globalThis as {
  playgroundConfig?: Record<string, unknown>;
};
if (playgroundConfig) {
  for (const [key, value] of Object.entries(playgroundConfig)) {
    if (key in CONFIG) {
      Object.assign(CONFIG[key as keyof typeof CONFIG], {value});
    }
  }
}

/**
 * Type helper for reading values in game code
 */
export type ConfigKey = keyof typeof CONFIG;

/**
 * Gets a configuration value by key.
 * @param key The configuration key.
 * @return The configuration value.
 */
export function getConfig<K extends ConfigKey>(
  key: K,
): (typeof CONFIG)[K]['value'] {
  return CONFIG[key].value;
}
