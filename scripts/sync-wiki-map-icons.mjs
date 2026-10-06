import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import HK from "../src/core/completion-database.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "public/assets/wiki-icons");
const mapOutput = resolve(root, "public/assets/wiki-location-maps");
const manifest = resolve(root, "src/data/wiki-icon-pages.json");
const mapManifest = resolve(root, "src/data/wiki-location-pages.json");
const pages = new Set();
for (const section of Object.values(HK.sections)) {
  for (const entry of Object.values(section.entries || {})) {
    if (entry.wiki) pages.add(entry.wiki.split("#")[0]);
  }
}

function slug(page) {
  return wikiTitle(page).toLowerCase().replaceAll("'", "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function wikiTitle(page) {
  const title = decodeURIComponent(page);
  return title === "Hot_Springs" ? "Hot_Spring" : title;
}

async function runMagick(input, destination) {
  await new Promise((resolveRun, rejectRun) => {
    const process = spawn("magick", [input, "-thumbnail", "128x128", "-background", "none", "-gravity", "center", "-extent", "128x128", "-quality", "82", destination], { stdio: "ignore" });
    process.on("error", rejectRun);
    process.on("exit", code => code === 0 ? resolveRun() : rejectRun(new Error(`Image conversion failed (${code}): ${input}`)));
  });
}

async function runMapMagick(input, destination) {
  await new Promise((resolveRun, rejectRun) => {
    const process = spawn("magick", [input, "-resize", "520x520", "-quality", "84", destination], { stdio: "ignore" });
    process.on("error", rejectRun);
    process.on("exit", code => code === 0 ? resolveRun() : rejectRun(new Error(`Map conversion failed (${code}): ${input}`)));
  });
}

await rm(output, { recursive: true, force: true });
await rm(mapOutput, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await mkdir(mapOutput, { recursive: true });
let completed = 0;
const iconPages = {};
const locationPages = {};
const queue = [...new Set([...pages].map(wikiTitle))];
const worker = async () => {
  while (queue.length) {
    const page = queue.shift();
    const destination = resolve(output, `${slug(page)}.webp`);
    const temporary = `${destination}.source`;
    try {
      const title = wikiTitle(page);
      const response = await fetch(`https://hollowknight.wiki/w/${encodeURIComponent(title.replaceAll(" ", "_"))}`);
      if (!response.ok) throw new Error(`Page request returned ${response.status}`);
      const html = await response.text();
      const imageTag = html.match(/<img\b[^>]*class="[^"]*\bpi-image-thumbnail\b[^"]*"[^>]*>/i)?.[0];
      const imageSource = imageTag?.match(/\bsrc="([^"]+)"/i)?.[1];
      if (imageSource) {
        const sourceName = decodeURIComponent(imageSource.split("/").at(-1).replace(/^\d+px-/, ""));
        if (!/(^|[_-])(map|mapshot|screenshot|location)([_\-.]|$)/i.test(sourceName)) {
          const imageUrl = imageSource.startsWith("//") ? `https:${imageSource}` : imageSource;
          const imageResponse = await fetch(imageUrl);
          if (!imageResponse.ok) throw new Error(`Image request returned ${imageResponse.status}`);
          await writeFile(temporary, Buffer.from(await imageResponse.arrayBuffer()));
          await runMagick(temporary, destination);
          iconPages[title] = `${slug(page)}.webp`;
        }
      }

      const locationImages = [];
      const imageTags = [...html.matchAll(/<img\b[^>]*>/gi)].map(match => match[0]);
      for (const tag of imageTags) {
        const alt = tag.match(/\balt="([^"]*)"/i)?.[1] || "";
        const source = tag.match(/\bsrc="([^"]+)"/i)?.[1];
        const sourceName = source ? decodeURIComponent(source.split("/").at(-1).replace(/^\d+px-/, "")) : "";
        if (!/Mapshot/i.test(sourceName)) continue;
        const srcset = tag.match(/\bsrcset="([^"]+)"/i)?.[1];
        const mapUrl = srcset?.split(",").map(candidate => candidate.trim().split(/\s+/)[0]).at(-1) || source;
        const file = `${slug(page)}-location-${locationImages.length + 1}.webp`;
        const mapPath = resolve(mapOutput, file);
        const mapTemp = `${mapPath}.source`;
        try {
          const mapResponse = await fetch(mapUrl.startsWith("//") ? `https:${mapUrl}` : mapUrl);
          if (!mapResponse.ok) throw new Error(`Map image request returned ${mapResponse.status}`);
          await writeFile(mapTemp, Buffer.from(await mapResponse.arrayBuffer()));
          await runMapMagick(mapTemp, mapPath);
          const label = alt.replaceAll("&amp;", "&").replaceAll("&#039;", "'") || sourceName.replace(/^Mapshot_HK_?/i, "").replace(/[_-]+/g, " ").replace(/\.[^.]+$/, "");
          locationImages.push({ file, label });
        } catch (error) {
          console.warn(`Skipped location map for ${page}: ${error.message}`);
        } finally {
          await rm(mapTemp, { force: true });
        }
      }
      if (locationImages.length) locationPages[title] = locationImages;
      await rm(temporary, { force: true });
      completed++;
      if (completed % 25 === 0) console.log(`Downloaded ${completed}/${pages.size} wiki icons`);
    } catch (error) {
      await rm(temporary, { force: true });
      console.warn(`Skipped ${page}: ${error.message}`);
    }
  }
};

await Promise.all(Array.from({ length: 6 }, worker));
const downloaded = (await readdir(output)).filter(name => name.endsWith(".webp")).length;
const downloadedMaps = (await readdir(mapOutput)).filter(name => name.endsWith(".webp")).length;
await writeFile(manifest, `${JSON.stringify(iconPages, null, 2)}\n`);
await writeFile(mapManifest, `${JSON.stringify(locationPages, null, 2)}\n`);
console.log(`Saved ${downloaded} infobox icons and ${downloadedMaps} location maps for ${pages.size} distinct pages`);
