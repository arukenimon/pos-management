import assert from 'node:assert/strict';
import {copyFileSync, existsSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';

const source = resolve('out/pos-showcase.mp4');
const soundtrack = resolve('public/soundtrack.wav');
const output = resolve('out/pos-showcase-upbeat.mp4');
const backup = resolve('out/pos-showcase-original-music.mp4');

function run(name, args) {
  const result = spawnSync(name, args, {encoding: 'utf8', windowsHide: true, maxBuffer: 4 * 1024 * 1024});
  if (result.error) throw result.error;
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}
function trackHash(file, type) {
  return run('ffmpeg', ['-v', 'error', '-i', file, '-map', `0:${type}:0`, '-c', 'copy', '-f', 'hash', '-hash', 'sha256', '-']);
}

assert.ok(existsSync(source), 'Render the video once before replacing its music');
assert.ok(existsSync(soundtrack), 'Generate the soundtrack first with npm run assets');
const videoBefore = trackHash(source, 'v');
const audioBefore = trackHash(source, 'a');
if (!existsSync(backup)) copyFileSync(source, backup);

// Copy the encoded picture. Only the new soundtrack is encoded.
run('ffmpeg', ['-v', 'error', '-y', '-i', source, '-i', soundtrack,
  '-map', '0:v:0', '-map', '1:a:0', '-map_metadata', '0',
  '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-ar', '48000',
  '-t', '36', '-movflags', '+faststart',
  '-metadata', 'comment=Remotion POS showcase; original music: Everyday in Motion', output]);

const videoAfter = trackHash(output, 'v');
const audioAfter = trackHash(output, 'a');
assert.equal(videoAfter, videoBefore, 'The encoded video track must remain identical');
const audioChanged = audioAfter !== audioBefore;
copyFileSync(output, source);
const report = {output, canonicalVideo: source, originalMusicBackup: backup, videoBefore, videoAfter, videoUnchanged: true, audioBefore, audioAfter, audioChanged};
writeFileSync(resolve('out/music-update.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
