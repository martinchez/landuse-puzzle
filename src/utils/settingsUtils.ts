// Game settings utility for managing user preferences
export interface GameSettings {
  randomizeImagesOnLevelStart: boolean;
  soundEnabled: boolean;
  hintsEnabled: boolean;
}

const DEFAULT_SETTINGS: GameSettings = {
  randomizeImagesOnLevelStart: true,
  soundEnabled: true,
  hintsEnabled: true
};

const SETTINGS_KEY = 'landuse-puzzle-settings';

// Load settings from localStorage
export const loadSettings = (): GameSettings => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load settings:', error);
  }
  return DEFAULT_SETTINGS;
};

// Save settings to localStorage
export const saveSettings = (settings: GameSettings): boolean => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Failed to save settings:', error);
    return false;
  }
};

// Get a specific setting value
export const getSetting = <K extends keyof GameSettings>(key: K): GameSettings[K] => {
  const settings = loadSettings();
  return settings[key];
};

// Update a specific setting
export const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]): boolean => {
  const settings = loadSettings();
  settings[key] = value;
  return saveSettings(settings);
};
