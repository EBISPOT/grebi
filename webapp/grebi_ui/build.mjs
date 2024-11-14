import { exec } from "child_process";
import { build } from "esbuild";
import fs from "fs";

let define = {};
for (const k in process.env) {
  define[`process.env.${k}`] = JSON.stringify(process.env[k]);
}

///
/// Build index.html (simple find and replace)
///
console.log("### Building index.html");
var public_url = process.env.PUBLIC_URL.endsWith("/") ? process.env.PUBLIC_URL : process.env.PUBLIC_URL + "/";
fs.writeFileSync(
  "dist/index.html",
  fs
    .readFileSync("index.html.in")
    .toString()
    .split("%PUBLIC_URL%/")
    .join(public_url || "/")
    .split("%PUBLIC_URL%")
    .join(public_url || "/")
);

///
/// Build bundle.js (esbuild)
///
console.log("### Building bundle.js");
build({
  entryPoints: [`src/index_${process.env.GREBI_FRONTEND}.tsx`],
  bundle: true,
  platform: "browser",
  outfile: "dist/bundle.js",
  define,
  plugins: [],
  logLevel: "info",
  sourcemap: "linked",

  ...(process.env.GREBI_MINIFY === "true"
    ? {
        minify: true,
      }
    : {}),
});

///
/// Build styles.css (tailwind)
///
console.log("### Building styles.css");
exec(`tailwind -i ./src/styles_${process.env.GREBI_FRONTEND}.css -o ./dist/styles.css`);

///
/// Copy files
///
// console.log("### Copying misc files");
// exec("cp ./src/banner.txt ./dist"); // home page banner text


