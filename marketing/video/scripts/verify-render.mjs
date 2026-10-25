import assert from 'node:assert/strict';
import {mkdirSync, writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';

const file = resolve(process.argv[2] || 'out/pos-showcase.mp4');
function command(name, args) {
  const result = spawnSync(name, args, {encoding: 'utf8', windowsHide: true, maxBuffer: 8 * 1024 * 1024});
  if (result.error) throw result.error;
  assert.equal(result.status, 0, result.stderr);
  return result;
}
const metadata = JSON.parse(command('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', file]).stdout);
const video = metadata.streams.find(stream => stream.codec_type === 'video');
const audio = metadata.streams.find(stream => stream.codec_type === 'audio');
assert.ok(video, 'Missing video stream');
assert.ok(audio, 'Missing audio stream');
assert.equal(video.width, 1920);
assert.equal(video.height, 1080);
assert.equal(video.codec_name, 'h264');
assert.equal(video.pix_fmt, 'yuv420p');
assert.equal(video.color_space, 'bt709');
assert.equal(video.r_frame_rate, '30/1');
assert.equal(Number(video.nb_frames), 1080);
assert.ok(Math.abs(Number(metadata.format.duration) - 36) < .1, 'Unexpected duration');
assert.equal(audio.channels, 2);
const inspection = command('ffmpeg', ['-hide_banner', '-i', file, '-vf', 'blackdetect=d=0.15:pix_th=0.1', '-af', 'volumedetect', '-f', 'null', '-']).stderr;
assert.ok(!inspection.includes('black_start:'), 'Unexpected black section');
const mean = Number(inspection.match(/mean_volume:\s*([\d.-]+) dB/)?.[1]);
const peak = Number(inspection.match(/max_volume:\s*([\d.-]+) dB/)?.[1]);
assert.ok(Number.isFinite(mean) && mean > -40, 'Audio is missing or too quiet');
assert.ok(Number.isFinite(peak) && peak < -.5, 'Audio may clip');
const report = {file, duration: Number(metadata.format.duration), frames: Number(video.nb_frames), dimensions: [video.width, video.height], fps: video.r_frame_rate, codec: video.codec_name, pixelFormat: video.pix_fmt, colorSpace: video.color_space, audioCodec: audio.codec_name, channels: audio.channels, audioMeanDb: mean, audioPeakDb: peak, blackSections: 0, bytes: Number(metadata.format.size)};
mkdirSync(resolve('out'), {recursive: true});
writeFileSync(resolve('out/verification.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
