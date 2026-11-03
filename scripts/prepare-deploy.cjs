// Create the static production folder used by Vercel or manual hosting uploads.
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'deploy', 'silip');
fs.mkdirSync(output, { recursive: true });

for (const name of [
  'index.html', 'styles.css', 'app.js', 'account.js', 'cloud.js',
  'config.js', 'sw.js', 'manifest.json', 'admin.html', 'qr.html'
]) fs.copyFileSync(path.join(root, name), path.join(output, name));

for (const directory of ['icons', 'vendor', 'fonts']) {
  fs.cpSync(path.join(root, directory), path.join(output, directory), { recursive: true });
}

fs.mkdirSync(path.join(output, 'assets'), { recursive: true });
for (const name of [
  'heritage-collage.png', 'thanks.jpg', 'stamp-barasoain.png',
  'stamp-casa-real.png', 'stamp-cathedral.png', 'stamp-bahay.png'
]) fs.copyFileSync(path.join(root, 'assets', name), path.join(output, 'assets', name));

const configPath = path.join(output, 'config.js');
const config = fs.readFileSync(configPath, 'utf8');
if (!/demo:\s*(true|false)/.test(config)) throw new Error('Missing demo configuration.');
fs.writeFileSync(configPath, config.replace(/demo:\s*(true|false)/, 'demo: false'));
console.log('Production site prepared in deploy/silip (demo collection disabled).');
