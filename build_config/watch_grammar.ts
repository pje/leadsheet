import { debounce } from "https://deno.land/std@0.212.0/async/debounce.ts";
import { generateBundles } from "./build_grammar.ts";

export async function watch(
  filePath: string,
  onChange: (e: Deno.FsEvent) => unknown,
  config: { debounceMs: number } = { debounceMs: 250 },
) {
  const watcher = Deno.watchFs(filePath);
  for await (const event of watcher) {
    debounce(onChange, config.debounceMs)(event);
  }
}

export async function watchGrammar(
  filePath: string,
  opts?: { customHeader?: string },
) {
  let fileContents: string | undefined = undefined;

  const handleFsChange = ({ paths: [path, ..._rest] }: Deno.FsEvent) => {
    const thisTime = Deno.readTextFileSync(path!);
    if (thisTime !== fileContents) {
      console.log(`[watch] ohm bundle building (change: "${path!}")`);
      try {
        generateBundles(filePath, opts);
        fileContents = thisTime;
      } catch (e: unknown) {
        console.error(e);
        return;
      }
      console.log(`[watch] 🧘 ohm bundle complete`);
    }
  };

  return await watch(filePath, handleFsChange);
}
