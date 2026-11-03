const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

function setup(enabled = true) {
  let user = { id: 'guest-1', is_anonymous: true }, callback;
  const calls = [], profiles = new Map();
  const auth = {
    onAuthStateChange(fn) { callback = fn; },
    async getSession() { return { data: { session: { user } } }; },
    async signInAnonymously() { user = { id: 'guest-2', is_anonymous: true }; callback('SIGNED_IN', { user }); return { data: { session: { user } } }; },
    async updateUser(input) { calls.push(['update', input]); return { data: { user } }; },
    async signInWithOtp(input) { calls.push(['otp', input]); return { data: {} }; },
    async verifyOtp(input) {
      calls.push(['verify', input]);
      if (input.token !== '123456') return { error: new Error('expired token') };
      user = { id: input.type === 'email_change' ? user.id : 'existing-user', email: input.email, email_confirmed_at: '2026-11-03T00:00:00Z', is_anonymous: false };
      callback('SIGNED_IN', { user }); return { data: { session: { user } } };
    },
    async signOut(input) { calls.push(['logout', input]); callback('SIGNED_OUT', null); return {}; }
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
});
