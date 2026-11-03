/* Email/password accounts. Credentials are handled only by Supabase Auth. */
(() => {
  'use strict';
  const cloud = window.SilipCloud, $ = s => document.querySelector(s);
  const dialog = $('#accountDialog'), message = $('#accountMessage');
  let mode = 'login', draft = null, busy = false, returnToPassport = false;
  const localProfile = () => window.SilipPassport.profile();
  ['accountPassword', 'accountConfirm', 'accountNewPassword', 'accountNewConfirm'].forEach(id => {
    const input = $('#' + id), wrap = document.createElement('div'), toggle = document.createElement('button');
    wrap.className = 'password-wrap'; input.before(wrap); wrap.append(input);
    toggle.type = 'button'; toggle.className = 'password-toggle'; toggle.textContent = 'Show';
    toggle.setAttribute('aria-label', 'Show ' + document.querySelector('label[for="' + id + '"]').textContent.toLowerCase());
    toggle.setAttribute('aria-controls', id); toggle.setAttribute('aria-pressed', 'false');
    toggle.addEventListener('click', () => {
      const visible = input.type === 'password'; input.type = visible ? 'text' : 'password';
      toggle.textContent = visible ? 'Hide' : 'Show'; toggle.setAttribute('aria-pressed', String(visible));
      toggle.setAttribute('aria-label', (visible ? 'Hide ' : 'Show ') + document.querySelector('label[for="' + id + '"]').textContent.toLowerCase());
    });
    wrap.append(toggle);
  });
  function status(text, error = false) { message.textContent = text; message.classList.toggle('error', error); }
  function clearPasswords() {
    ['#accountPassword', '#accountConfirm', '#accountNewPassword', '#accountNewConfirm'].forEach(s => {
      const input = $(s); input.value = ''; input.type = 'password';
      const toggle = input.nextElementSibling; toggle.textContent = 'Show'; toggle.setAttribute('aria-pressed', 'false');
      toggle.setAttribute('aria-label', 'Show ' + document.querySelector('label[for="' + input.id + '"]').textContent.toLowerCase());
    });
  }
  function accountError(e) {
    if (['user_not_found', 'session_not_found', 'refresh_token_not_found'].includes(e.code)) return 'Your saved session has expired. Refresh the page and try again.';
    if (e.code === 'invalid_credentials') return 'Incorrect email or password.';
    if (e.code === 'email_exists' || e.code === 'user_already_exists') return 'This email already has an account. Choose Log in.';
    if (e.code === 'email_not_confirmed' || /sending.*email/i.test(e.message || '')) return 'Email confirmation is still enabled in Supabase. Turn OFF Confirm email under Authentication → Sign In / Providers.';
    if (e.status === 429) return 'Too many requests. Please wait before trying again.';
    return (e.message || 'Could not complete this request. Please try again.') + (e.code ? ` (${e.code})` : '');
  }
  function setBusy(value) {
    busy = value; dialog.setAttribute('aria-busy', String(value));
    dialog.querySelectorAll('button, input').forEach(el => { el.disabled = value; });
    $('#accountIdentityFields').disabled = value || mode !== 'create';
    $('#accountConfirm').disabled = value || mode !== 'create';
    $('#accountSend').disabled = value || !cloud.enabled;
    $('#accountSend').textContent = mode === 'create' ? 'Create account' : 'Log in';
  }
  function selectMode(value) {
    mode = value; draft = null; clearPasswords();
    $('#accountLoginTab').setAttribute('aria-pressed', String(mode === 'login'));
    $('#accountCreateTab').setAttribute('aria-pressed', String(mode === 'create'));
    $('#accountIdentityFields').hidden = mode !== 'create';
    $('#accountName').required = mode === 'create';
    $('#accountPrivacy').hidden = mode !== 'create';
    $('#accountPassword').autocomplete = mode === 'create' ? 'new-password' : 'current-password';
    $('#accountPassword').minLength = mode === 'create' ? 8 : 1;
    $('#accountConfirmWrap').hidden = mode !== 'create';
    $('#accountConfirm').required = mode === 'create';
    $('#accountPasswordForm').hidden = true;
    $('#accountAuthHelp').textContent = mode === 'create' ? 'Create your account with an email and password. No email code is needed.' : 'Log in with your email and password.';
    $('#accountEmailForm').hidden = false; status(''); setBusy(false);
  }
  async function showProfile() {
    const profile = await cloud.fetchProfile();
    $('#accountAuth').hidden = true; $('#accountProfileForm').hidden = false; $('#accountPasswordForm').hidden = true;
    $('#accountEmailLabel').textContent = `Account email: ${cloud.email()}`;
    $('#profileName').value = draft?.name ?? profile?.name ?? '';
    $('#profileAge').value = draft?.age ?? profile?.age ?? '';
  }
  function updateEntry() { $('#accountBtn').textContent = cloud.hasAccount() ? 'My account' : 'Log in / Sign up'; }
  async function openAccount(value = 'login', returnTo = '') {
    if (dialog.open) return;
    returnToPassport = returnTo === 'passport'; selectMode(value);
    if (mode === 'create') { const p = localProfile(); $('#accountName').value = p.name; $('#accountAge').value = p.age; }
    $('#accountAuth').hidden = false; $('#accountProfileForm').hidden = true;
    $('#accountUnavailable').hidden = cloud.enabled;
    dialog.showModal();
    if (!cloud.enabled) return;
    setBusy(true);
    try { await cloud.init(); if (cloud.hasAccount()) await showProfile(); }
    catch (e) { status(accountError(e), true); }
    finally { setBusy(false); updateEntry(); }
  }
  $('#accountBtn').addEventListener('click', () => openAccount());
  window.addEventListener('silip:open-account', e => openAccount(e.detail?.mode === 'create' ? 'create' : 'login', e.detail?.returnTo));
  $('#accountClose').addEventListener('click', () => { if (!busy) dialog.close(); });
  dialog.addEventListener('cancel', e => { if (busy) e.preventDefault(); });
  dialog.addEventListener('close', clearPasswords);
  $('#accountLoginTab').addEventListener('click', () => selectMode('login'));
  $('#accountCreateTab').addEventListener('click', () => {
    selectMode('create'); const p = localProfile(); $('#accountName').value = p.name; $('#accountAge').value = p.age;
  });
  $('#accountSetPassword').addEventListener('click', () => {
    $('#accountAuth').hidden = true; $('#accountProfileForm').hidden = true;
    $('#accountPasswordForm').hidden = false; clearPasswords(); status('');
  });
  $('#accountEmailForm').addEventListener('submit', async e => {
    e.preventDefault(); if (busy || !cloud.enabled) return;
    const email = $('#accountEmail').value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { status('Enter a valid email address.', true); return; }
    if (mode === 'create') {
      const name = $('#accountName').value.trim(), age = $('#accountAge').value;
      if (!name || !$('#accountAge').checkValidity()) { status('Enter your name and a valid age from 1 to 120, or leave age blank.', true); return; }
      if ($('#accountPassword').value.length < 8) { status('Use at least 8 characters for your password.', true); return; }
      if ($('#accountPassword').value !== $('#accountConfirm').value) { status('The passwords do not match.', true); return; }
      draft = { ...localProfile(), name, age };
    }
    setBusy(true); status(mode === 'create' ? 'Creating your account…' : 'Logging in…');
    let signedIn = false;
    try {
      if (mode === 'create') await cloud.createAccount(email, $('#accountPassword').value);
      else await cloud.signInWithPassword(email, $('#accountPassword').value);
      signedIn = true;
      if (draft) { await cloud.saveProfile(draft); draft = null; }
      await window.SilipPassport.refresh(); await showProfile();
      status('You’re signed in. Your passport is linked to your account.');
      if (mode === 'create' || returnToPassport) { dialog.close(); window.SilipPassport.navigate('passport'); }
    } catch (err) {
      if (signedIn) {
        $('#accountAuth').hidden = true; $('#accountProfileForm').hidden = false;
        $('#accountEmailLabel').textContent = `Account email: ${cloud.email()}`;
        $('#profileName').value = draft?.name || ''; $('#profileAge').value = draft?.age || '';
        status('You’re signed in, but your details could not be saved or loaded. Use Save details to retry. ' + accountError(err), true);
      } else status(accountError(err), true);
    } finally { clearPasswords(); setBusy(false); updateEntry(); }
  });
  $('#accountPasswordForm').addEventListener('submit', async e => {
    e.preventDefault(); if (busy) return;
    if ($('#accountNewPassword').value !== $('#accountNewConfirm').value) { status('The passwords do not match.', true); return; }
    setBusy(true);
    try { await cloud.setPassword($('#accountNewPassword').value); await showProfile(); status('Your password is saved.'); }
    catch (err) { status(accountError(err), true); }
    finally { clearPasswords(); setBusy(false); updateEntry(); }
  });
  $('#accountProfileForm').addEventListener('submit', async e => {
    e.preventDefault(); if (busy) return;
    const name = $('#profileName').value.trim(); if (!name) return;
    setBusy(true);
    try {
      const existing = await cloud.fetchProfile();
      await cloud.saveProfile({ ...(existing || draft || { photo: '', issued_at: new Date().toISOString() }), name, age: $('#profileAge').value });
      draft = null; await window.SilipPassport.refresh(); status('Your details are saved.');
      if (returnToPassport) dialog.close();
    } catch (err) { status('Could not save your details. ' + accountError(err), true); }
    finally { setBusy(false); }
  });
  $('#accountSignOut').addEventListener('click', async () => {
    if (busy) return; setBusy(true);
    try {
      await cloud.reset(); await window.SilipPassport.refresh();
      ['#profileName', '#profileAge', '#accountName', '#accountAge', '#accountEmail'].forEach(s => { $(s).value = ''; });
      draft = null; dialog.close();
    } catch (err) { status(accountError(err), true); }
    finally { setBusy(false); updateEntry(); }
  });
  try { sessionStorage.removeItem('silip.pending-verification'); } catch {}
  if (location.hash === '#verify-account') window.SilipPassport.navigate('passport');
  window.addEventListener('silip:auth', updateEntry);
  updateEntry();
})();
