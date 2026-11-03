# SILIP — database setup (Supabase)

The app works without a database (local-only mode). Follow these steps to turn on
token-checked stamps, cross-device sync and the admin dashboard. Free tier is enough.

## 1. Create the project
1. Go to supabase.com → New project. Pick the region closest to your visitors (Singapore is nearest to the Philippines).
2. Wait for it to finish provisioning.

## 2. Auth settings (Authentication)
- **Sign In / Providers → Allow anonymous sign-ins: ON.** Visitors get an invisible account, no signup form.
- **Sign In / Providers → Email: ON** (default). Used for "Save my progress" and the admin login.
- **Confirm email: ON.** Phone authentication can remain OFF.
- **Allow manual identity linking: ON** so Create account can attach a verified email
  to the current guest account and retain that guest's server-verified stamps.
- **URL Configuration:** set *Site URL* to your deployed address (e.g. `https://silip.netlify.app`)
  and add `https://silip.netlify.app/**` under *Redirect URLs*. Magic links fail without this.
- Supabase's built-in email sender is rate-limited and meant for testing. Before a public launch,
  add a custom SMTP provider (Authentication → Emails → SMTP Settings).

## 3. Create the tables and functions
SQL Editor → New query → paste all of `supabase/schema.sql` → Run.
It is safe to run again later. Run it again if upgrading an existing installation to email accounts.
It creates: `sites`, `site_secrets`, `stamps`, `scan_log`, `admins`, `profiles`,
row-level security, and the functions `collect_stamp`, `admin_stats`, `admin_get_tokens`, `admin_rotate_token`.

## 4. Connect the app
Edit `config.js`:

    window.SILIP_CONFIG = {
      supabaseUrl: 'https://YOUR-PROJECT.supabase.co',
      supabaseKey: 'YOUR-ANON-OR-PUBLISHABLE-KEY',   // Project Settings → API
      demo: false                                     // hides "Simulate scan"
    };

Use only the public **anon / publishable** key. Never paste the `service_role` / secret key into any file in this folder.

## 5. Deploy, then make yourself admin
1. Deploy the folder (Netlify, Vercel, GitHub Pages…).
2. Open `https://YOUR-SITE/admin.html`, enter your email, open the link you receive.
3. The page will say access is denied and show one line of SQL containing your user id.
   Copy it into the SQL Editor and run it once. Reload `admin.html`.

## 6. Print the QR codes
`admin.html` → **QR codes** tab. Check the base URL, then print. Each code is
`https://YOUR-SITE/?stamp=<site>&k=<secret>`. Do **not** use `qr.html` once the database is on — its codes have no secret and will be rejected.

## How the checks work
- The secret `k` for each site lives only in the database. Visitors cannot read it; the browser sends it to
  `collect_stamp`, which verifies it and records the stamp. Stamps cannot be written any other way.
- 20 wrong codes in 10 minutes blocks that visitor for a while.
- No connection at the site? The stamp is kept on the phone, shown as "waiting to verify", and sent when back online.
  If the server later rejects it, it is removed.
- **Limits to be honest about:** anyone can photograph a printed QR code and share the link. Rotation (the *New token* button)
  kills a leaked code; checking "failed scans" and per-day scan spikes on the dashboard helps you spot abuse.

## Privacy
Guests keep their name, age, and photo on their device. Creating a verified email account
stores these details in a private `profiles` row so they can be restored on another device.
The email address and verification status are managed by Supabase Auth. Profile rows do
not contain editable email addresses or verification flags. RLS allows only the verified
owner to read or change their profile. Stamp ownership remains protected by the existing policies.

## Email accounts (Gmail supported)

Use **Log in / Sign up**. Create account takes a name, optional age, and email address.
Log in takes the account's email and password and does not send an email code.
Create account also asks for a password and confirmation (at least 8 characters),
then verifies the email once before setting the password through Supabase Auth.
Gmail and other email providers are accepted. No phone number or Twilio account is needed.
The UI enforces a 60-second resend delay; Supabase also enforces server-side limits.

