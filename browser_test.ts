import { assertEquals } from "https://deno.land/std@0.202.0/assert/assert_equals.ts";
import puppeteer, {
  Browser,
  Page,
} from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import * as path from "https://deno.land/std@0.204.0/path/mod.ts";

const indexAbsolutePath = path.resolve("./index.html");

Deno.test("index.html renders via file:// protocol", async () => {
  const browser = await setup();
  const page = await browser.newPage();

  await page.goto(`file://${indexAbsolutePath}`);

  assertEquals("Chelsea Bridge", await getTitle(page));
  assertEquals("Fm", await getKey(page));
  assertEquals("Eb7", (await getChords(page))[0]);

  await transpose(page, -3);

  assertEquals("Dm", await getKey(page));
  assertEquals("C7", (await getChords(page))[0]);

  await teardown(browser);
});

async function setup(): Promise<Browser> {
  return await puppeteer.launch();
}

async function teardown(browser: Browser) {
  await browser.close();
}

async function getTitle(page: Page) {
  const titleSelector = await page.waitForSelector("#title-container .title");
  const title: string = await titleSelector!.evaluate((el) => el!.textContent);
  return title;
}

async function getKey(page: Page) {
  const keySelector = await page.waitForSelector("#title-container .key");
  const key: string = await keySelector!.evaluate((el) => el!.textContent);
  return key;
}

async function getChords(page: Page) {
  const chords: Array<string> = await (await page.$(".song"))!.$$eval(
    ".chord",
    (es) => es.map((e) => e.textContent).filter(String)
  );
  return chords;
}

async function transpose(page: Page, steps: number) {
  const selector = `#transpose-${steps > 0 ? "up" : "down"}`;

  for (let i = 0; i < Math.abs(steps); i++) {
    await page.click(selector);
  }
}
