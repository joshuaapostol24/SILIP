/* SILIP configuration.
 * Leave supabaseUrl / supabaseKey empty to run in local-only mode (no database).
 * Fill them in from Supabase → Project Settings → API:
 *   supabaseUrl  e.g. https://abcdxyz.supabase.co
 *   supabaseKey  the public "anon" / publishable key (safe to ship in a web app).
 * NEVER put the service_role / secret key here.
 * Email/password accounts require Email auth and anonymous sign-ins ON,
 * Confirm email OFF, and the latest Supabase account profile policies.
 */
window.SILIP_CONFIG = {
  supabaseUrl: 'https://vsgfzscpptthrjxlshib.supabase.co',
  supabaseKey: 'sb_publishable_7Nn9BeiEwWcJEKPtSB0zbQ_yBzBy-86',
  demo: true   // true = keep the "Simulate scan" button; set false for the real deployment
};
