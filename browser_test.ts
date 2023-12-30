/// <reference lib="deno.ns" />

import * as log from "https://deno.land/std@0.209.0/log/mod.ts";
import { assertEquals } from "https://deno.land/std@0.209.0/assert/assert_equals.ts";
import { time } from "https://deno.land/x/time.ts@v2.0.1/mod.ts";
import puppeteer, {
  Browser,
  ElementHandle,
  Page,
} from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import * as path from "https://deno.land/std@0.209.0/path/mod.ts";
import { colorChords, FeatureFlagKeysType } from "./app/settings.ts";
import { assertArrayIncludes } from "https://deno.land/std@0.209.0/assert/assert_array_includes.ts";
import { normalizeAccidentals } from "./lib/string.ts";
import { NaturalNumber } from "./lib/types.ts";

const indexAbsolutePath = path.resolve("./index.html");
const songFilePath = path.resolve("./leadsheets/chelsea_bridge.leadsheet");
const screenshotsPath = Deno.realPathSync(".");

async function setup() {
  const [width, height] = [1200, 1400];

  return await puppeteer.launch({
    args: [`--window-size=${width},${height}`],
    defaultViewport: { width, height },
    // devtools: true, //  uncomment to debug (and set a breakpoint in vscode!)
    // headless: false, //  uncomment to debug
    // slowMo: 10, // in ms, uncomment to debug
  });
}

Deno.test("index.html", async (t) => {
  const browser = await setup();
  const page = await browser.newPage();
  setUpPageListeners(page);

  try {
    await page.goto(`file://${indexAbsolutePath}`);

    await t.step(`renders via file:// protocol`, async () => {
      assertEquals("Chelsea Bridge", await getTitle(page));
      assertEquals("Billy Strayhorn", await getArtist(page));
      assertEquals(0, await getTransposedAmount(page));
      assertEquals("Bbm", await getKey(page));
      assertEquals("BbmM7", (await getChords(page))[1]);
    });

    await t.step(`file upload`, async () => {
      await loadFile(page, songFilePath);

      assertEquals("Chelsea Bridge", await getTitle(page));
      assertEquals("Billy Strayhorn", await getArtist(page));
      assertEquals(0, await getTransposedAmount(page));
      assertEquals("Bbm", await getKey(page));
      assertEquals("BbmM7", (await getChords(page))[1]);

      await screenshotOnSuccess(page);
    });

    await t.step(`transpose buttons`, async () => {
      await clickTransposeDown(page, 1);

      assertEquals(-1, await getTransposedAmount(page));
      assertEquals("Am", await getKey(page));
      assertEquals("AmM7", (await getChords(page))[1]);

      await clickTransposeUp(page, 1);

      assertEquals(0, await getTransposedAmount(page));
      assertEquals("Bbm", await getKey(page));
      assertEquals("BbmM7", (await getChords(page))[1]);
    });

    await t.step(`settings: toggle features`, async () => {
      await enableFeature(page, colorChords);

      const firstChordsClasses = (await getChordClasses(page))[1]!;
      assertArrayIncludes(firstChordsClasses, ["min"]);
    });

    await t.step(
      `state is persisted across page reloads: song transposition`,
      async () => {
        await page.goto(`file://${indexAbsolutePath}`);
        await loadFile(page, songFilePath);
        assertEquals(0, await getTransposedAmount(page));
        assertEquals("Bbm", await getKey(page));

        await clickTransposeDown(page, 1);
        assertEquals(-1, await getTransposedAmount(page));
        assertEquals("Am", await getKey(page));
        assertEquals("AmM7", (await getChords(page))[1]);

        await page.reload();

        assertEquals(-1, await getTransposedAmount(page));
        assertEquals("Am", await getKey(page));
        assertEquals("AmM7", (await getChords(page))[1]);
      },
    );
  } catch (e) {
    await screenshotOnFailure(page);
    throw e;
  } finally {
    await teardown(browser);
  }
});

async function teardown(browser: Browser) {
  await browser.close();
}

async function getTitle(page: Page) {
  const titleSelector = await page.waitForSelector("#metadata .title");
  const title: string = await titleSelector!.evaluate((e) => e!.textContent);
  return title;
}

async function getArtist(page: Page) {
  const artistSelector = await page.waitForSelector("#metadata .artist");
  const artist: string = await artistSelector!.evaluate((e) => e!.textContent);
  return artist;
}

async function getKey(page: Page) {
  const keySelector = await page.waitForSelector("#metadata .key");
  const key: string = await keySelector!.evaluate((e) => e!.textContent);
  return key;
}

async function getTransposedAmount(page: Page) {
  const outputSelector = await page.waitForSelector("#transposed-steps");
  const amount: string = await outputSelector!.evaluate((e) => e!.textContent);
  return parseInt(amount);
}

async function getChords(page: Page) {
  const chords: Array<string> = await (await page.waitForSelector("#song"))!
    .$$eval(
      ".chord",
      (es) => es.map((e) => e.textContent).filter(String),
    );
  return chords.map(normalizeAccidentals);
}

async function clickTransposeUp(page: Page, times: NaturalNumber) {
  await _transposeRelativeByClick(page, times * 1);
  return page;
}

async function clickTransposeDown(page: Page, times: NaturalNumber) {
  await _transposeRelativeByClick(page, times * -1);
  return page;
}

async function _transposeRelativeByClick(page: Page, steps: number) {
  const selector = `#transpose-${steps > 0 ? "up" : "down"}`;

  for (let i = 0; i < Math.abs(steps); i++) {
    await page.click(selector);
  }

  return page;
}

async function loadFile(page: Page, filepath: string) {
  const input = (await page.waitForSelector("#songfile"))!;
  return await input.uploadFile(filepath);
}

async function enableFeature(page: Page, flag: FeatureFlagKeysType) {
  const input = <ElementHandle<HTMLInputElement>> await page.waitForSelector(
    `#settings input[name="${flag}"]`,
  );

  return await input?.click();
}

async function getChordClasses(page: Page) {
  const chords: string[][] = await (await page.waitForSelector("#song"))!
    .$$eval(
      ".chord",
      (es): string[][] => es.map((e) => Object.values(e.classList)),
    );
  return chords;
}

function setUpPageListeners(page: Page) {
  page
    .on("console", (message) =>
      log.error(
        `${message.type().slice(0, 3).toUpperCase()} ${message.text()}`,
      ))
    .on("pageerror", ({ message }) => {
      log.error(message);
      throw new Error(message);
    });
}

async function screenshotOnSuccess(page: Page) {
  const filename = path.join(screenshotsPath, `test-success.png`);
  return await page.screenshot({ path: filename });
}

async function screenshotOnFailure(page: Page) {
  const filename = path.join(
    screenshotsPath,
    `test-failure-${time().now().getSeconds()}.png`,
  );
  log.info(`🚨 test failure screenshot saved to: ${filename}`);

  return await page.screenshot({ path: filename });
}
