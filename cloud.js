/* SILIP · cloud sync (Supabase). Falls back to local-only mode when not configured. */
(() => {
  'use strict';
  const cfg = window.SILIP_CONFIG || {};
  const lib = window.supabase && window.supabase.createClient;
  const enabled = !!(cfg.supabaseUrl && cfg.supabaseKey && lib);
  let sb = null, session = null, ready = null, recovering = null;
  const missingSession = error => ['user_not_found', 'session_not_found', 'refresh_token_not_found'].includes(error?.code);

  // A deleted Auth user can leave an unexpired JWT in this browser. Recover only
  // from explicit missing-session errors; connection failures must not sign users out.
  function recoverGuestSession() {
    if (!recovering) {
      recovering = (async () => {
        const out = await sb.auth.signOut({ scope: 'local' });
        if (out.error && !missingSession(out.error)) throw out.error;
        session = null;
        const guest = await sb.auth.signInAnonymously();
        if (guest.error) throw guest.error;
        session = guest.data.session;
      })().finally(() => { recovering = null; });
    }
    return recovering;
  }

  const Cloud = {
    enabled,
    demo: cfg.demo !== false,
    onSignIn: null,

    /** Create the client and make sure we have a session (anonymous if nobody is signed in). */
    init() {
      if (!enabled) return Promise.resolve(null);
      if (!ready) {
        ready = (async () => {
          if (!sb) {
            sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, {
              auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
            });
            sb.auth.onAuthStateChange((ev, s) => {
              session = s;
              // Defer queries until the auth callback releases its lock.
              setTimeout(() => {
                if (['SIGNED_IN', 'USER_UPDATED', 'SIGNED_OUT'].includes(ev) && Cloud.onSignIn) Cloud.onSignIn();
                window.dispatchEvent(new CustomEvent('silip:auth', { detail: ev }));
              }, 0);
            });
          }
          const got = await sb.auth.getSession();
          if (got.error) {
            if (!missingSession(got.error)) throw got.error;
            await recoverGuestSession();
          } else session = got.data.session;
          if (session) {
            // getSession reads cached credentials; getUser checks the Auth server.
            const checked = await sb.auth.getUser();
            if (checked.error) {
              if (!missingSession(checked.error)) throw checked.error;
              await recoverGuestSession();
            } else if (checked.data.user) session = { ...session, user: checked.data.user };
          }
          if (!session) {
            const r = await sb.auth.signInAnonymously();
            if (r.error) throw r.error;
            session = r.data.session;
          }
          return sb;
        })().catch(e => { ready = null; throw e; });
      }
      return ready;
    },

    uid() { return session && session.user ? session.user.id : null; },
    isPermanent() { return !!(session && session.user && !session.user.is_anonymous); },
    email() { return session && session.user ? session.user.email || '' : ''; },
    hasAccount() { return !!(session?.user?.email && !session.user.is_anonymous); },

    async signInWithPassword(email, password) {
      if (!enabled) throw new Error('Account service is not configured.');
      await Cloud.init();
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      session = data.session;
      if (!Cloud.hasAccount()) throw new Error('Could not log into your account.');
    },

    async setPassword(password, expectedUserId = Cloud.uid()) {
      if (!enabled) throw new Error('Account service is not configured.');
      await Cloud.init();
      if (Cloud.uid() !== expectedUserId || !Cloud.hasAccount()) throw new Error('Log in before setting a password.');
      if (typeof password !== 'string' || password.length < 8) throw new Error('Use at least 8 characters for your password.');
      const { data, error } = await sb.auth.updateUser({ password });
      if (error) throw error;
      if (data?.user && session) session = { ...session, user: data.user };
    },

    async createAccount(email, password) {
      if (!enabled) throw new Error('Account service is not configured.');
      await Cloud.init();
      if (Cloud.hasAccount()) throw new Error('Log out before creating another account.');
      if (typeof password !== 'string' || password.length < 8) throw new Error('Use at least 8 characters for your password.');
      // With Confirm email OFF, Supabase upgrades this guest without sending email.
      // Keeping the UID also keeps all server-validated stamps owned by this guest.
      let result = await sb.auth.updateUser({ email, password });
      if (missingSession(result.error)) {
        await recoverGuestSession();
        result = await sb.auth.updateUser({ email, password });
      }
      if (result.error) throw result.error;
      if (result.data?.user && session) session = { ...session, user: result.data.user };
      if (!Cloud.hasAccount()) throw new Error('Turn OFF Confirm email in Supabase Authentication → Sign In / Providers, then try again.');
    },

    async fetchProfile() {
      await Cloud.init();
      if (!Cloud.hasAccount()) return null;
      const { data, error } = await sb.from('profiles').select('name, age, photo, issued_at').eq('user_id', Cloud.uid()).maybeSingle();
      if (error) throw error;
      return data;
    },

    async saveProfile(profile, expectedUserId = Cloud.uid()) {
      await Cloud.init();
      if (Cloud.uid() !== expectedUserId) throw new Error('Account changed. Please try again.');
      if (!Cloud.hasAccount()) throw new Error('Log in before saving your profile.');
      const { error } = await sb.from('profiles').upsert({
        user_id: expectedUserId, name: profile.name.trim(),
        age: profile.age === '' || profile.age == null ? null : Number(profile.age),
        photo: profile.photo || '', issued_at: profile.issued_at || new Date().toISOString()
      }, { onConflict: 'user_id' });
      if (error) throw error;
    },

    /** Ask the server to verify a QR token and record the stamp.
     *  Resolves {ok, new, collected_at} or {ok:false, error}. Rejects on network/server trouble. */
    async collect(siteId, token) {
      await Cloud.init();
      const { data, error } = await sb.rpc('collect_stamp', { p_site: siteId, p_token: token });
      if (error) {
        if (/rate_limited/.test(error.message || '')) return { ok: false, error: 'rate_limited' };
        throw error;
      }
      return data;
    },

    async fetchStamps() {
      await Cloud.init();
      const { data, error } = await sb.from('stamps').select('site_id, collected_at');
      if (error) throw error;
      return data || [];
    },

    /** Forget this identity and start a fresh anonymous one (used by "reset my passport"). */
    async reset() {
      if (!enabled) return;
      await Cloud.init();
      const signedOut = await sb.auth.signOut({ scope: 'local' });
      if (signedOut.error) throw signedOut.error;
      session = null;
      const guest = await sb.auth.signInAnonymously();
      if (guest.error) { ready = null; throw guest.error; }
      session = guest.data.session;
    }
  };
  window.SilipCloud = Cloud;
})();
