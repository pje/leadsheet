import { TimeEventListener } from "../lib/midi/time_event_listener.ts";
import { Song } from "../parser/song.ts";
import { Settings } from "./settings.ts";

export type State = {
  song: Song | undefined;
  transposedSteps: number;
  settings: Settings;
  midiEventListener?: TimeEventListener;
};
