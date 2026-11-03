// Generate printable, token-bearing SILIP codes. Tokens are read from a local JSON file.
const fs = require('node:fs');
const path = require('node:path');
const qrcode = require('../vendor/qrcode.js');
const sites = [
  ['barasoain', 'Barasoain Church'], ['casa-real', 'Casa Real'],
  ['cathedral', 'Malolos Cathedral'], ['bahay', 'Bahay ng mga Kababaihan ng Malolos']
];
const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function build(base, rows) {
  const url = new URL(base);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new Error('Use your live HTTPS website URL without query parameters or credentials.');
  if (/supabase\.co$|github\.com$/i.test(url.hostname)) throw new Error('Use the deployed website URL, not the Supabase or GitHub URL.');
  if (!Array.isArray(rows) || rows.length !== sites.length) throw new Error('Provide exactly four site/token rows.');
  const tokens = new Map();
  for (const row of rows) {
    if (!sites.some(([id]) => id === row.site_id) || tokens.has(row.site_id) || typeof row.token !== 'string' || !row.token.trim() || row.token.length > 512) throw new Error('Invalid, missing, or duplicate site token.');
    tokens.set(row.site_id, row.token);
  }
  return sites.map(([id, name]) => {
    const target = new URL(url); target.pathname = target.pathname.replace(/\/?$/, '/');
    target.searchParams.set('stamp', id); target.searchParams.set('k', tokens.get(id));
    const qr = qrcode(0, 'M'); qr.addData(target.href); qr.make();
    return { id, name, url: target.href, qr, svg: qr.createSvgTag({ cellSize: 12, margin: 48, scalable: true }) };
  });
}
function sheet(codes) {
  return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SILIP · Heritage QR codes</title><style>' +
    '@page{size:A4;margin:12mm}*{box-sizing:border-box}body{margin:0;background:#f4eee4;color:#123f70;font-family:Arial,sans-serif}header{max-width:850px;margin:24px auto;text-align:center}h1{font:32px Georgia,serif;margin:0}header p{font-size:14px}button{padding:12px 20px;border:0;border-radius:10px;background:#123f70;color:white;cursor:pointer}.sheet{max-width:850px;margin:24px auto;display:grid;grid-template-columns:1fr 1fr;gap:18px;padding:16px}.site{border:1px solid #123f7044;border-radius:18px;background:white;text-align:center;padding:24px 20px;break-inside:avoid}.brand{font:26px Georgia,serif;letter-spacing:3px;margin:0}.subtitle{font-size:10px;letter-spacing:1px;text-transform:uppercase}.site svg{display:block;width:100%;max-width:270px;height:auto;margin:16px auto}h2{font:21px/1.3 Georgia,serif;margin:8px 0 12px;min-height:54px}.instruction{font-size:13px;line-height:1.6;margin:0}.place{font-size:10px;letter-spacing:1px;margin-top:18px}@media(max-width:540px){.sheet{grid-template-columns:1fr}}@media print{body{background:white}header{display:none}.sheet{margin:0;padding:0;gap:8mm}.site{padding:8mm 5mm;min-height:120mm;border-color:#aaa}.site svg{max-width:58mm}h2{font-size:17pt}}</style>' +
    '<header><h1>SILIP · Heritage QR codes</h1><p>Print at 100% scale. Place each code at its matching heritage site.</p><button onclick="window.print()">Print / Save PDF</button></header><main class="sheet">' +
    codes.map(c => '<article class="site"><p class="brand">SILIP</p><p class="subtitle">Digital Heritage Passport</p>' + c.svg + '<h2>' + escape(c.name) + '</h2><p class="instruction">Scan to discover this heritage site<br>and collect your digital stamp.</p><p class="place">MALOLOS, BULACAN</p></article>').join('') + '</main></html>';
}
if (require.main === module) {
  try {
    const [base, input, output = 'qr-output'] = process.argv.slice(2);
    if (!base || !input) throw new Error('Usage: node scripts/generate-qr.cjs https://YOUR-SITE.vercel.app qr-tokens.local.json [output-folder]');
    const codes = build(base, JSON.parse(fs.readFileSync(input, 'utf8').replace(/^\uFEFF/, '')));
    fs.mkdirSync(output, { recursive: true });
    codes.forEach(c => fs.writeFileSync(path.join(output, 'silip-' + c.id + '-qr.svg'), c.svg));
    fs.writeFileSync(path.join(output, 'print-all.html'), sheet(codes));
    console.log('Created four SVG codes and print-all.html in ' + path.resolve(output));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { build, sheet };
