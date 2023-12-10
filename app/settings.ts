export const colorChords = "colorChords" as const;
export const unicodeChordSymbols = "unicodeChordSymbols" as const;
export const followMidiClockMessages = "followMidiClockMessages" as const;

export type FeatureFlagKeysType = typeof FeatureFlagKeys[number];
export const FeatureFlagKeys = [
  colorChords,
  unicodeChordSymbols,
  followMidiClockMessages,
] as const;

export type FeatureFlags = {
  [K in FeatureFlagKeysType]: {
    enabled: boolean;
    description: string;
  };
};

export const defaultFeatureFlags: FeatureFlags = {
  [colorChords]: {
    enabled: true,
    description: "Color chord symbols by type (maj, min, dom, etc)",
  },
  [unicodeChordSymbols]: {
    enabled: false,
    description: `Spell chords using unicode symbols (e.g. D♭⁷ vs Db7)`,
  },
  [followMidiClockMessages]: {
    enabled: false,
    description: `Listen for MIDI clock messages to highlight the active bar`,
  },
} as const;

export type Settings = {
  featureFlags: FeatureFlags;
  midiInputDeviceID: string | undefined;
};
