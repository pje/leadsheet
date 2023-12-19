import * as esbuild from "https://deno.land/x/esbuild@v0.19.10/mod.js";
import { type BuildOptions } from "https://deno.land/x/esbuild@v0.19.10/mod.js";
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

async function build() {
  generateBundles(grammarFile, { customHeader: denoFmtIgnore });
  await esbuild.build(options);
  esbuild.stop();
}

async function watch() {
  await build();
  const ctx = await esbuild.context(options);
  await Promise.allSettled([
    // typecheck(),
    ctx.watch(),
    watchGrammar(grammarFile, { customHeader: denoFmtIgnore }),
  ]);
}

// async function typecheck() {
//   const command = new Deno.Command("deno", { args: ["check", "index.ts"] });

//   const e = await command.output();
//   const { code, stderr } = e;
//   if (code !== 0) console.error(stderr);
// }

const mode = Deno.args.includes("watch") ? "watch" : "build";
await ((mode == "watch") ? watch() : build());
