const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

function setup(enabled = true, options = {}) {
  let user = { id: 'guest-1', is_anonymous: true }, callback;
  const calls = [], profiles = new Map();
  const auth = {
    onAuthStateChange(fn) { callback = fn; },
    async getSession() { return { data: { session: { user } }, error: options.sessionError || null }; },
    async getUser() {
      if (options.validationError && user.id === 'guest-1') return { data: { user: null }, error: options.validationError };
      return { data: { user } };
    },
    async signInAnonymously() { calls.push(['guest']); user = { id: 'guest-2', is_anonymous: true }; callback('SIGNED_IN', { user }); return { data: { session: { user } } }; },
    async updateUser(input) {
      calls.push(['update', input]);
      if (options.updateError) {
        const error = options.updateError;
        if (!options.repeatError) options.updateError = null;
        return { error };
      }
      return { data: { user } };
    },
    async signInWithOtp(input) { calls.push(['otp', input]); return { data: {} }; },
    async signInWithPassword(input) {
      calls.push(['password-login', { email: input.email }]);
      if (input.password !== 'CorrectPassword1!') return { error: Object.assign(new Error('Invalid login credentials'), { code: 'invalid_credentials' }) };
      user = { id: 'existing-user', email: input.email, email_confirmed_at: '2026-11-03T00:00:00Z', is_anonymous: false };
      callback('SIGNED_IN', { user }); return { data: { session: { user } } };
    },
    async verifyOtp(input) {
      calls.push(['verify', input]);
      if (input.token !== '123456') return { error: new Error('expired token') };
      user = { id: input.type === 'email_change' ? user.id : 'existing-user', email: input.email, email_confirmed_at: '2026-11-03T00:00:00Z', is_anonymous: false };
      callback('SIGNED_IN', { user }); return { data: { session: { user } } };
    },
    async signOut(input) { calls.push(['logout', input]); callback('SIGNED_OUT', null); return { error: options.signOutError || null }; }
  };
  const client = { auth, from(table) {
    return {
      select() { return this; }, eq(key, value) { this.id = value; return this; },
      async maybeSingle() { return { data: profiles.get(this.id) || null }; },
      async upsert(row) { calls.push(['upsert', table, row]); profiles.set(row.user_id, row); return {}; }
    };
  }};
  const window = {
    SILIP_CONFIG: enabled ? { supabaseUrl: 'https://example.supabase.co', supabaseKey: 'public-test' } : {},
    supabase: { createClient: () => client }, dispatchEvent() {}
  };
  vm.runInNewContext(fs.readFileSync('cloud.js', 'utf8'), { window, location: { origin:'https://silip.test', pathname:'/' }, setTimeout, CustomEvent: class {} });
  return { cloud: window.SilipCloud, calls, profiles };
}

test('signup upgrades the guest and cannot save profile before OTP verification', async () => {
  const { cloud, calls } = setup();
  assert.equal(await cloud.requestEmailCode('maria@gmail.com', true), 'email_change');
  assert.equal(calls[0][0], 'update');
  assert.equal(cloud.uid(), 'guest-1');
  await assert.rejects(cloud.saveProfile({ name: 'Maria', age: '25' }), /Verify your email/);
  await assert.rejects(cloud.verifyEmailCode('maria@gmail.com', '000000', 'email_change'), /expired/);
  assert.equal(cloud.hasVerifiedEmail(), false);
  await cloud.verifyEmailCode('maria@gmail.com', '123456', 'email_change');
  assert.equal(cloud.uid(), 'guest-1');
  assert.equal(cloud.hasVerifiedEmail(), true);
  await cloud.saveProfile({ name: ' Maria ', age: '25', photo: '', issued_at: '2026-11-03T00:00:00Z' });
  const profile = await cloud.fetchProfile();
  assert.equal(profile.name, 'Maria'); assert.equal(profile.age, 25);
  assert.equal(profile.user_id, 'guest-1');
  assert.equal('email' in profile, false);
  await assert.rejects(cloud.saveProfile({ name: 'Wrong owner' }, 'another-user'), /Account changed/);
});

test('login does not create users and verifies email tokens before restoring a profile', async () => {
  const { cloud, calls, profiles } = setup();
  profiles.set('existing-user', { name: 'Existing owner', age: 32, photo: '' });
  assert.equal(await cloud.requestEmailCode('existing@gmail.com', false), 'email');
  assert.equal(calls[0][1].options.shouldCreateUser, false);
  assert.equal(await cloud.fetchProfile(), null);
  await cloud.verifyEmailCode('existing@gmail.com', '123456', 'email');
  assert.equal((await cloud.fetchProfile()).name, 'Existing owner');
  await assert.rejects(cloud.verifyEmailCode('existing@gmail.com', '123456', 'made_up_type'), /Request a new code/);
});

