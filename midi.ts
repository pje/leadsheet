export const TimingClock = "TimingClock";
export const ActiveSense = "ActiveSense";
export const Stop = "Stop";
export const Start = "Start";
export const Continue = "Continue";
export const SongPositionPointer = "SongPositionPointer";

export type MidiMessageType =
  | typeof TimingClock
  | typeof ActiveSense
  | typeof Stop
  | typeof Start
  | typeof Continue
  | typeof SongPositionPointer;

export const MidiMessages = new Map<string, MidiMessageType>([
  ["11111000", TimingClock],
  ["11111010", Start],
  ["11111011", Continue],
  ["11111110", ActiveSense],
  ["11111100", Stop],
  ["11110010", SongPositionPointer],
]);

export const Ignore: Array<MidiMessageType> = [ActiveSense];
