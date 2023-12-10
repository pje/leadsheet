import { type TimeEventListener } from "../lib/midi/time_event_listener.ts";
import { type Song } from "../parser/song.ts";
import { type Settings } from "./settings.ts";

export type State = {
  song: Song | undefined;
  transposedSteps: number;
  settings: Settings;
  midiEventListener?: TimeEventListener;
};
