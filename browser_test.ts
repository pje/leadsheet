import { assertEquals } from "https://deno.land/std@0.202.0/assert/assert_equals.ts";
import { time } from "https://deno.land/x/time.ts@v2.0.1/mod.ts";
import puppeteer, {
  Browser,
  Page,
} from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import * as path from "https://deno.land/std@0.204.0/path/mod.ts";

const indexAbsolutePath = path.resolve("./index.html");
const songFilePath = path.resolve("./songs/chelsea_bridge.txt");
const screenshotsPath = Deno.realPathSync(".");

Deno.test("index.html renders via file:// protocol", async () => {
  const browser = await setup();
  const page = await browser.newPage();

  try {
    await page.goto(`file://${indexAbsolutePath}`);

    assertEquals("Chelsea Bridge", await getTitle(page));
    assertEquals("Billy Strayhorn", await getArtist(page));
    assertEquals("Fm", await getKey(page));
    assertEquals("Eb7", (await getChords(page))[0]);

    await transpose(page, -3);

    assertEquals("Dm", await getKey(page));
    assertEquals("C7", (await getChords(page))[0]);
    assertEquals("-3", await getTransposedAmount(page));

    await uploadFile(page, songFilePath);

    assertEquals("0", await getTransposedAmount(page));
    assertEquals("Chelsea Bridge", await getTitle(page));
    assertEquals("Billy Strayhorn", await getArtist(page));
    assertEquals("Fm", await getKey(page));
    assertEquals("Eb7", (await getChords(page))[0]);

    await teardown(browser);
  } catch {
    const filename = path.join(
      screenshotsPath,
      `test-failure-${time().now().getSeconds()}.png`,
    );
    console.log(`🚨 test failure screenshot saved to: ${filename}`);
    await page.screenshot({ path: filename });
  }
});

async function setup(): Promise<Browser> {
  return await puppeteer.launch();
}

async function teardown(browser: Browser) {
  await browser.close();
}

async function getTitle(page: Page) {
  const titleSelector = await page.waitForSelector("#title-container .title");
  const title: string = await titleSelector!.evaluate((e) => e!.textContent);
  return title;
}

async function getArtist(page: Page) {
  const artistSelector = await page.waitForSelector("#title-container .artist");
  const artist: string = await artistSelector!.evaluate((e) => e!.textContent);
  return artist;
}

async function getKey(page: Page) {
  const keySelector = await page.waitForSelector("#title-container .key");
  const key: string = await keySelector!.evaluate((e) => e!.textContent);
  return key;
}

async function getTransposedAmount(page: Page) {
  const outputSelector = await page.waitForSelector("#title-container output");
  const amount: string = await outputSelector!.evaluate((e) => e!.textContent);
  return amount;
}

async function getChords(page: Page) {
  const chords: Array<string> = await (await page.$("#song"))!.$$eval(
    ".chord",
    (es) => es.map((e) => e.textContent).filter(String),
  );
  return chords;
}

async function transpose(page: Page, steps: number) {
  const selector = `#transpose-${steps > 0 ? "up" : "down"}`;

  for (let i = 0; i < Math.abs(steps); i++) {
    await page.click(selector);
  }
}

async function uploadFile(page: Page, filepath: string) {
  const input = await page.waitForSelector("#songfile");
  await input!.uploadFile(filepath);
}
