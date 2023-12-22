import commands from "../node_modules/@ohm-js/cli/src/commands/index.js";
const generateBundlesCommand = commands[0]!;

export function generateBundles(
  grammarPath: string,
  opts?: { customHeader?: string },
) {
  const result = generateBundlesCommand.action(grammarPath, {
    esm: true,
    withTypes: true,
  });
  if (opts?.customHeader) addCustomHeader(grammarPath, opts.customHeader);
  console.log(`🧘 ohm bundle complete`);
  return result;
}

function addCustomHeader(grammarPath: string, header: string) {
  const bundleFiles = [
    `${grammarPath}-bundle.d.ts`,
    `${grammarPath}-bundle.js`,
  ];

  for (const filePath of bundleFiles) {
    const data = Deno.readFileSync(filePath);
    const str = (new TextDecoder("utf-8")).decode(data);

    const withHeader = header + str;

    Deno.writeTextFileSync(filePath, withHeader);
  }
}
