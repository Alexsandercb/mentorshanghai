import fs from 'node:fs';
import path from 'node:path';

const htmlPath = 'index.html';
const cssPath = 'assets/css/styles.css';
const html = fs.readFileSync(htmlPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');

const htmlReferences = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((reference) => !reference.startsWith('http') && !reference.startsWith('#'))
  .map((reference) => reference.split(/[?#]/)[0]);

const cssReferences = [...css.matchAll(/url\(["']?([^"')]+)["']?\)/g)]
  .map((match) => match[1])
  .filter((reference) => !reference.startsWith('data:') && !reference.startsWith('http'))
  .map((reference) => path.normalize(path.join(path.dirname(cssPath), reference.split(/[?#]/)[0])));

const missingReferences = [...htmlReferences, ...cssReferences]
  .filter((reference) => !fs.existsSync(reference));

if (missingReferences.length) {
  console.error('Referências locais ausentes:', missingReferences);
  process.exitCode = 1;
}

if (/\sstyle=/.test(html) || /<script(?![^>]*\ssrc=)/i.test(html)) {
  console.error('CSS ou JavaScript inline detectado no HTML.');
  process.exitCode = 1;
}

if (!html.includes('Content-Security-Policy')) {
  console.error('Content Security Policy ausente.');
  process.exitCode = 1;
}

if (process.exitCode) process.exit();
console.log('Projeto validado: referências, separação de arquivos e CSP estão corretas.');
