import {mkdirSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const out = resolve('out');
mkdirSync(out, {recursive: true});
const serveUrl = await bundle({entryPoint: resolve('src/index.ts'), publicDir: resolve('public')});
const composition = await selectComposition({serveUrl, id: 'PosShowcase'});
const frames = [55, 170, 287, 360, 455, 535, 725, 920, 1035];
for (const frame of frames) {
  await renderStill({serveUrl, composition, output: resolve(out, `frame-${String(frame).padStart(4, '0')}.png`), frame, imageFormat: 'png'});
  console.log(`Rendered review frame ${frame} (${(frame / 30).toFixed(2)}s)`);
}
writeFileSync(resolve(out, 'storyboard.json'), JSON.stringify({fps: 30, duration: 36, frames}, null, 2));
