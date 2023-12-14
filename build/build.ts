import * as esbuild from "https://deno.land/x/esbuild@v0.19.9/mod.js";
import { type BuildOptions } from "https://deno.land/x/esbuild@v0.19.9/mod.js";
import { generateBundles } from "./build_grammar.ts";
import { watchGrammar } from "./watch_grammar.ts";

const grammarFile = "./parser/grammar.ohm";
const denoFmtIgnore = "// deno-fmt-ignore-file\n";

const options: BuildOptions = {
  logLevel: "info",
  entryPoints: ["index.ts"],
  target: "chrome58",
  outdir: ".",
  metafile: true,
  bundle: true,
  sourcemap: true,
};

async function watch() {
  const ctx = await esbuild.context(options);
  await Promise.allSettled([
    ctx.watch(),
    watchGrammar(grammarFile, { customHeader: denoFmtIgnore }),
  ]);
}

async function build() {
  generateBundles(grammarFile, { customHeader: denoFmtIgnore });
  await esbuild.build(options);
  esbuild.stop();
}

const mode = Deno.args.includes("watch") ? "watch" : "build";
await ((mode == "watch") ? watch() : build());
