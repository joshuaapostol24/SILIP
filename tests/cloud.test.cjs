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
      if (input.email && !options.confirmationRequired) {
        user = { ...user, email: input.email, is_anonymous: false };
        callback('USER_UPDATED', { user });
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

test('signup upgrades guest without OTP and preserves stamp ownership', async () => {
  const { cloud, calls } = setup();
  await cloud.createAccount('maria@gmail.com', 'CorrectPassword1!');
  assert.equal(cloud.uid(), 'guest-1'); assert.equal(cloud.hasAccount(), true);
  assert.deepEqual(Object.keys(calls.find(c => c[0] === 'update')[1]).sort(), ['email', 'password']);
  assert.equal(calls.some(c => c[0] === 'otp' || c[0] === 'verify'), false);
  await cloud.saveProfile({name:' Maria ',age:'25',password:'never-store-this'});
  const profile = await cloud.fetchProfile();
  assert.equal(profile.name, 'Maria'); assert.equal(profile.age, 25);
  assert.equal(profile.user_id, 'guest-1'); assert.equal('password' in profile, false);
  await assert.rejects(cloud.saveProfile({name:'Wrong owner'}, 'another-user'), /Account changed/);
  await assert.rejects(cloud.createAccount('another@gmail.com', 'CorrectPassword1!'), /Log out/);
});
test('guest cannot access profiles or set passwords', async () => {
  const { cloud } = setup();
  assert.equal(await cloud.fetchProfile(), null);
  await assert.rejects(cloud.saveProfile({name:'Guest'}), /Log in/);
  await assert.rejects(cloud.setPassword('CorrectPassword1!'), /Log in/);
  await assert.rejects(cloud.createAccount('maria@gmail.com', 'short'), /at least 8/);
});
test('signup does not pretend to succeed with Confirm email still enabled', async () => {
  const {cloud, calls} = setup(true, {confirmationRequired:true});
  await assert.rejects(cloud.createAccount('maria@gmail.com', 'CorrectPassword1!'), /Turn OFF Confirm email/);
  assert.equal(cloud.hasAccount(), false); assert.equal(calls.some(c=>c[0]==='upsert'), false);
});
test('password login rejects wrong passwords and sends no email', async () => {
  const {cloud,calls} = setup();
  await assert.rejects(cloud.signInWithPassword('owner@gmail.com','wrong'), /Invalid login credentials/);
  assert.equal(cloud.hasAccount(),false);
  await cloud.signInWithPassword('owner@gmail.com','CorrectPassword1!');
  assert.equal(cloud.uid(),'existing-user'); assert.equal(cloud.hasAccount(),true);
  assert.equal(calls.some(c=>c[0]==='otp'||c[0]==='verify'||c[0]==='update'),false);
  await cloud.reset(); assert.equal(cloud.hasAccount(),false); assert.equal(cloud.uid(),'guest-2');
});
test('signed in account can change password without profile credentials', async () => {
  const {cloud,calls} = setup();
  await cloud.createAccount('owner@gmail.com','CorrectPassword1!');
  await assert.rejects(cloud.setPassword('short'),/at least 8/);
  await assert.rejects(cloud.setPassword('CorrectPassword1!','other-user'),/Log in/);
  await cloud.setPassword('ReplacementPassword1!');
  assert.equal(Object.keys(calls.at(-1)[1]).join(','),'password'); assert.equal(calls.some(c=>c[0]==='upsert'),false);
});
test('blank configuration cannot create or log into accounts', async () => {
  const {cloud} = setup(false);
  await assert.rejects(cloud.createAccount('owner@gmail.com','CorrectPassword1!'),/not configured/);
  await assert.rejects(cloud.signInWithPassword('owner@gmail.com','CorrectPassword1!'),/not configured/);
});
test('deleted cached user is replaced before signup', async () => {
  const {cloud,calls} = setup(true,{validationError:{code:'user_not_found'}});
  await cloud.createAccount('owner@gmail.com','CorrectPassword1!');
  assert.equal(cloud.uid(),'guest-2'); assert.equal(cloud.hasAccount(),true);
  assert.equal(calls.filter(c=>c[0]==='guest').length,1);
});
test('stale refresh token recovers even when signOut reports a missing user', async () => {
  const {cloud,calls} = setup(true,{sessionError:{code:'refresh_token_not_found'},signOutError:{code:'user_not_found'}});
  await cloud.init(); assert.equal(cloud.uid(),'guest-2'); assert.equal(calls.filter(c=>c[0]==='guest').length,1);
});
test('signup retries once if guest is deleted after startup', async () => {
  const {cloud,calls} = setup(true,{updateError:{code:'user_not_found'}});
  await cloud.createAccount('owner@gmail.com','CorrectPassword1!');
  assert.equal(cloud.uid(),'guest-2'); assert.equal(calls.filter(c=>c[0]==='update').length,2);
  const repeated = setup(true,{updateError:{code:'user_not_found'},repeatError:true});
  await assert.rejects(repeated.cloud.createAccount('owner@gmail.com','CorrectPassword1!'),e=>e.code==='user_not_found');
  assert.equal(repeated.calls.filter(c=>c[0]==='update').length,2);
});
test('network and signup failures do not discard the guest', async () => {
  const network = setup(true,{validationError:{code:'network_error',message:'Failed to fetch'}});
  await assert.rejects(network.cloud.init(),e=>e.message==='Failed to fetch');
  assert.equal(network.calls.some(c=>c[0]==='logout'||c[0]==='guest'),false);
  const failed = setup(true,{updateError:{code:'email_exists',message:'Email already registered'}});
  await assert.rejects(failed.cloud.createAccount('owner@gmail.com','CorrectPassword1!'),e=>e.code==='email_exists');
  assert.equal(failed.cloud.uid(),'guest-1'); assert.equal(failed.cloud.hasAccount(),false);
});
