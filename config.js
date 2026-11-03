/* SILIP configuration.
 * Leave supabaseUrl / supabaseKey empty to run in local-only mode (no database).
 * Fill them in from Supabase → Project Settings → API:
 *   supabaseUrl  e.g. https://abcdxyz.supabase.co
 *   supabaseKey  the public "anon" / publishable key (safe to ship in a web app).
 * NEVER put the service_role / secret key here.
 * Email accounts require Email auth, email confirmation, manual identity
 * linking, email OTP templates, and the latest Supabase profile policies.
 * Configure SMTP in Supabase for delivery to addresses outside the project team.
 */
window.SILIP_CONFIG = {
  supabaseUrl: 'https://vsgfzscpptthrjxlshib.supabase.co',
  supabaseKey: 'sb_publishable_7Nn9BeiEwWcJEKPtSB0zbQ_yBzBy-86',
  demo: true   // true = keep the "Simulate scan" button; set false for the real deployment
};
