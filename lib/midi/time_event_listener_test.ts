import { assertEquals } from "../../test_utils.ts";
import { type Clock, TimeEventListener } from "./time_event_listener.ts";
import {
  assertSpyCalls,
  spy,
  stub,
} from "https://deno.land/std@0.210.0/testing/mock.ts";

type OnMIDIMessage = (
  this: MIDIInput,
  ev: Pick<MIDIMessageEvent, "data">,
) => unknown; // deno's lib.dom version is incorrect

Deno.test(TimeEventListener.name, async (t) => {
  const fakeInput = <MIDIInput> <unknown> {
    id: "fake-midi-input-device",
    name: "Fake MIDI Input Device",
    onmidimessage: (_evt: Event) => {
      throw new Error("this should've been stubbed or something");
    },
  };

  const fakeMIDIAccess = <MIDIAccess> <unknown> {
    inputs: new FakeMIDIInputMap([fakeInput]),
  };

  stub(navigator, "requestMIDIAccess", () => Promise.resolve(fakeMIDIAccess));

  await t.step(TimeEventListener.prototype.getDevices.name, async () => {
    const mel = new TimeEventListener((_c: Readonly<Clock>) => {});
    const result = await mel.getDevices();

    assertEquals([fakeInput], result);
  });

  await t.step(
    `on START message: should always invoke the provided 'onBarAdvanced' callback`,
    async () => {
      const onBarAdvanced = (_c: Readonly<Clock>) => {};
      const onBarAdvancedSpy = spy(onBarAdvanced);

      const mel = new TimeEventListener(onBarAdvancedSpy);
      await mel.install();

      const data = Uint8Array.from([parseInt("11111010", 2)]); // START Message Status Code
      (<OnMIDIMessage> <unknown> fakeInput.onmidimessage)({ data });
      assertSpyCalls(onBarAdvancedSpy, 1);
    },
  );

  await t.step(
    `on TimingClock message: after 192 messages, should advance our logical clock by two bars`,
    async () => {
      const onBarAdvanced = (_c: Readonly<Clock>) => {};
      const onBarAdvancedSpy = spy(onBarAdvanced);

      const mel = new TimeEventListener(onBarAdvancedSpy);
      await mel.install();

      // send 192 TimingClock messages (just enough to advance by two bars)
      const numMsgs = (
        4 * // sixteenths_per_beat
        4 * // beats_per_bar
        6 // ticks_per_sixteenth
      ) * 2; // 2 bars
      for (let i = 0; i < numMsgs; i++) {
        const data = Uint8Array.from([parseInt("11111000", 2)]); // TimingClock Message Status Code
        (<OnMIDIMessage> <unknown> fakeInput.onmidimessage)({ data });
      }

      assertEquals(2, mel.clock.bars);
      assertEquals(0, mel.clock.beats); // should have rolled over to 0
      assertEquals(0, mel.clock.sixteenths); // should have rolled over to 0

      assertSpyCalls(onBarAdvancedSpy, 2); // bar should have been advanced twice
    },
  );
});

class FakeMIDIInputMap {
  private inputs: MIDIInput[];

  constructor(inputs: MIDIInput[]) {
    this.inputs = inputs;
  }

  forEach(
    f: (value: MIDIInput, key: string, parent: MIDIInputMap) => void,
  ): void {
    this.inputs.forEach((value, index) =>
      f(value, `${index}`, <MIDIInputMap> <unknown> this)
    );
  }
}
