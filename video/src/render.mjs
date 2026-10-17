// Records a video source page (play-therapy.html, collaborative-divorce.html) with headless Chrome
// via the DevTools protocol (Node 22+). The page must define DURATION and renderAt(seconds).
//   node video/src/render.mjs <page.html> stills <out-dir> 5 12 20      -> PNG stills at those seconds
//   node video/src/render.mjs <page.html> video <out.mp4> /path/to/ffmpeg -> full 30fps H.264 video
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const [pageFile, mode, out, ...rest] = process.argv.slice(2);
const FPS = 30, PORT = 9344 + Math.floor(Math.random() * 500);
const here = dirname(fileURLToPath(import.meta.url));
const url = pathToFileURL(join(here, basename(pageFile))).href + '?render';
const profile = join(tmpdir(), `vid-render-${process.pid}`);
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ['--headless=new', `--remote-debugging-port=${PORT}`, '--hide-scrollbars', '--force-color-profile=srgb', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let page;
for (let i = 0; i < 60 && !page; i++) { try { page = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find((t) => t.type === 'page'); } catch {} if (!page) await sleep(250); }
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expression) => { const m = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (m.result?.exceptionDetails) throw new Error(JSON.stringify(m.result.exceptionDetails)); return m.result?.result?.value; };

await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url });
await sleep(1500);
await evaluate('window.fontsReady.then(() => document.fonts.size)');
const frame = async (t, format = 'png') => {
  await evaluate(`renderAt(${t})`);
  const m = await send('Page.captureScreenshot', { format, quality: format === 'jpeg' ? 92 : undefined, clip: { x: 0, y: 0, width: 1920, height: 1080, scale: 1 } });
  return Buffer.from(m.result.data, 'base64');
};

if (mode === 'stills') {
  mkdirSync(out, { recursive: true });
  for (const t of rest) { writeFileSync(join(out, `t${t}.png`), await frame(+t)); console.log('still', t); }
} else {
  const ffmpeg = spawn(rest[0], ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', resolve(out)], { stdio: ['pipe', 'inherit', 'inherit'] });
  const total = Math.round((await evaluate('DURATION')) * FPS);
  for (let f = 0; f < total; f++) {
    const buf = await frame(f / FPS, 'jpeg');
    if (!ffmpeg.stdin.write(buf)) await new Promise((r) => ffmpeg.stdin.once('drain', r));
    if (f % 150 === 0) console.log(`frame ${f}/${total}`);
  }
  ffmpeg.stdin.end();
  await new Promise((r) => ffmpeg.on('close', r));
  console.log('done', out);
}
chrome.kill();
await new Promise((r) => chrome.once('exit', r));
try { rmSync(profile, { recursive: true, force: true }); } catch {}
process.exit(0);
