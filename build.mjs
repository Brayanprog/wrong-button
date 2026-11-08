// Build script: bundles the React game with esbuild into dist/ as a static
// site (index.html + app.js + assets). Vercel runs `npm run build`.
import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');

fs.rmSync(dist, {recursive: true, force: true});
fs.mkdirSync(dist, {recursive: true});

await esbuild.build({
  entryPoints: [path.join(root, 'index.tsx')],
  bundle: true,
  outfile: path.join(dist, 'app.js'),
  format: 'iife',
  platform: 'browser',
  target: ['es2020'],
  jsx: 'automatic',
  loader: {'.tsx': 'tsx', '.ts': 'ts'},
  minify: true,
  sourcemap: true,
  logLevel: 'info',
});

// Static files: the HTML shell and the shipped binary assets (fonts + music).
fs.copyFileSync(path.join(root, 'index.html'), path.join(dist, 'index.html'));
fs.cpSync(path.join(root, 'assets'), path.join(dist, 'assets'), {recursive: true});

// Favicon: the museum's red specimen button.
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle cx="25.5" cy="25.5" r="21" fill="#F2C9BC" stroke="#2E2419" stroke-width="2.4"/><circle cx="25.5" cy="25.5" r="16.7" fill="#CB5243" stroke="#94352A" stroke-width="1.4"/><circle cx="21" cy="21" r="2.1" fill="#FFF9E9"/><circle cx="30" cy="21" r="2.1" fill="#FFF9E9"/><circle cx="21" cy="30" r="2.1" fill="#FFF9E9"/><circle cx="30" cy="30" r="2.1" fill="#FFF9E9"/></svg>`;
fs.writeFileSync(path.join(dist, 'favicon.svg'), favicon);

console.log('Build complete → dist/');
