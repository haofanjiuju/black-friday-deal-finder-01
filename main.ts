// DealSleuth entry program (Node 22, standard library only).
//
// The site is the plain static files in this repository's app/ folder: no build
// step, no network loads, the deals in its own data module. This program hands
// the entry in: it copies app/ and screenshots/ next to this file into the
// output directory and writes /output/dossier.json, the summary the judge
// reads (screenshots, first-load files and bytes, and the site's source),
// built with the vendored make.fun library. vendor/makefun-frontend.ts must
// stay exactly as the kit shipped it: the scorer rebuilds the dossier with
// its own copy and requires the two to match byte for byte.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Start from an empty output directory so a stale file can never ride along.
// Never remove the output directory itself: in the grader it is a mount
// point, and deleting it fails. Only clear its contents.
mkdirSync(outputDir, { recursive: true });
for (const entry of readdirSync(outputDir)) {
  rmSync(join(outputDir, entry), { recursive: true, force: true });
}

cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The scorer's own caps, as the kit states them: the dossier text is capped at
// 160 KiB, at most 4 screenshots of 256 KiB each, app/ at most 993 files and
// directories and 16 MiB in all. The dossier is refused if app/ or
// screenshots/ is already past those limits.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log(`DealSleuth entry written to ${outputDir}`);
