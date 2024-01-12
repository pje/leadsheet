import { titleCase } from "../lib/string.ts";
import { type TimeEventListener } from "../lib/midi/time_event_listener.ts";

export const colorChords = "colorChords" as const;
export const keySignature = "keySignature" as const;
export const rainbowRoad = "rainbowRoad" as const;
export const unicodeChordSymbols = "unicodeChordSymbols" as const;
export const followMidiClockMessages = "followMidiClockMessages" as const;

export type FeatureFlagKeysType = typeof FeatureFlagKeys[number];
export const FeatureFlagKeys = [
  colorChords,
  keySignature,
  rainbowRoad,
  unicodeChordSymbols,
  followMidiClockMessages,
] as const;

export type FeatureFlags = {
  [K in FeatureFlagKeysType]: {
    enabled: boolean;
    description: string;
    emoji: string;
  };
};

export const defaultFeatureFlags: FeatureFlags = {
  [colorChords]: {
    enabled: true,
    description: "Color chord symbols by type (maj, min, dom, etc)",
    emoji: "🎨",
  },
  [keySignature]: {
    enabled: true,
    description: "Render key signature",
    emoji: "🔑",
  },
  [rainbowRoad]: {
    enabled: true,
    description: `Show the "chords x color" graphic bar at the top of the page`,
    emoji: "🌈",
  },
  [unicodeChordSymbols]: {
    enabled: true,
    description: `Spell chords using unicode symbols (e.g. D♭⁷ vs Db7)`,
    emoji: "🔠",
  },
  [followMidiClockMessages]: {
    enabled: false,
    description: `Listen for MIDI clock messages to highlight the active bar`,
    emoji: "⏱",
  },
} as const;

export type Settings = {
  featureFlags: FeatureFlags;
  midiInputDeviceID: string | undefined;
};

export async function render(
  settings: Readonly<Settings>,
  midiEventListener?: TimeEventListener,
  rootElement: HTMLElement = document.getElementById("root")!,
) {
  const settingsElement = rootElement.querySelector("#settings-features")!;
  settingsElement.innerHTML = "";

  const inputs = Object.entries(settings.featureFlags).map(
    ([identifier, { enabled, description, emoji }]) =>
      `<label title="${description}">
  ${emoji ? emoji + " " : ""}${titleCase(identifier)}
  <input type="checkbox" name="${identifier}" ${enabled ? "checked" : ""}/>
</label>`,
  );

  if (settings.featureFlags.followMidiClockMessages.enabled) {
    const devices = await midiEventListener?.getDevices() || [];

    const deviceOptions = devices.map((d) => {
      return `<option value="${d.id}">${d.name}</option>`;
    });

    const midiSelector = `
  <div class="flex-row">
    <label for="midiDevice">MIDI Device (for clock input)</label>
    <select name="midiDevice" id="midiDevice">
      ${deviceOptions.join("\n")}
    </select>
  </div>
  `;

    inputs.push(midiSelector);
  }

  const html = inputs.join("\n");

  settingsElement.insertAdjacentHTML("beforeend", html);
}
