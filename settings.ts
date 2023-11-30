export const SettingsKeys = ["colorChords", "unicodeChordSymbols"] as const;
export type Settings = {
  [K in typeof SettingsKeys[number]]: {
    enabled: boolean;
    description: string;
  };
};

export const defaultSettings: Settings = {
  colorChords: {
    enabled: true,
    description: "Color chord symbols by type (maj, min, dom, etc)",
  },
  unicodeChordSymbols: {
    enabled: false,
    description: `Spell chords using unicode symbols (e.g. D♭⁷ vs Db7)`,
  },
} as const;
