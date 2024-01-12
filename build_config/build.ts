import * as esbuild from "https://deno.land/x/esbuild@v0.19.11/mod.js";
import { type BuildOptions } from "https://deno.land/x/esbuild@v0.19.11/mod.js";
import { generateBundles } from "./build_grammar.ts";
import { watchGrammar } from "./watch_grammar.ts";

const grammarFile = "./parser/grammar.ohm";
const denoFmtIgnore = "// deno-fmt-ignore-file\n";

const options: BuildOptions = {
  bundle: true,
  entryPoints: [
    "index.html",
    "index.ts",
    "style/index.css",
  ],
  loader: {
    ".eot": "file",
    ".html": "copy",
    ".svg": "dataurl",
    ".ttf": "file",
    ".woff": "file",
    ".woff2": "file",
  },
  logLevel: "info",
  metafile: true,
  outdir: "build",
  sourcemap: true,
  target: "chrome58",
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
