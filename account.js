/* Email/password accounts. Supabase handles credentials and verification. */
(() => {
  'use strict';
  const cloud = window.SilipCloud, $ = s => document.querySelector(s);
  const dialog = $('#accountDialog'), message = $('#accountMessage');
  let mode = 'login', email = '', otpType = '', draft = null, busy = false, resendAt = 0;
  let timer, returnToPassport = false;
  const localProfile = () => window.SilipPassport.profile();
  function status(text, error = false) { message.textContent = text; message.classList.toggle('error', error); }
  function clearPasswords() {
    ['#accountPassword', '#accountConfirm', '#accountNewPassword', '#accountNewConfirm'].forEach(s => { $(s).value = ''; });
  }
  function accountError(e) {
    if (e.code === 'invalid_credentials') return 'Incorrect email or password. If you registered before passwords were added, choose “Forgot or need a password?”.';
    if (e.code === 'email_not_confirmed') return 'Verify your email first. Choose “Forgot or need a password?” to request a verification code.';
    if (e.status === 429) return 'Too many requests. Please wait before trying again.';
    return (e.message || 'Could not complete this request. Please try again.') + (e.code ? ` (${e.code})` : '');
  }
  function showPasswordSetup() {
    $('#accountAuth').hidden = true; $('#accountProfileForm').hidden = true;
    $('#accountPasswordForm').hidden = false; clearPasswords();
  }
  function normalizeEmail(value) {
    const email = value.trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
  }
  function cooldown() {
    const seconds = Math.max(0, Math.ceil((resendAt - Date.now()) / 1000));
    $('#accountResend').disabled = busy || seconds > 0;
    $('#accountSend').disabled = busy || !cloud.enabled || (mode !== 'login' && seconds > 0);
    $('#accountResend').textContent = seconds ? `Resend in ${seconds}s` : 'Resend code';
    $('#accountSend').textContent = mode === 'login' ? 'Log in' : seconds ? `Try again in ${seconds}s` : mode === 'create' ? 'Create account' : 'Send reset code';
  }
  function setBusy(value) {
    busy = value;
    dialog.setAttribute('aria-busy', String(value));
    dialog.querySelectorAll('button, input').forEach(el => { el.disabled = value; });
    $('#accountIdentityFields').disabled = value || mode !== 'create';
    $('#accountPasswordFields').disabled = value || mode === 'recover';
    $('#accountConfirm').disabled = value || mode !== 'create';
    cooldown();
  }
  function selectMode(value) {
    mode = value; draft = null; otpType = ''; clearPasswords();
    $('#accountLoginTab').setAttribute('aria-pressed', String(mode !== 'create'));
    $('#accountCreateTab').setAttribute('aria-pressed', String(mode === 'create'));
    $('#accountIdentityFields').hidden = mode !== 'create';
    $('#accountIdentityFields').disabled = mode !== 'create';
    $('#accountName').required = mode === 'create';
    $('#accountPrivacy').hidden = mode !== 'create';
    $('#accountPasswordFields').hidden = mode === 'recover';
    $('#accountPasswordFields').disabled = mode === 'recover';
    $('#accountPassword').autocomplete = mode === 'create' ? 'new-password' : 'current-password';
    $('#accountPassword').minLength = mode === 'create' ? 8 : 1;
    $('#accountConfirmWrap').hidden = mode !== 'create';
    $('#accountConfirm').required = mode === 'create';
    $('#accountConfirm').disabled = mode !== 'create';
    $('#accountForgot').hidden = mode !== 'login';
    $('#accountPasswordForm').hidden = true;
    $('#accountAuthHelp').textContent = mode === 'login' ? 'Log in with your email and password.'
      : mode === 'create' ? 'Verify your email once to finish signup. Future logins use your password.'
        : 'We’ll email a code to verify your identity before you set a new password.';
    $('#accountEmailForm').hidden = false; $('#accountCodeForm').hidden = true;
    $('#accountCode').value = ''; status(''); cooldown();
  }
  async function showProfile() {
    const profile = await cloud.fetchProfile();
    $('#accountAuth').hidden = true; $('#accountProfileForm').hidden = false; $('#accountPasswordForm').hidden = true;
    $('#accountVerified').textContent = `Verified email: ${cloud.email()}`;
    // If a signup profile write failed, retain the entered details for retry.
    $('#profileName').value = draft?.name ?? profile?.name ?? '';
    $('#profileAge').value = draft?.age ?? profile?.age ?? '';
  }
  function updateEntry() { $('#accountBtn').textContent = cloud.hasVerifiedEmail() ? 'My account' : 'Log in / Sign up'; }
  async function openAccount(mode = 'login', returnTo = '') {
    if (dialog.open) return;
    returnToPassport = returnTo === 'passport';
    status(''); selectMode(mode);
    if (mode === 'create') {
      const p = localProfile(); $('#accountName').value = p.name; $('#accountAge').value = p.age;
    }
    $('#accountAuth').hidden = false; $('#accountProfileForm').hidden = true;
    $('#accountUnavailable').hidden = cloud.enabled;
    dialog.showModal();
    timer = setInterval(cooldown, 1000);
    if (!cloud.enabled) { cooldown(); return; }
    setBusy(true);
    try { await cloud.init(); if (cloud.hasVerifiedEmail()) await showProfile(); }
    catch (e) { status(accountError(e), true); }
    finally { setBusy(false); updateEntry(); }
  }
  $('#accountBtn').addEventListener('click', () => openAccount());
  window.addEventListener('silip:open-account', e => openAccount(e.detail?.mode === 'create' ? 'create' : 'login', e.detail?.returnTo));
  $('#accountClose').addEventListener('click', () => dialog.close());
  dialog.addEventListener('cancel', e => { if (busy) e.preventDefault(); });
  dialog.addEventListener('close', () => { clearInterval(timer); $('#accountCode').value = ''; clearPasswords(); });
  $('#accountLoginTab').addEventListener('click', () => selectMode('login'));
  $('#accountCreateTab').addEventListener('click', () => {
    selectMode('create'); const p = localProfile();
    $('#accountName').value = p.name; $('#accountAge').value = p.age;
  });
  $('#accountChangeEmail').addEventListener('click', () => { selectMode(mode); $('#accountEmail').focus(); });
  $('#accountForgot').addEventListener('click', () => selectMode('recover'));
  $('#accountSetPassword').addEventListener('click', () => { showPasswordSetup(); status(''); });
  async function sendCode() {
    if (busy || (mode !== 'login' && Date.now() < resendAt) || !cloud.enabled) return;
    email = normalizeEmail($('#accountEmail').value);
    if (!email) { status('Enter a valid email address, such as yourname@gmail.com.', true); return; }
    if (mode === 'create') {
      const name = $('#accountName').value.trim(), age = $('#accountAge').value;
      if (!name || !$('#accountAge').checkValidity()) { status('Enter your name and a valid age from 1 to 120, or leave age blank.', true); return; }
      if ($('#accountPassword').value.length < 8) { status('Use at least 8 characters for your password.', true); return; }
      if ($('#accountPassword').value !== $('#accountConfirm').value) { status('The passwords do not match.', true); return; }
      draft = { ...localProfile(), name, age };
    }
    if (mode === 'login') {
      setBusy(true); status('Logging in…');
      try {
        await cloud.signInWithPassword(email, $('#accountPassword').value);
        await window.SilipPassport.refresh(); await showProfile();
        status('You’re signed in. Your passport is linked to your account.');
        if (returnToPassport) dialog.close();
      } catch (e) { status(accountError(e), true); }
      finally { clearPasswords(); setBusy(false); updateEntry(); }
      return;
    }
    setBusy(true); status('Sending your verification code…');
    try {
      otpType = await cloud.requestEmailCode(email, mode === 'create');
      resendAt = Date.now() + 60000;
      $('#accountEmailForm').hidden = true; $('#accountCodeForm').hidden = false;
      $('#accountCodeSent').textContent = `Enter the code sent to ${email}.`;
      $('#accountCode').value = ''; status('Check your inbox and spam folder.');
    } catch (e) {
      if (e.status === 429 || /rate|too many|seconds/i.test(e.message || '')) resendAt = Date.now() + 60000;
      if (/email_address_not_authorized|email_not_allowed/i.test(e.code || '') || /not authorized|not allowed.*email/i.test(e.message || '')) {
        status('Email delivery is limited to project team addresses until the site owner configures an email sender.', true);
      } else if (e.status === 429) {
        status('Too many email requests. Please wait before trying again.', true);
      } else status(accountError(e), true);
    } finally { setBusy(false); if (!$('#accountCodeForm').hidden) $('#accountCode').focus(); }
  }
  $('#accountEmailForm').addEventListener('submit', e => { e.preventDefault(); sendCode(); });
  $('#accountResend').addEventListener('click', sendCode);
  $('#accountCodeForm').addEventListener('submit', async e => {
    e.preventDefault(); if (busy) return;
    const code = $('#accountCode').value.trim();
    if (!/^\d{6,10}$/.test(code) || !otpType) { status('Enter the verification code from your email.', true); return; }
    setBusy(true); status('Verifying…');
    let verified = false;
    try {
      await cloud.verifyEmailCode(email, code, otpType); verified = true;
      if (mode === 'recover') { showPasswordSetup(); status('Email verified. Choose your new password.'); return; }
      try { await cloud.setPassword($('#accountPassword').value); }
      catch (e) { showPasswordSetup(); status('Email verified. Please set your password to finish. ' + accountError(e), true); return; }
      clearPasswords();
      if (mode === 'create' && draft) await cloud.saveProfile(draft);
      draft = null;
      await window.SilipPassport.refresh();
      await showProfile(); status('You’re signed in. Your passport is linked to your account.');
      if (returnToPassport) dialog.close();
    } catch (e) {
      if (verified) {
        $('#accountAuth').hidden = true; $('#accountProfileForm').hidden = false;
        $('#accountVerified').textContent = `Verified email: ${email}`;
        $('#profileName').value = draft?.name || ''; $('#profileAge').value = draft?.age || '';
        status('Your email is verified, but your details could not be saved or loaded. Check your connection and use Save details to retry.', true);
      } else status(/otp_expired|otp_disabled/.test(e.code || '') || /expired|bad code/i.test(e.message || '')
        ? 'The code is incorrect or expired. Try again, or request a new code.' : accountError(e), true);
    } finally { $('#accountCode').value = ''; setBusy(false); updateEntry(); }
  });
  $('#accountPasswordForm').addEventListener('submit', async e => {
    e.preventDefault(); if (busy) return;
    if ($('#accountNewPassword').value !== $('#accountNewConfirm').value) { status('The passwords do not match.', true); return; }
    setBusy(true);
    try {
      await cloud.setPassword($('#accountNewPassword').value);
      if (draft) { await cloud.saveProfile(draft); draft = null; }
      await window.SilipPassport.refresh(); await showProfile(); status('Your password is saved.');
      if (returnToPassport) dialog.close();
    } catch (err) { status(accountError(err), true); }
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
    } catch { status('Could not save your details. Check your connection and try again.', true); }
    finally { setBusy(false); }
  });
  $('#accountSignOut').addEventListener('click', async () => {
    if (busy) return; setBusy(true);
    try {
      await cloud.reset(); await window.SilipPassport.refresh();
      ['#profileName', '#profileAge', '#accountName', '#accountAge', '#accountEmail'].forEach(s => { $(s).value = ''; });
      draft = null; dialog.close();
    }
    catch { status('Could not log out. Please try again.', true); }
    finally { setBusy(false); updateEntry(); }
  });
  window.addEventListener('silip:auth', updateEntry);
  updateEntry();
})();
