// Run with a local server at 127.0.0.1:4173 and headless Chrome CDP at port 9224.
// UI tests use an in-memory account service; they never send real email.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const mock = `(() => {
  localStorage.setItem('silip.v1', JSON.stringify({name:'Guest name',age:'20',photo:'',issued:'2026-11-03T00:00:00Z',uid:'guest-ui',stamps:{barasoain:'2026-11-03'},pending:{},lang:'en'}));
  let uid='guest-ui', verified=false, email='', profile=null, kind='', requested='';
  const calls=[];
  const cloud={ enabled:true,demo:true,onSignIn:null,
    async init(){},uid:()=>uid,isPermanent:()=>verified,hasVerifiedEmail:()=>verified,email:()=>email,
    async fetchProfile(){return profile},
    async fetchStamps(){return uid==='other-user'?[{site_id:'casa-real',collected_at:'2026-11-03'}]:uid==='guest-ui'?[{site_id:'barasoain',collected_at:'2026-11-03'}]:[]},
    async requestEmailCode(address,create){calls.push({address,create});kind=create?'email_change':'email';requested=address;return kind},
    async verifyEmailCode(address,code,type){if(code!=='123456')throw Error('bad code');if(type!==kind||address!==requested)throw Error('wrong request');verified=true;email=address;if(type==='email'){uid='other-user';profile={name:'Other owner',age:44,photo:'',issued_at:'2026-11-01T00:00:00Z'}}setTimeout(()=>{cloud.onSignIn?.();window.dispatchEvent(new Event('silip:auth'))},0)},
    async saveProfile(p){if(!verified)throw Error('not verified');profile={...p};calls.push({saved:p})},
    async reset(){verified=false;uid='guest-after-logout';email='';profile=null;cloud.onSignIn?.();window.dispatchEvent(new Event('silip:auth'))},
    async collect(){return {ok:true}},async linkEmail(){},async signInEmail(){}
  };
  window.mockAccount={cloud,calls,getProfile:()=>profile};
  Object.defineProperty(window,'SilipCloud',{get:()=>cloud,set:()=>{},configurable:true});
})();`;

async function page(source) {
  const t=await(await fetch('http://127.0.0.1:9224/json/new?about:blank',{method:'PUT'})).json();
  const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
  let id=0;const pending=new Map(),errors=[];
  ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result)}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text)};
  const call=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}))});
  const ev=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value};
  await call('Page.enable');await call('Runtime.enable');await call('Network.enable');
  await call('Network.setBypassServiceWorker',{bypass:true});await call('Network.setCacheDisabled',{cacheDisabled:true});
  await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  if(source)await call('Page.addScriptToEvaluateOnNewDocument',{source});
  await call('Page.navigate',{url:'http://127.0.0.1:4173/?lang=en&test=accounts#home'});
  await new Promise(r=>setTimeout(r,1500));
  return {call,ev,errors,async close(){await call('Page.close');ws.close()}};
}
const pause=()=>new Promise(r=>setTimeout(r,150));
(async()=>{
  // Keep the unavailable-state test isolated even after real credentials are configured.
  let p=await page(`Object.defineProperty(window,'SILIP_CONFIG',{get:()=>({}),set:()=>{},configurable:true});`);
  try {
    await p.ev(`document.querySelector('#accountBtn').click()`);await pause();
    assert.equal(await p.ev(`!document.querySelector('#accountUnavailable').hidden && document.querySelector('#accountSend').disabled`),true);
    assert.deepEqual(p.errors,[]);
    console.log('PASS: blank configuration shows honest unavailable state and disables email sending');
  }finally{await p.close()}
  p=await page(mock);
  try {
    await p.ev(`document.querySelector('[data-go="passport"]').click()`);await pause();
    assert.equal(await p.ev(`document.querySelector('#passportAccess').classList.contains('is-locked') && document.querySelector('#passportContent').inert && document.querySelector('#savePassport').disabled`),true);
    assert.equal(await p.ev(`getComputedStyle(document.querySelector('#passportContent')).filter.includes('blur')`),true);
    fs.writeFileSync('assets/passport-locked-preview.png',Buffer.from((await p.call('Page.captureScreenshot',{format:'png'})).data,'base64'));
    await p.ev(`document.querySelector('#passportLogin').click()`);await pause();
    fs.writeFileSync('assets/account-login-preview.png',Buffer.from((await p.call('Page.captureScreenshot',{format:'png'})).data,'base64'));
    await p.ev(`document.querySelector('#accountClose').click();document.querySelector('#passportCreate').click()`);await pause();
    assert.equal(await p.ev(`!document.querySelector('#accountIdentityFields').hidden`),true);
    fs.writeFileSync('assets/account-create-preview.png',Buffer.from((await p.call('Page.captureScreenshot',{format:'png'})).data,'base64'));
    await p.ev(`document.querySelector('#accountName').value='Maria Santos';document.querySelector('#accountAge').value='26';document.querySelector('#accountEmail').value='bad';document.querySelector('#accountEmailForm').requestSubmit()`);await pause();
    assert.equal(await p.ev(`window.mockAccount.calls.length`),0);
    await p.ev(`document.querySelector('#accountEmail').value='Maria@Gmail.com';document.querySelector('#accountEmailForm').requestSubmit()`);await pause();
    assert.equal(await p.ev(`window.mockAccount.calls[0].address`),'maria@gmail.com');
    assert.equal(await p.ev(`document.querySelector('#accountResend').disabled`),true);
    await p.ev(`document.querySelector('#accountCode').value='000000';document.querySelector('#accountCodeForm').requestSubmit()`);await pause();
    assert.equal(await p.ev(`window.mockAccount.getProfile()`),null);
    assert.equal(await p.ev(`document.querySelector('#accountMessage').textContent.includes('incorrect or expired')`),true);
    await p.ev(`document.querySelector('#accountCode').value='123456';document.querySelector('#accountCodeForm').requestSubmit()`);await pause();
    assert.equal(await p.ev(`window.mockAccount.getProfile().name`),'Maria Santos');
    assert.equal(await p.ev(`document.querySelector('#accountProfileForm').hidden`),false);
    assert.equal(await p.ev(`window.SilipPassport.profile().name`),'Maria Santos');
    assert.equal(await p.ev(`document.querySelector('#passportLock').hidden && !document.querySelector('#passportContent').inert && !document.querySelector('#savePassport').disabled && !document.querySelector('#accountDialog').open`),true);
    assert.equal(await p.ev(`document.querySelector('#fName').value`),'Maria Santos');
    assert.equal(await p.ev(`document.querySelectorAll('#ppStamps button').length`),1);
    fs.writeFileSync('assets/passport-unlocked-preview.png',Buffer.from((await p.call('Page.captureScreenshot',{format:'png'})).data,'base64'));
    console.log('PASS: signup validates email, enforces resend delay, rejects wrong OTP, saves verified profile');
    console.log('PASS: guest passport is blurred and inert; verified signup unlocks it with synced name and stamps');
    await p.ev(`document.querySelector('#accountBtn').click()`);await pause();
    await p.ev(`document.querySelector('#accountSignOut').click()`);await pause();
    assert.equal(await p.ev(`window.SilipPassport.profile().name`),'');
    assert.equal(await p.ev(`document.querySelector('#accountDialog').open`),false);
    assert.equal(await p.ev(`document.querySelector('#passportAccess').classList.contains('is-locked') && document.querySelector('#passportContent').inert`),true);
    await p.ev(`document.querySelector('#passportLogin').click()`);await pause();
    // Advance the resend clock in this test tab to simulate waiting for the next email request.
    await p.ev(`{const now=Date.now;Date.now=()=>now()+61000}document.querySelector('#accountEmail').value='other@gmail.com';document.querySelector('#accountEmailForm').requestSubmit()`);await pause();
    await p.ev(`document.querySelector('#accountCode').value='123456';document.querySelector('#accountCodeForm').requestSubmit()`);await pause();
    assert.equal(await p.ev(`window.SilipPassport.profile().name`),'Other owner');
    assert.equal(await p.ev(`document.querySelector('#fName').value`),'Other owner');
    assert.equal(await p.ev(`document.querySelector('#passportLock').hidden`),true);
    await p.ev(`document.querySelector('#accountClose').click();document.querySelector('[data-go="stamps"]').click()`);await pause();
    assert.equal(await p.ev(`document.querySelectorAll('#stampGrid button')[0].classList.contains('locked')`),true);
    assert.equal(await p.ev(`document.querySelectorAll('#stampGrid button')[1].classList.contains('locked')`),false);
    console.log('PASS: logout clears details; login restores only the new owner profile and stamps');
    await p.ev(`document.querySelector('#accountBtn').click()`);await pause();
    await p.ev(`document.querySelector('#profileName').value='Updated owner';document.querySelector('#accountProfileForm').requestSubmit()`);await pause();
    assert.equal(await p.ev(`window.SilipPassport.profile().name`),'Updated owner');
    assert.deepEqual(p.errors,[]);
    console.log('PASS: profile edits restore to the passport; no browser runtime errors');
  }finally{await p.close()}
})().catch(e=>{console.error(e);process.exit(1)});
