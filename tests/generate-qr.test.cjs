const { test } = require('node:test');
const assert = require('node:assert/strict');
const jsQR = require('../vendor/jsQR.js');
const { build, sheet } = require('../scripts/generate-qr.cjs');
const rows = ['barasoain','casa-real','cathedral','bahay'].map((site_id,i) => ({site_id,token:'test-code-'+i}));
test('all four QR codes decode to the correct website, site and token', () => {
  const codes = build('https://silip-example.vercel.app', rows);
  assert.equal(codes.length,4);
  for (const c of codes) {
    const scale=6,quiet=4,n=c.qr.getModuleCount(),size=(n+quiet*2)*scale;
    const rgba=new Uint8ClampedArray(size*size*4).fill(255);
    for(let y=0;y<n;y++) for(let x=0;x<n;x++) if(c.qr.isDark(y,x)) {
      for(let py=0;py<scale;py++) for(let px=0;px<scale;px++) {
        const offset=(((y+quiet)*scale+py)*size+(x+quiet)*scale+px)*4;
        rgba[offset]=rgba[offset+1]=rgba[offset+2]=0;
      }
    }
    const decoded=jsQR(rgba,size,size);
    assert.ok(decoded,'Could not scan '+c.id);
    const url=new URL(decoded.data);
    assert.equal(decoded.data,c.url);
    assert.equal(url.origin,'https://silip-example.vercel.app');
    assert.equal(url.searchParams.get('stamp'),c.id);
    assert.equal(url.searchParams.get('k'),rows.find(r=>r.site_id===c.id).token);
  }
  const html=sheet(codes);
  assert.equal((html.match(/<article/g)||[]).length,4);
  assert.match(html,/@page\{size:A4/);
});
test('rejects missing, duplicate and unknown tokens and incorrect website URLs', () => {
  for(const url of ['http://example.com','https://github.com/owner/repo','https://project.supabase.co','https://example.com/?x=1','https://user:password@example.com']) assert.throws(()=>build(url,rows));
  assert.throws(()=>build('https://example.com',rows.slice(1)));
  assert.throws(()=>build('https://example.com',[rows[0],rows[0],rows[2],rows[3]]));
  assert.throws(()=>build('https://example.com',[...rows.slice(0,3),{site_id:'unknown',token:'x'}]));
  assert.throws(()=>build('https://example.com',rows.map(r=>({...r,token:''}))));
});