test('logout clears the session on this device and starts a new guest', async () => {
  const { cloud, calls } = setup();
  await cloud.verifyEmailCode('maria@gmail.com', '123456', 'email');
  await cloud.reset();
  assert.equal(cloud.uid(), 'guest-2'); assert.equal(cloud.hasVerifiedEmail(), false);
  assert.equal(calls.find(c => c[0] === 'logout')[1].scope, 'local');
});

test('unconfigured accounts cannot pretend to send or verify email', async () => {
  const { cloud } = setup(false);
  assert.equal(cloud.enabled, false);
  await assert.rejects(cloud.requestEmailCode('maria@gmail.com', true), /not configured/);
  await assert.rejects(cloud.verifyEmailCode('maria@gmail.com', '123456', 'email'), /not configured/);
  await assert.rejects(cloud.signInWithPassword('maria@gmail.com', 'CorrectPassword1!'), /not configured/);
});

test('password login sends no email and restores the authenticated account', async () => {
  const { cloud, calls } = setup();
  await assert.rejects(cloud.signInWithPassword('existing@gmail.com', 'wrong'), /Invalid login credentials/);
  assert.equal(cloud.hasVerifiedEmail(), false);
  await cloud.signInWithPassword('existing@gmail.com', 'CorrectPassword1!');
  assert.equal(cloud.uid(), 'existing-user');
  assert.equal(cloud.hasVerifiedEmail(), true);
  assert.equal(calls.some(c => c[0] === 'otp' || c[0] === 'update'), false);
});

test('password creation requires a verified email and never writes passwords to profiles', async () => {
  const { cloud, calls } = setup();
  await cloud.init();
  await assert.rejects(cloud.setPassword('CorrectPassword1!'), /Verify your email/);
  await cloud.verifyEmailCode('maria@gmail.com', '123456', 'email_change');
  await assert.rejects(cloud.setPassword('short'), /at least 8/);
  await assert.rejects(cloud.setPassword('CorrectPassword1!', 'other-user'), /Verify your email/);
  await cloud.setPassword('CorrectPassword1!');
  assert.equal(calls.at(-1)[0], 'update');
  assert.equal(Object.keys(calls.at(-1)[1]).join(','), 'password');
  assert.equal(calls.some(c => c[0] === 'upsert'), false);
});

test('a deleted cached user is signed out locally and replaced before signup', async () => {
  const { cloud, calls } = setup(true, { validationError: { code: 'user_not_found', message: 'Deleted user' } });
  await cloud.requestEmailCode('maria@gmail.com', true);
  assert.equal(cloud.uid(), 'guest-2');
  assert.equal(calls[0][0], 'logout');
  assert.equal(calls[0][1].scope, 'local');
  assert.equal(calls.filter(c => c[0] === 'guest').length, 1);
  assert.equal(calls.filter(c => c[0] === 'update').length, 1);
});

test('a stale refresh token also recovers, including when signOut reports a missing user', async () => {
  const { cloud, calls } = setup(true, { sessionError: { code: 'refresh_token_not_found' }, signOutError: { code: 'user_not_found' } });
  await cloud.init();
  assert.equal(cloud.uid(), 'guest-2');
  assert.equal(calls.filter(c => c[0] === 'guest').length, 1);
});

test('signup recovers once if the guest is deleted after startup', async () => {
  const { cloud, calls } = setup(true, { updateError: { code: 'user_not_found' } });
  await cloud.requestEmailCode('maria@gmail.com', true);
  assert.equal(cloud.uid(), 'guest-2');
  assert.equal(calls.filter(c => c[0] === 'update').length, 2);
});

test('repeated missing-user errors do not cause an unlimited signup retry', async () => {
  const { cloud, calls } = setup(true, { updateError: { code: 'user_not_found' }, repeatError: true });
  await assert.rejects(cloud.requestEmailCode('maria@gmail.com', true), e => e.code === 'user_not_found');
  assert.equal(calls.filter(c => c[0] === 'update').length, 2);
});

test('network and email delivery failures do not discard the current session', async () => {
  const network = setup(true, { validationError: { code: 'network_error', message: 'Failed to fetch' } });
  await assert.rejects(network.cloud.init(), e => e.message === 'Failed to fetch');
  assert.equal(network.calls.some(c => c[0] === 'logout' || c[0] === 'guest'), false);
  const smtp = setup(true, { updateError: { code: 'unexpected_failure', message: 'Error sending email change email' } });
  await assert.rejects(smtp.cloud.requestEmailCode('maria@gmail.com', true), e => e.message === 'Error sending email change email');
  assert.equal(smtp.cloud.uid(), 'guest-1');
  assert.equal(smtp.calls.some(c => c[0] === 'logout' || c[0] === 'guest'), false);
});
