import { ParseSong } from "../parser/parser.ts";
import * as path from "https://deno.land/std@0.208.0/path/mod.ts";

const __filename = path.fromFileUrl(import.meta.url);
const __bin = __filename.endsWith(".ts")
  ? `deno run ${__filename}`
  : __filename;

const usage = `Usage: ${__bin} <command> [options]

Commands:

      parse: parse a leadsheet from stdin, format, and print to stdout [default]

Options:

      --format=leadsheet [default]
        Print a pretty-formatted .leadsheet

      --format=json
        Print parsed song as JSON
`;

export default async function main() {
  if (!Deno.args.includes("parse") || Deno.args.includes("--help")) {
    console.info(usage);
    Deno.exit(1);
  }

  const buf = new Uint8Array(2048);
  const n = <number> await Deno.stdin.read(buf);
  const decoder = new TextDecoder();
  const text = decoder.decode(buf.subarray(0, n)).trim();

  const { value: song, error } = ParseSong(text);
  if (error) {
    console.error(error);
    Deno.exit(1);
  }

  const formatted = Deno.args.includes("--format=json")
    ? JSON.stringify(song, null, 2)
    : song.format();

  console.info(formatted);

  return;
}

await main();
Deno.exit(0);
