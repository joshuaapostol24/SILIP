/* SILIP · Digital Heritage Passport */
(() => {
  'use strict';

  /* ---------- Content (EN / FIL) ---------- */
  const I18N = {
    en: {
      heritagePlace: 'MALOLOS, BULACAN', navHome: 'Home', navSites: 'Heritage sites', navScan: 'Scan QR', navPassport: 'Passport',
      collectedLabel: 'Collected', visitLabel: 'View location',
      passportLocked: 'Unlock your heritage passport',
      passportUnlockText: 'Create an account to fully unlock your passport and sync your name and collected stamps.',
      passportCreate: 'Create an account to unlock', passportLogin: 'Already have an account? Log in',
      tagline: 'Discover. Learn. Collect',
      lead: 'Explore the rich history and culture<br>of Malolos through our heritage sites.<br>Scan the QR code, get to know the stories,<br>and collect your digital stamps!',
      start: 'Start Exploring', install: '＋ Install app',
      colTitle: 'Stamp Collected!', colTitleDone: 'Passport Complete!',
      colText: 'You have successfully collected<br>the {name}',
      saveStamp: 'save this stamp.', viewPassport: 'View My Passport',
      ppTitle: 'My Heritage Passport', ppSub: 'Collect stamps, Build your story.',
      namePh: 'NAME', age: 'AGE:', issued: 'DATE ISSUED:',
      savePassport: 'save your passport.', viewStamps: 'View Stamps',
      stampsTitle: 'Stamps to Be Collected',
      caption: 'Explore other heritage sites and collect their unique digital stamps<br>as you visit each destination.',
      scan: 'Scan a QR code', viewPassportLink: 'View my passport', next: 'Next',
      thank: 'Thank You!',
      thanksText: 'Thank you for discovering the history and heritage of Malolos with us. We hope you enjoyed exploring its meaningful places, learning about its stories, and collecting digital stamps along the way. May this journey inspire you to appreciate and continue discovering the rich heritage of Malolos.',
      again: 'Explore Again', mini: 'Continue your heritage journey anytime.',
      reset: 'Reset my passport (demo)', resetConfirm: 'Clear your name, photo and all collected stamps?',
      rank0: 'Newcomer', rank1: 'Heritage Explorer', rank2: 'Heritage Guardian', rank3: 'Heritage Keeper', stampsWord: 'stamps',
      locked: 'Visit this site and scan its QR code to unlock the stamp.', got: 'Stamp collected ✓',
      demo: 'Simulate scan (demo)', close: 'Close', maps: 'Open in Maps', directions: 'Get directions', location: 'Location', stampHelp: 'Tap any stamp to see its heritage site and location.',
      scanMsg: 'Point your camera at the QR code at the heritage site.', cancel: 'Cancel',
      notSite: 'That QR code isn’t a SILIP heritage site.', already: 'You already collected this stamp.',
      noCam: 'Camera scanning isn’t available here. Use your phone’s camera app to scan the QR code.',
      camDenied: 'Couldn’t open the camera. Please allow camera access.',
      saved: 'Saved to your downloads.', storage: 'Storage is full — photo not saved.',
      invalidCode: 'This QR code isn’t valid. Please scan the code at the heritage site.',
      rateLimited: 'Too many tries. Please wait a minute and scan again.',
      verifying: 'Checking your stamp…',
      offlineSaved: 'Stamp saved. It will be verified when you’re back online.',
      syncBtn: 'My account / Save progress',
      syncOn: 'Synced', syncAcct: 'Synced · {email}', syncOff: 'Offline — will sync later', syncPend: '{n} waiting to verify'
    },
    fil: {
      heritagePlace: 'MALOLOS, BULACAN', navHome: 'Simula', navSites: 'Mga pook', navScan: 'Mag-scan', navPassport: 'Pasaporte',
      collectedLabel: 'Nakolekta', visitLabel: 'Lokasyon',
      passportLocked: 'I-unlock ang iyong pasaporte ng pamana',
      passportUnlockText: 'Gumawa ng account para lubos na ma-unlock ang pasaporte at ma-sync ang iyong pangalan at mga nakolektang selyo.',
      passportCreate: 'Gumawa ng account para ma-unlock', passportLogin: 'May account ka na? Mag-log in',
      tagline: 'Tuklasin. Alamin. Kolektahin',
      lead: 'Tuklasin ang mayamang kasaysayan at kultura<br>ng Malolos sa pamamagitan ng aming mga pook-pamana.<br>I-scan ang QR code, kilalanin ang mga kuwento,<br>at kolektahin ang iyong digital na selyo!',
      start: 'Simulan ang Paglalakbay', install: '＋ I-install ang app',
      colTitle: 'Nakolekta na ang Selyo!', colTitleDone: 'Kumpleto na ang Pasaporte!',
      colText: 'Matagumpay mong nakolekta<br>ang {name}',
      saveStamp: 'i-save ang selyong ito.', viewPassport: 'Tingnan ang Aking Pasaporte',
      ppTitle: 'Aking Pasaporte ng Pamana', ppSub: 'Mangolekta ng selyo, buuin ang iyong kuwento.',
      namePh: 'PANGALAN', age: 'EDAD:', issued: 'PETSA NG PAGLABAS:',
      savePassport: 'i-save ang iyong pasaporte.', viewStamps: 'Tingnan ang mga Selyo',
      stampsTitle: 'Mga Selyong Kokolektahin',
      caption: 'Bisitahin ang iba pang pook-pamana at kolektahin ang kanilang natatanging digital na selyo<br>habang binibisita mo ang bawat destinasyon.',
      scan: 'Mag-scan ng QR code', viewPassportLink: 'Tingnan ang aking pasaporte', next: 'Susunod',
      thank: 'Salamat!',
      thanksText: 'Salamat sa pagtuklas ng kasaysayan at pamana ng Malolos kasama namin. Sana ay nasiyahan ka sa paglalakbay sa mga makabuluhang lugar nito, sa pag-alam ng mga kuwento nito, at sa pagkolekta ng mga digital na selyo. Nawa’y magbigay-inspirasyon ang paglalakbay na ito upang patuloy mong pahalagahan at tuklasin ang yamang pamana ng Malolos.',
      again: 'Tuklasin Muli', mini: 'Ipagpatuloy ang paglalakbay sa pamana anumang oras.',
      reset: 'I-reset ang aking pasaporte (demo)', resetConfirm: 'Buburahin ang pangalan, larawan at lahat ng nakolektang selyo?',
      rank0: 'Baguhan', rank1: 'Tagatuklas ng Pamana', rank2: 'Tagapagbantay ng Pamana', rank3: 'Tagapangalaga ng Pamana', stampsWord: 'selyo',
      locked: 'Bisitahin ang pook na ito at i-scan ang QR code nito para ma-unlock ang selyo.', got: 'Nakolekta na ang selyo ✓',
      demo: 'Gayahin ang pag-scan (demo)', close: 'Isara', maps: 'Buksan sa Maps', directions: 'Mga direksyon', location: 'Lokasyon', stampHelp: 'Pindutin ang alinmang selyo para makita ang pook-pamana at lokasyon nito.',
      scanMsg: 'Itutok ang camera sa QR code sa pook-pamana.', cancel: 'Kanselahin',
      notSite: 'Hindi ito QR code ng isang pook-pamana ng SILIP.', already: 'Nakolekta mo na ang selyong ito.',
      noCam: 'Hindi magagamit ang camera scanning dito. Gamitin ang camera app ng iyong telepono.',
      camDenied: 'Hindi mabuksan ang camera. Pakipayagan ang access sa camera.',
      saved: 'Na-save sa iyong downloads.', storage: 'Puno na ang storage — hindi na-save ang larawan.',
      invalidCode: 'Hindi balido ang QR code na ito. I-scan ang code sa pook-pamana.',
      rateLimited: 'Napakaraming pagsubok. Maghintay ng isang minuto bago mag-scan muli.',
      verifying: 'Sinusuri ang iyong selyo…',
      offlineSaved: 'Na-save ang selyo. Ibe-verify ito kapag online ka na muli.',
      syncBtn: 'Aking account / I-save ang progreso',
      syncOn: 'Naka-sync', syncAcct: 'Naka-sync · {email}', syncOff: 'Offline — magsi-sync mamaya', syncPend: '{n} naghihintay ma-verify'
    }
  };

  const SITES = [
    { id: 'barasoain', name: 'Barasoain Church', est: 1859, shape: 'oval', glyph: 'church', top: 'BARASOAIN CHURCH',
      map: 'Barasoain Church Malolos Bulacan',
      story: { en: 'Where the Malolos Congress met in 1898 and drafted the constitution of the First Philippine Republic.',
               fil: 'Dito nagpulong ang Kongreso ng Malolos noong 1898 at binuo ang konstitusyon ng Unang Republika ng Pilipinas.' } },
    { id: 'casa-real', name: 'Casa Real', est: 1860, shape: 'rect', glyph: 'house', top: 'CASA REAL',
      map: 'Casa Real Shrine Malolos Bulacan',
      story: { en: 'The Casa Real de Malolos, a former seat of local government and a landmark of the town’s colonial past.',
               fil: 'Ang Casa Real de Malolos, dating luklukan ng pamahalaang lokal at palatandaan ng makulay na nakaraan ng bayan.' } },
    { id: 'cathedral', name: 'Malolos Cathedral', est: 1857, shape: 'oval', glyph: 'cathedral', top: 'MALOLOS CATHEDRAL',
      map: 'Malolos Cathedral Bulacan',
      story: { en: 'The Minor Basilica of the Immaculate Conception, the spiritual heart of Malolos for generations.',
               fil: 'Ang Minor Basilica ng Immaculate Conception, ang espirituwal na puso ng Malolos sa loob ng maraming henerasyon.' } },
    { id: 'bahay', name: 'Bahay ng mga Kababaihan ng Malolos', est: 1985, shape: 'rect', glyph: 'house2',
      top: 'BAHAY NG MGA KABABAIHAN\nNG MALOLOS', map: 'Bahay ng mga Kababaihan ng Malolos Bulacan',
      story: { en: 'Honors the women of Malolos who stood up in 1888 to ask for the right to learn.',
               fil: 'Pinararangalan ang mga kababaihan ng Malolos na noong 1888 ay naglakas-loob na humiling ng karapatang matuto.' } }
  ];
  const byId = Object.fromEntries(SITES.map(s => [s.id, s]));

  /* ---------- State ---------- */
  const KEY = 'silip.v1';
  const defaults = () => ({ name: '', age: '', photo: '', issued: new Date().toISOString(), stamps: {}, pending: {}, uid: null, lang: null, profileDirty: false });
  const Cloud = window.SilipCloud || { enabled: false, demo: true };
  let state = load();
  function load() {
    try { const s = JSON.parse(localStorage.getItem(KEY)); if (s) return Object.assign(defaults(), s); } catch (e) {}
    return defaults();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { toast(t('storage')); } }

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const urlLang = new URLSearchParams(location.search).get('lang');
  let lang = ['en', 'fil'].includes(urlLang) ? urlLang
    : state.lang || (/^(fil|tl)/i.test(navigator.language || '') ? 'fil' : 'en');
  const t = k => (I18N[lang] && I18N[lang][k]) ?? I18N.en[k] ?? k;
  const fmtDate = d => d.toLocaleDateString(lang === 'fil' ? 'fil-PH' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const count = () => Object.keys(state.stamps).length;

  /* ---------- Supplied stamp artwork ---------- */
  const NAVY = '#1c3f8f';
  const STAMP_ASSETS = {
    'barasoain': 'assets/stamp-barasoain.png',
    'casa-real': 'assets/stamp-casa-real.png',
    'cathedral': 'assets/stamp-cathedral.png',
    'bahay': 'assets/stamp-bahay.png'
  };
  function stampMarkup(site) {
    return `<img class="stamp-image" src="${STAMP_ASSETS[site.id]}" alt="${site.name} stamp" decoding="async">`;
  }

  /* ---------- Language ---------- */
  function applyLang() {
    document.documentElement.lang = lang === 'fil' ? 'fil' : 'en';
    $$('[data-i18n]').forEach(el => { el.innerHTML = t(el.dataset.i18n); });
    $('#fName').placeholder = t('namePh');
    $('#dlgDemo').textContent = t('demo');
    $('#dlgClose').textContent = t('close');
    $('#dlgMap').textContent = t('maps');
    $('#scanMsg').textContent = t('scanMsg');
    $('#scanClose').textContent = t('cancel');
    $('#langEN').classList.toggle('on', lang === 'en');
    $('#langFIL').classList.toggle('on', lang === 'fil');
    renderRank(); renderSync();
    if (current) show(current, true);
  }
  $('#langBtn').addEventListener('click', () => {
    lang = lang === 'en' ? 'fil' : 'en'; state.lang = lang; save(); applyLang();
  });

  /* ---------- Rank / progress ---------- */
  function rankIndex() { const n = count(); return n === 0 ? 0 : n >= SITES.length ? 3 : n >= 3 ? 2 : 1; }
  function renderRank() {
    const n = count(), pct = Math.round(n / SITES.length * 100);
    $$('.rank-name').forEach(e => e.textContent = t('rank' + rankIndex()));
    $$('.rank-count').forEach(e => e.textContent = `${n}/${SITES.length} ${t('stampsWord')}`);
    $$('.rank-fill').forEach(e => e.style.width = pct + '%');
    $('#progress').textContent = '';
  }

  /* ---------- Router ---------- */
  let current = null, lastCollected = null;
  function show(name, rerender = false) {
    if (name === 'verify-account') name = 'passport';
    if (!$('#' + name)) name = 'home';
    current = name;
    $$('.bottom-nav [data-go]').forEach(b => {
      if (b.dataset.go === name) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
    $$('.screen').forEach(s => { const on = s.id === name; if (!rerender) { s.hidden = !on; if (on) s.scrollTop = 0; } else s.hidden = !on; });
    renderRank();
    if (name === 'stamps') renderStamps();
    if (name === 'passport') {
      renderPassport();
      if (passportUnlocked()) syncAll();
    }
    if (name === 'collected') renderCollected(!rerender);
    if (location.hash !== '#' + name) history.replaceState(null, '', '#' + name);
  }
  document.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) show(b.dataset.go); });
  window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (h && h !== current) show(h); });

  /* ---------- Collect a stamp ---------- */
  async function collect(id, token, opts = {}) {
    const site = byId[id];
    if (!site) { toast(t('notSite')); return false; }
    let isNew = !state.stamps[id] || !!state.pending[id];
    if (Cloud.enabled && !opts.demo) {
      // Cloud mode: the server must confirm the secret token printed in the site's QR code.
      if (!token) { toast(t('invalidCode')); return false; }
      try {
        toast(t('verifying'));
        const res = await Cloud.collect(id, token);
        if (!res.ok) { toast(t(res.error === 'rate_limited' ? 'rateLimited' : 'invalidCode')); return false; }
        isNew = isNew || res.new;
        state.stamps[id] = res.collected_at || state.stamps[id] || new Date().toISOString();
        delete state.pending[id];
        hideToast();
      } catch (e) {
        // Offline or server unreachable: keep the stamp, verify it later.
        if (!state.stamps[id]) state.stamps[id] = new Date().toISOString();
        state.pending[id] = token;
        toast(t('offlineSaved'));
      }
      save(); renderSync();
    } else if (!state.stamps[id]) {
      state.stamps[id] = new Date().toISOString(); save();
    }
    lastCollected = id;
    show('collected');
    if (!isNew) toast(t('already'));
    else if (navigator.vibrate) navigator.vibrate([40, 40, 90]);
    return true;
  }
  function renderCollected(fresh) {
    const site = byId[lastCollected] || SITES[0];
    $('#colText').innerHTML = t('colText').replace('{name}', site.name);
    $('#colStamp').innerHTML = stampMarkup(site);
    $('#colStory').textContent = site.story[lang];
    $('#colTitle').textContent = count() === SITES.length ? t('colTitleDone') : t('colTitle');
    if (fresh) { burst(); const s = $('#colStamp'); s.style.animation = 'none'; void s.offsetWidth; s.style.animation = ''; }
  }
  function burst() {
    const box = $('#confetti'); box.innerHTML = '';
    if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    const cols = ['#e6a817', '#f3c64d', '#d28b0a', '#fbe08a'];
    for (let i = 0; i < 46; i++) {
      const p = document.createElement('i');
      p.style.left = Math.random() * 100 + '%';
      p.style.background = cols[i % cols.length];
      p.style.animationDuration = 2.2 + Math.random() * 2.6 + 's';
      p.style.animationDelay = Math.random() * .8 + 's';
      p.style.transform = `rotate(${Math.random() * 360}deg)`;
      p.style.width = 6 + Math.random() * 7 + 'px';
      box.appendChild(p);
    }
  }

  /* ---------- Stamps list + site dialog ---------- */
  function renderStamps() {
    const grid = $('#stampGrid'); grid.innerHTML = '';
    SITES.forEach(site => {
      const got = !!state.stamps[site.id];
      const b = document.createElement('button');
      b.className = 'stamp-cell' + (got ? '' : ' locked');
      b.type = 'button';
      b.setAttribute('aria-label', site.name + ' — ' + t('location'));
      b.setAttribute('aria-haspopup', 'dialog');
      b.innerHTML = stampMarkup(site) + (got ? '' : '<span class="lock" aria-hidden="true"><svg viewBox="0 0 16 20" fill="currentColor"><path d="M3 8V5a5 5 0 0 1 10 0v3h1v11H2V8Zm2 0h6V5a3 3 0 0 0-6 0Z"/><path d="M8 12v3" stroke="#f2f0ee" stroke-width="2" stroke-linecap="round"/></svg></span>');
      b.addEventListener('click', () => openSite(site));
      const title = document.createElement('span'); title.className = 'stamp-name'; title.textContent = site.name;
      const hint = document.createElement('span'); hint.className = 'stamp-state'; hint.textContent = got ? t('collectedLabel') + ' ✓' : t('visitLabel') + ' ↗';
      b.append(title, hint);
      grid.appendChild(b);
    });
  }
  const dlg = $('#siteDialog');
  function openSite(site) {
    const got = !!state.stamps[site.id];
    $('#dlgStamp').innerHTML = stampMarkup(site);
    $('#dlgTitle').textContent = site.name;
    $('#dlgStory').textContent = site.story[lang];
    $('#dlgHint').textContent = got ? t('got') : t('locked');
    $('#dlgMap').href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(site.map);
    $('#dlgLocation').textContent = site.map;
    $('#dlgLocationLabel').textContent = t('location');
    $('#dlgDirections').textContent = t('directions');
    $('#dlgDirections').href = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(site.map);
    $('#dlgMapFrame').title = t('location') + ' — ' + site.name;
    $('#dlgMapFrame').src = 'https://maps.google.com/maps?q=' + encodeURIComponent(site.map) + '&output=embed';
    $('#dlgDemo').hidden = got || (Cloud.enabled && !Cloud.demo); $('#dlgDemo').dataset.id = site.id;
    dlg.showModal();
  }
  dlg.addEventListener('close', () => {
    $('#dlgMapFrame').src = 'about:blank';
    if (dlg.returnValue === 'demo') collect($('#dlgDemo').dataset.id, null, { demo: true });
    dlg.returnValue = '';
  });

  /* ---------- Passport ---------- */
  const clean = s => s.toUpperCase().replace(/[^A-Z ]/g, '').trim();
  function mrz() {
    const raw = state.name.trim();
    let sur = '', giv = '';
    if (raw.includes(',')) { [sur, giv] = raw.split(',').map(clean); }
    else { const p = clean(raw).split(/\s+/).filter(Boolean); sur = p.length > 1 ? p[p.length - 1] : p[0] || ''; giv = p.slice(0, -1).join(' '); }
    const l1 = ('P<PHL' + sur.replace(/ /g, '<') + '<<' + giv.replace(/ /g, '<')).padEnd(44, '<').slice(0, 44);
    const d = new Date(state.issued);
    const ymd = String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
    const l2 = ('SILIP' + 'MAL' + String(count()).padStart(2, '0') + 'PHL' + ymd + 'F' + ymd).padEnd(44, '<').slice(0, 44);
    return l1 + '\n' + l2;
  }
  function passportUnlocked() {
    return !!(Cloud.enabled && Cloud.hasAccount() && state.uid === Cloud.uid());
  }
  function renderPassportAccess() {
    const locked = !passportUnlocked();
    $('#passportAccess').classList.toggle('is-locked', locked);
    $('#passportContent').inert = locked;
    $('#passportContent').setAttribute('aria-hidden', String(locked));
    $('#passportLock').hidden = !locked;
    $('#savePassport').disabled = locked;
    $('#fName').disabled = locked; $('#fAge').disabled = locked; $('#photoInput').disabled = locked;
  }
  function openPassportAccount(mode = 'create') {
    window.dispatchEvent(new CustomEvent('silip:open-account', { detail: { mode, returnTo: 'passport' } }));
  }
  $('#passportCreate').addEventListener('click', () => openPassportAccount('create'));
  $('#passportLogin').addEventListener('click', () => openPassportAccount('login'));
  window.addEventListener('silip:auth', renderPassportAccess);
  function renderPassport() {
    renderPassportAccess();
    $('#fName').value = state.name;
    $('#fAge').value = state.age;
    $('#fIssued').textContent = fmtDate(new Date(state.issued));
    $('#mrz').textContent = mrz();
    $('#seal').hidden = count() < SITES.length;
    const has = !!state.photo;
    $('#photoImg').hidden = !has; $('#photoDefault').style.display = has ? 'none' : '';
    if (has) $('#photoImg').src = state.photo;
    else $('#photoImg').removeAttribute('src');
    const box = $('#ppStamps'); box.innerHTML = '';
    const rots = [-6, 5, 4, -5];
    SITES.forEach((s, i) => {
      const got = !!state.stamps[s.id];
      const d = document.createElement(got ? 'button' : 'div');
      d.className = 'slot' + (got ? ' got' : ' empty');
      d.style.setProperty('--r', rots[i] + 'deg');
      if (got) {
        d.type = 'button';
        d.setAttribute('aria-label', s.name + ' — ' + t('location'));
        d.setAttribute('aria-haspopup', 'dialog');
        d.innerHTML = stampMarkup(s);
        d.addEventListener('click', () => openSite(s));
      }
      box.appendChild(d);
    });
  }
  $('#fName').maxLength = 100;
  $('#fName').addEventListener('input', e => { if (!passportUnlocked()) return; state.name = e.target.value; save(); queueProfileSave(); $('#mrz').textContent = mrz(); });
  $('#fAge').addEventListener('input', e => { if (!passportUnlocked()) return; e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3); state.age = e.target.value; save(); queueProfileSave(); });
  $('#photoInput').addEventListener('change', e => {
    if (!passportUnlocked()) return;
    const owner = Cloud.uid();
    const f = e.target.files[0]; if (!f) return;
    const img = new Image(), url = URL.createObjectURL(f);
    img.onload = () => {
      if (!passportUnlocked() || Cloud.uid() !== owner) { URL.revokeObjectURL(url); return; }
      const c = document.createElement('canvas'), W = 300, H = 330;
      c.width = W; c.height = H;
      const r = Math.max(W / img.width, H / img.height);
      c.getContext('2d').drawImage(img, (W - img.width * r) / 2, (H - img.height * r) / 2, img.width * r, img.height * r);
      state.photo = c.toDataURL('image/jpeg', .82); save(); queueProfileSave(); URL.revokeObjectURL(url); renderPassport();
    };
    img.src = url;
  });

  /* ---------- Save as image ---------- */
  function loadStampImage(site) {
    return new Promise((res, rej) => {
      const img = new Image(); img.onload = () => res(img); img.onerror = rej;
      img.src = STAMP_ASSETS[site.id];
    });
  }
  async function download(canvas, filename) {
    const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
    const file = new File([blob], filename, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'SILIP' }); return; } catch (e) { if (e.name === 'AbortError') return; }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    toast(t('saved'));
  }
  $('#saveStamp').addEventListener('click', async () => {
    const site = byId[lastCollected] || SITES[0];
    const img = await loadStampImage(site);
    const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
    const x = c.getContext('2d'); x.fillStyle = '#f7e3c4'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0);
    download(c, `silip-${site.id}-stamp.png`);
  });
  $('#savePassport').addEventListener('click', async () => {
    if (!passportUnlocked()) { openPassportAccount(); return; }
    const W = 1000, H = 1400, c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d');
    x.fillStyle = '#f7e3c4'; x.fillRect(0, 0, W, H);
    x.fillStyle = NAVY; x.font = '700 54px Georgia,serif'; x.fillText(t('ppTitle').replace(/<[^>]+>/g, ''), 60, 100);
    x.font = '30px Georgia,serif'; x.fillText(`SILIP · ${t('rank' + rankIndex())} · ${count()}/${SITES.length}`, 60, 148);
    x.fillStyle = '#f3e2df'; x.fillRect(60, 190, 880, 450); x.fillStyle = '#f7eeee'; x.fillRect(60, 640, 880, 700);
    x.strokeStyle = '#2d3561'; x.lineWidth = 6; x.strokeRect(60, 190, 880, 1150);
    if (state.photo) { const im = new Image(); await new Promise(r => { im.onload = r; im.src = state.photo; }); x.drawImage(im, 100, 230, 260, 286); }
    else { x.fillStyle = '#d8d9da'; x.fillRect(100, 230, 260, 286); x.fillStyle = NAVY; x.beginPath(); x.arc(230, 340, 60, 0, 7); x.fill(); x.fillRect(120, 430, 220, 86); }
    x.fillStyle = '#111'; x.textAlign = 'center'; x.font = '700 38px Arial'; x.fillText((state.name || t('namePh')).toUpperCase(), 650, 330);
    x.textAlign = 'left'; x.font = '700 30px Arial'; x.fillText(t('age') + ' ' + (state.age || '____'), 400, 400);
    x.font = '700 24px Arial'; x.fillText(t('issued') + ' ' + fmtDate(new Date(state.issued)), 400, 450);
    x.font = '26px "Courier New",monospace'; mrz().split('\n').forEach((l, i) => x.fillText(l, 80, 570 + i * 36));
    const pos = [[100, 700], [520, 700], [100, 1010], [520, 1010]];
    for (let i = 0; i < SITES.length; i++) {
      if (!state.stamps[SITES[i].id]) continue;
      const img = await loadStampImage(SITES[i]);
      const height = 380 * img.naturalHeight / img.naturalWidth;
      x.drawImage(img, pos[i][0], pos[i][1] + (279 - height) / 2, 380, height);
    }
    download(c, 'silip-heritage-passport.png');
  });

  /* ---------- QR scanning (BarcodeDetector, falls back to jsQR) ---------- */
  let stream = null, scanTimer = null;
  /** Read a scanned QR text → { id, token } (token comes from the "k" parameter). */
  function parseCode(txt) {
    try {
      const u = new URL(txt, location.href), s = u.searchParams.get('stamp');
      if (s && byId[s]) return { id: s, token: u.searchParams.get('k') };
    } catch (e) {}
    const m = String(txt).match(/stamp[=/:]([a-z-]+)/i);
    if (m && byId[m[1].toLowerCase()]) return { id: m[1].toLowerCase(), token: (String(txt).match(/[?&]k=([A-Za-z0-9]+)/) || [])[1] || null };
    return byId[String(txt).trim()] ? { id: String(txt).trim(), token: null } : null;
  }
  $('#scanBtn').addEventListener('click', async () => {
    if (!navigator.mediaDevices?.getUserMedia) { toast(t('noCam')); return; }
    try {
      const det = 'BarcodeDetector' in window ? new BarcodeDetector({ formats: ['qr_code'] }) : null;
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const v = $('#scanVideo'); v.srcObject = stream; await v.play();
      $('#scanner').hidden = false;
      const cv = $('#scanCanvas'), ctx = cv.getContext('2d', { willReadFrequently: true });
      scanTimer = setInterval(async () => {
        try {
          let text = null;
          if (det) { const r = await det.detect(v); if (r.length) text = r[0].rawValue; }
          else if (typeof jsQR === 'function' && v.videoWidth) {
            const k = Math.min(1, 480 / v.videoWidth);
            cv.width = Math.round(v.videoWidth * k); cv.height = Math.round(v.videoHeight * k);
            ctx.drawImage(v, 0, 0, cv.width, cv.height);
            const img = ctx.getImageData(0, 0, cv.width, cv.height);
            const r = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
            if (r) text = r.data;
          }
          if (!text) return;
          const code = parseCode(text);
          stopScan();
          if (code) collect(code.id, code.token); else toast(t('notSite'));
        } catch (e) {}
      }, 250);
    } catch (e) { stopScan(); toast(t('camDenied')); }
  });
  function stopScan() {
    clearInterval(scanTimer); scanTimer = null;
    if (stream) stream.getTracks().forEach(tr => tr.stop()); stream = null;
    $('#scanner').hidden = true;
  }
  $('#scanClose').addEventListener('click', stopScan);

  /* ---------- Reset (demo) ---------- */
  $('#resetBtn').addEventListener('click', async () => {
    if (!confirm(t('resetConfirm'))) return;
    const keep = state.lang; state = defaults(); state.lang = keep; save();
    try { await Cloud.reset(); state.uid = Cloud.uid(); save(); } catch (e) {}
    renderSync(); show('home');
  });

  /* ---------- Cloud sync ---------- */
  let online = null;
  function renderSync() {
    const el = $('#syncStatus'), btn = $('#syncBtn');
    if (!Cloud.enabled) { el.hidden = true; btn.hidden = true; return; }
    const n = Object.keys(state.pending).length;
    el.hidden = false; btn.hidden = false;
    el.textContent = n ? t('syncPend').replace('{n}', n)
      : online === false ? t('syncOff')
      : Cloud.isPermanent() ? t('syncAcct').replace('{email}', Cloud.email()) : t('syncOn');
    btn.hidden = Cloud.isPermanent();
  }
  function refreshView() {
    renderRank(); renderSync(); renderPassportAccess();
    if (current === 'stamps') renderStamps();
    if (current === 'passport' && !(document.activeElement && document.activeElement.matches('#passport input'))) renderPassport();
  }
  let syncTask = null, syncAgain = false, profileTimer;
  const profileData = () => ({ name: state.name, age: state.age, photo: state.photo, issued_at: state.issued });
  function queueProfileSave() {
    state.profileDirty = true; save(); clearTimeout(profileTimer);
    profileTimer = setTimeout(saveProfileChanges, 600);
  }
  async function saveProfileChanges() {
    if (!Cloud.enabled || !Cloud.hasAccount() || state.uid !== Cloud.uid() || !state.name.trim()) return;
    const uid = state.uid, profile = profileData();
    if (profile.age !== '' && (!Number.isInteger(Number(profile.age)) || Number(profile.age) < 1 || Number(profile.age) > 120)) return;
    try {
      await Cloud.saveProfile(profile);
      if (uid === state.uid && uid === Cloud.uid() && JSON.stringify(profile) === JSON.stringify(profileData())) {
        state.profileDirty = false; save();
      }
    } catch { toast(lang === 'fil' ? 'Nasa device ang mga detalye mo. Hindi pa na-save online.' : 'Your details are saved on this device. Cloud profile save will retry when you reconnect.'); }
  }
  function syncAll() {
    if (!Cloud.enabled) return Promise.resolve();
    if (syncTask) { syncAgain = true; return syncTask; }
    syncTask = performSync().finally(() => {
      syncTask = null;
      if (syncAgain) { syncAgain = false; syncAll(); }
    });
    return syncTask;
  }
  async function performSync() {
    try {
      await Cloud.init();
      const uid = Cloud.uid();
      if (state.uid !== uid && (state.uid || Cloud.isPermanent())) {
        const keepLang = state.lang; state = defaults(); state.lang = keepLang;
        clearTimeout(profileTimer); save();
        if (current === 'passport') renderPassport();
      }
      state.uid = uid;
      for (const [id, token] of Object.entries(state.pending)) {
        const r = await Cloud.collect(id, token);
        if (Cloud.uid() !== uid) { syncAgain = true; return; }
        if (r.ok) { state.stamps[id] = r.collected_at || state.stamps[id]; delete state.pending[id]; }
        else if (r.error === 'invalid_code') { delete state.stamps[id]; delete state.pending[id]; }
      }
      const stamps = await Cloud.fetchStamps();
      const profile = await Cloud.fetchProfile();
      if (Cloud.uid() !== uid) { syncAgain = true; return; }
      stamps.forEach(r => { if (byId[r.site_id]) state.stamps[r.site_id] = r.collected_at; });
      if (profile && !state.profileDirty) {
        state.name = profile.name; state.age = profile.age == null ? '' : String(profile.age);
        state.photo = profile.photo; state.issued = profile.issued_at;
      }
      online = true; save();
    } catch (e) { online = false; }
    finally { refreshView(); }
  }
  window.SilipPassport = {
    navigate: show,
    profile: profileData,
    async refresh() { clearTimeout(profileTimer); state.profileDirty = false; save(); await syncAll(); if (syncTask) await syncTask; }
  };
  Cloud.onSignIn = () => {
    if (!Cloud.uid()) {
      const keepLang = state.lang; state = defaults(); state.lang = keepLang;
      clearTimeout(profileTimer); save(); refreshView();
    }
    syncAll();
  };
  window.addEventListener('online', async () => { if (state.profileDirty) await saveProfileChanges(); syncAll(); });

  $('#syncBtn').addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('silip:open-account', { detail: { mode: 'login' } }));
  });
  $('#navScan').addEventListener('click', () => $('#scanBtn').click());
  $('#photoBox').addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('#photoInput').click(); }
  });

  /* ---------- Toast ---------- */
  let tt;
  function toast(msg) {
    const el = $('#toast'); el.textContent = msg; el.classList.add('show');
    clearTimeout(tt); tt = setTimeout(() => el.classList.remove('show'), 3200);
  }
  function hideToast() { clearTimeout(tt); $('#toast').classList.remove('show'); }

  /* ---------- Optional photo assets ---------- */
  [['assets/thanks.jpg', '#thanksBg']].forEach(([src, sel]) => {
    const im = new Image(); im.onload = () => $(sel).classList.add('has-photo'); im.src = src;
  });

  /* ---------- Install prompt ---------- */
  let deferred;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; $('#installBtn').hidden = false; });
  $('#installBtn').addEventListener('click', async () => {
    if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; $('#installBtn').hidden = true;
  });
  window.addEventListener('appinstalled', () => { $('#installBtn').hidden = true; });

  /* ---------- Boot ---------- */
  applyLang();
  renderSync();
  const qp = new URLSearchParams(location.search);
  const qrStamp = qp.get('stamp'), qrToken = qp.get('k');
  (async () => {
    if (qrStamp) {
      history.replaceState(null, '', location.pathname);
      show('home');
      if (Cloud.enabled) { try { await Cloud.init(); state.uid = state.uid || Cloud.uid(); } catch (e) {} }
      await collect(qrStamp, qrToken);
    } else {
      const h = location.hash === '#verify-account' ? 'passport' : location.hash.slice(1);
      show(['home', 'stamps', 'passport', 'thanks'].includes(h) ? h : 'home');
    }
    syncAll();
  })();
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
