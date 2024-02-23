import { bootstrap } from "./app/app.ts";

globalThis.onload = bootstrap;

export default bootstrap; // just here to satisfy esbuild
