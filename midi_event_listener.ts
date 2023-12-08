import {
  Continue,
  Ignore,
  MidiMessages,
  SongPositionPointer,
  Start,
  Stop,
  TimingClock,
} from "./midi.ts";

export type Clock = {
  bars: number;
  beats: number;
  sixteenths: number;
  ticks: number;
  sixteenths_per_beat: number;
  beats_per_bar: number;
  ticks_per_sixteenth: number;
};

export class MidiEventListener {
  private onBarAdvanced: (c: Readonly<Clock>) => void;
  private clock: Clock;
  private midiAccess: MIDIAccess | undefined;

  constructor(onBarAdvanced: (c: Readonly<Clock>) => void) {
    this.onBarAdvanced = (c: Readonly<Clock>) => {
      console.log(
        `${onBarAdvanced.name}: ${this.printClockWithAbletonFormatting()}`,
      );
      onBarAdvanced(c);
    };

    // these all start at 0 (it doesn't match Ableton Live, I'm sorry) :(
    this.clock = {
      bars: 0,
      beats: 0,
      sixteenths: 0,
      ticks: 0,
      beats_per_bar: 4,
      sixteenths_per_beat: 4,
      ticks_per_sixteenth: 6,
    };
  }

  install = async () => {
    this.midiAccess ||= await navigator.requestMIDIAccess();
    this.midiAccess.inputs.forEach((entry) => {
      console.log(
        `MIDI Event Listener installed on "${entry.id} (${entry.name})"`,
      );
      entry.onmidimessage = <EventListener> this.onMIDIMessage;
    });
  };

  uninstall = async () => {
    this.midiAccess ||= await navigator.requestMIDIAccess();
    this.midiAccess.inputs.forEach((entry) => {
      entry.removeEventListener(
        "onmidimessage",
        <EventListener> this.onMIDIMessage,
      );
      entry.close();
    });
  };

  getDevices = async () => {
    this.midiAccess ||= await navigator.requestMIDIAccess();
    const devices: Array<MIDIInput> = [];
    this.midiAccess.inputs.forEach((device) => devices.push(device));
    return devices;
  };

  // midi clock ticks 24 times per quarter note
  private incrementClock = () => {
    this.clock.ticks = (this.clock.ticks + 1) % this.clock.ticks_per_sixteenth;
    if (this.clock.ticks === 0) {
      this.clock.sixteenths = (this.clock.sixteenths + 1) %
        this.clock.sixteenths_per_beat;
      if (this.clock.sixteenths === 0) {
        this.clock.beats = (this.clock.beats + 1) % this.clock.beats_per_bar;
        if (this.clock.beats === 0) {
          this.clock.bars += 1;
          this.onBarAdvanced(this.clock);
        }
      }
    }
  };

  private printClockWithAbletonFormatting = (): string => {
    return (
      JSON.stringify({
        bars: this.clock.bars + 1,
        beats: this.clock.beats + 1,
        sixteenths: this.clock.sixteenths + 1,
      })
    );
  };

  private setClock = (sixteenths: number) => {
    const beatsTotal = sixteenths / this.clock.sixteenths_per_beat;
    const bars = Math.floor(beatsTotal / this.clock.beats_per_bar);
    const beats = Math.floor(beatsTotal % this.clock.beats_per_bar);
    const clockSixteenths = sixteenths % this.clock.sixteenths_per_beat;
    this.clock.bars = bars;
    this.clock.beats = beats;
    this.clock.sixteenths = clockSixteenths;
  };

  private clockStart = () => {
    console.log(`clockStart: ${this.printClockWithAbletonFormatting()}`);
    this.onBarAdvanced(this.clock);
  };

  private clockStop = () => {
    console.log(`clockStop: ${this.printClockWithAbletonFormatting()}`);
  };

  private clockContinue = () => {
    console.log(`clockContinue: ${this.printClockWithAbletonFormatting()}`);
  };

  private onMIDIMessage = (event: MIDIMessageEvent) => {
    const m = event.data.reduce((memo, value) => memo + value.toString(2), "");
    const rawStatusByte = m.slice(0, 8);
    const messageType = MidiMessages.get(rawStatusByte);

    if (
      messageType !== undefined && Ignore.includes(messageType)
    ) return;

    switch (messageType) {
      case TimingClock:
        this.incrementClock();
        break;
      case Start:
        this.clockStart();
        break;
      case Stop:
        this.clockStop();
        break;
      case Continue:
        this.clockContinue();
        break;
      case SongPositionPointer: {
        const lsb = event.data[1]!;
        const msb = event.data[2]!;
        this.setClock((msb << 7) + lsb);
        break;
      }
      default:
        break;
    }
  };
}