For a database that already ran the SMS version of the schema, run
`supabase/email-accounts.sql` in SQL Editor. This replaces phone-only profile policies
with verified-email policies without deleting profiles or stamps. New installations
can run the full `supabase/schema.sql` instead.

In Supabase Authentication:

1. Keep Email, Confirm email, anonymous sign-ins, and manual linking enabled.
2. Under Emails / Templates, open **Magic Link** and **Change Email Address**.
   Add `<p>Your SILIP verification code is: <strong>{{ .Token }}</strong></p>`
   to both templates and save. The complete suggested template is in
   `supabase/templates/email-code.html`. It retains a confirmation link so the
   existing admin magic-link login continues to work. Enter the numeric code in
   the SILIP form for account creation and login.
3. Keep the deployed site URL and allowed redirect URLs configured correctly.
4. For initial testing without SMTP, use the email belonging to a project team
   member. Supabase's default email sender only delivers to project team addresses
   and is heavily rate-limited. Configure custom SMTP for other users' Gmail addresses.
   SMTP credentials belong only in the Supabase dashboard, never in frontend files.

Signup links the guest via `updateUser({ email })` and verifies `email_change` OTPs.
Login uses `signInWithPassword`. Passwords are never saved in profile rows or
localStorage. Existing passwordless users can choose **Forgot or need a password?**:
this sends an existing-user email OTP (`shouldCreateUser: false`), verifies type
`email`, and then calls `updateUser({ password })` for the verified account.
Signed-in users can also choose **Set or change password** under My account.
Signup, recovery, and email verification still require working SMTP. Password
login does not bypass email confirmation or repair email delivery problems.
Auth failures now display the provider message and error code as plain text.
Saved sessions are checked against Supabase Auth on startup. If the user or
refresh token has been deleted, the app signs out only this browser and creates
a fresh guest session. Signup also retries once if its guest was deleted after
startup. Network and SMTP errors do not trigger this reset.

Signing up upgrades the guest identity in place. Logging into an existing account restores
that account's saved profile and verified stamps; it does not import another account's stamps.
Log out clears the displayed profile and starts a new guest passport on this device.
Passport edits save to the verified account; offline edits remain local and retry when online.
The passport view is blurred and locked for guests. Its Create account and Log in
buttons open email authentication directly; successful verification returns to the
unlocked passport with the account's saved name and collected stamps. Guests can
still explore heritage sites and collect stamps before registering.

Official setup references: [Email OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless),
[Email delivery / SMTP](https://supabase.com/docs/guides/auth/auth-smtp),
[Anonymous identity linking](https://supabase.com/docs/guides/auth/auth-anonymous).

## Test checklist
- [ ] Open a printed code → stamp collected, shows as "Synced".
- [ ] Edit one letter of `k` in the URL → "QR code isn't valid".
- [ ] Airplane mode, scan → "waiting to verify"; reconnect → status becomes "Synced".
- [ ] Save progress with your email, open the link on a second device → same stamps appear.
- [ ] `admin.html` shows the scan; *New token* makes the old printed code stop working.
- [ ] Open the site in a private window, collect 4 stamps → "Completed passports" goes up by one.
- [ ] Create account with a test email → wrong OTP rejected; correct OTP saves the profile.
- [ ] Log out → the displayed name, photo, and stamps clear; log back in → saved details return.
- [ ] Sign in on a second device → the same private profile and verified stamps appear.
- [ ] Account A cannot read or update account B's `profiles` row through the API.

Local automated checks: `node --test tests/cloud.test.cjs` (mocked Supabase Auth).
Browser checks: run a server on `127.0.0.1:4173` and headless Chrome with CDP on
port 9224, then run `node tests/account-browser.cjs`. Those checks use an in-memory
service and never send email. They do not replace the live delivery/RLS checks above.
