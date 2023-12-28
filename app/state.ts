import { type TimeEventListener } from "../lib/midi/time_event_listener.ts";
import { rehydrate as rehydrateSong, Song } from "../parser/song.ts";
import { defaultFeatureFlags, type Settings } from "./settings.ts";

export type State = {
  song: Song | undefined;
  filename: string | undefined;
  transposedSteps: number;
  settings: Settings;
  midiEventListener?: TimeEventListener;
};

export const EmptyState: Readonly<State> = {
  song: undefined,
  filename: undefined,
  transposedSteps: 0,
  settings: {
    featureFlags: defaultFeatureFlags,
    midiInputDeviceID: undefined,
  },
};

export function saveStateToLocalStorage(s: State) {
  const marshalled = JSON.stringify(s);
  localStorage.setItem(LocalStorageStateKey, marshalled);
}

export function getStateFromLocalStorage(): State {
  const empty: State = EmptyState;
  const str = localStorage.getItem(LocalStorageStateKey);
  if (!str?.trim()) return empty;

  try {
    const parsed: State = JSON.parse(str);
    return { ...empty, ...rehydrate(parsed) };
  } catch (e) {
    console.error(e);
    return empty;
  }
}

export const LocalStorageStateKey = "state" as const;

export function rehydrate(s: State): State {
  if (!s.song) return s;
  s.song = rehydrateSong(s.song);
  return s;
}
