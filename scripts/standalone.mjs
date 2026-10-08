import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const root = "apps/designer-lite/dist";
let html = readFileSync(join(root, "index.html"), "utf8");
html = html.replace(
  /<script[^>]*src="([^"]+)"[^>]*><\/script>/g,
  (_, src) =>
    '<script type="module">' +
    readFileSync(join(root, src.replace(/^\//, "")), "utf8").replaceAll(
      "</script",
      "<\\/script",
    ) +
    "</script>",
);
html = html.replace(
  /<link[^>]*href="([^"]+\.css)"[^>]*>/g,
  (_, src) =>
    "<style>" +
    readFileSync(join(root, src.replace(/^\//, "")), "utf8") +
    "</style>",
);
writeFileSync("Solar_Designer_Lite.html", html);
console.log(
  "Standalone HTML written; embedded scripts and CSS, no CDN dependencies",
);
