import {
  Continue,
  Ignore,
  MidiMessages,
  SongPositionPointer,
  Start,
  Stop,
  TimingClock,
} from "./protocol.ts";

// Keeps track of elapsed time (in bars/beats/sixteenths) in response to tick
// events from the MIDIInput device we're synced to
export class Clock {
  bars: number;
  beats: number;
  sixteenths: number;
  onBarAdvanced: (c: Readonly<Clock>) => void;
  private ticks: number;
  private sixteenths_per_beat: number;
  private beats_per_bar: number;
  private ticks_per_sixteenth: number;

  // these all start at 0 (it doesn't match Ableton Live, I'm sorry) :(
  constructor(onBarAdvanced: (c: Readonly<Clock>) => void) {
    this.bars = 0;
    this.beats = 0;
    this.sixteenths = 0;
    this.ticks = 0;
    this.sixteenths_per_beat = 4;
    this.beats_per_bar = 4;
    this.ticks_per_sixteenth = 6;
    this.onBarAdvanced = onBarAdvanced;
  }

  // midi clock ticks 24 times per quarter note
  increment = () => {
    this.ticks = (this.ticks + 1) % this.ticks_per_sixteenth;
    if (this.ticks === 0) {
      this.sixteenths = (this.sixteenths + 1) %
        this.sixteenths_per_beat;
      if (this.sixteenths === 0) {
        this.beats = (this.beats + 1) % this.beats_per_bar;
        if (this.beats === 0) {
          this.bars += 1;
          this.onBarAdvanced(this);
        }
      }
    }
  };

  set = (sixteenths: number) => {
    const beatsTotal = sixteenths / this.sixteenths_per_beat;
    const bars = Math.floor(beatsTotal / this.beats_per_bar);
    const beats = Math.floor(beatsTotal % this.beats_per_bar);
    const clockSixteenths = sixteenths % this.sixteenths_per_beat;
    this.bars = bars;
    this.beats = beats;
    this.sixteenths = clockSixteenths;
  };

  printWithOneIndexing = (): string => (
    JSON.stringify({
      bars: this.bars + 1,
      beats: this.beats + 1,
      sixteenths: this.sixteenths + 1,
    })
  );
}

export class MidiEventListener {
  clock: Clock;
  private midiAccess: MIDIAccess | undefined;

  constructor(onBarAdvanced: (c: Readonly<Clock>) => void) {
    this.clock = new Clock(onBarAdvanced);
  }

  async install() {
    this.midiAccess ||= await navigator.requestMIDIAccess();
    this.midiAccess.inputs.forEach((entry) => {
      console.log(
        `MIDI Event Listener installed on "${entry.id} (${entry.name})"`,
      );
      entry.onmidimessage = <EventListener> this.onMIDIMessage;
    });
  }

  async uninstall() {
    this.midiAccess ||= await navigator.requestMIDIAccess();
    this.midiAccess.inputs.forEach((entry) => {
      entry.removeEventListener(
        "onmidimessage",
        <EventListener> this.onMIDIMessage,
      );
      entry.close();
    });
  }

  async getDevices() {
    this.midiAccess ||= await navigator.requestMIDIAccess();
    const devices: Array<MIDIInput> = [];
    this.midiAccess.inputs.forEach((device) => devices.push(device));
    return devices;
  }

  private clockStart = () => {
    console.log(`clockStart: ${this.clock.printWithOneIndexing()}`);
    this.clock.onBarAdvanced(this.clock);
  };

  private clockStop = () => {
    console.log(`clockStop: ${this.clock.printWithOneIndexing()}`);
  };

  private clockContinue = () => {
    console.log(`clockContinue: ${this.clock.printWithOneIndexing()}`);
  };

  private onMIDIMessage = (event: MIDIMessageEvent) => {
    const m = event.data.reduce((memo, value) => memo + value.toString(2), "");
    const rawStatusByte = m.slice(0, 8);
    const messageType = MidiMessages.get(rawStatusByte);

    if (messageType && Ignore.includes(messageType)) return;

    switch (messageType) {
      case TimingClock:
        this.clock.increment();
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
        this.clock.set((msb << 7) + lsb);
        break;
      }
      default:
        break;
    }
  };
}
