// css imports are just here so esbuild processes the css file
import "./style/style.css";
import "./style/atoms.css";
import { bootstrap } from "./app/app.ts";

window.onload = bootstrap;

export default bootstrap; // just here to satisfy esbuild
