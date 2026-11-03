# SILIP — database setup (Supabase)

The app works without a database (local-only mode). Follow these steps to turn on
token-checked stamps, cross-device sync and the admin dashboard. Free tier is enough.

## 1. Create the project
1. Go to supabase.com → New project. Pick the region closest to your visitors (Singapore is nearest to the Philippines).
2. Wait for it to finish provisioning.

## 2. Auth settings (Authentication)
- **Sign In / Providers → Allow anonymous sign-ins: ON.** Visitors get an invisible account, no signup form.
- **Sign In / Providers → Email: ON** (default). Used for account creation, password login, and the admin login.
- **Confirm email: OFF.** Save changes. Signup and login use email/password with no email code. Phone authentication can remain OFF.
- **URL Configuration:** set *Site URL* to your deployed address (e.g. `https://silip.netlify.app`)
  and add `https://silip.netlify.app/**` under *Redirect URLs*. Use your actual deployed address.
- SMTP and email templates are not required for account creation or login.

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
2. Open `https://YOUR-SITE/admin.html`, log in with an account created in SILIP using its email and password.
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
Guests keep their name, age, and photo on their device. Creating an email/password account
stores these details in a private `profiles` row so they can be restored on another device.
The email address and password are managed by Supabase Auth. Profile rows do
not contain editable email addresses or passwords. RLS allows only the signed-in
owner to read or change their profile. Stamp ownership remains protected by the existing policies.

## Email/password accounts (no verification)

1. Open Supabase **Authentication > Sign In / Providers**.
2. Keep **Allow new users to sign up**, **Allow anonymous sign-ins**, and **Email**
   enabled. Turn **Confirm email OFF** and press **Save changes**.
3. In **SQL Editor**, run the entire **supabase/email-accounts.sql** file to update an
   existing database. Existing profiles and stamps are retained. New projects can
   run **supabase/schema.sql**, which contains the same account policies.
4. After the GitHub deployment finishes, reload SILIP. Create an account with a
   name, optional age, email, password, and password confirmation.
5. Signup opens the unlocked passport immediately. Log out and log in with the
   email/password to check that the saved name and stamps return.

Signup uses updateUser({ email, password }) to upgrade the current guest account.
Supabase's automatic confirmation setting must be enabled by turning Confirm email
OFF. Keeping the same user ID preserves that guest's server-validated stamps.
Login uses signInWithPassword. There are no OTP requests or confirmation pages,
including in the admin dashboard and the sync menu. Old #verify-account links
return to the passport.

Passwords are handled only by Supabase Auth and never saved in profile rows or
localStorage. Profiles require a real signed-in email account, and RLS restricts
access to the row owned by auth.uid(). Guests keep a blurred, locked passport
until they create an account or log in. Account signup and login need no SMTP.
Signed-in users can change their password from My account. Email-code password
recovery has been removed; an administrator must help users who lose access.
Existing passwordless users need an administrator to set a password before login.
Existing accounts still marked unconfirmed in Auth may also need administrator
help; the app does not grant itself permission to modify other Auth users.

A successful signup saves the profile before opening the passport. If saving
fails, the form keeps the entered name and age for retry using Save details.
Logging into an existing account restores only that account's saved details and
stamps. Logging out clears the displayed profile and starts a fresh guest.
Saved sessions are checked against the Auth server; deleted users recover once
to a fresh guest. Connection failures do not discard the current session.

Official references: [Password authentication](https://supabase.com/docs/guides/auth/passwords),
[Anonymous account upgrades](https://supabase.com/docs/guides/auth/auth-anonymous).

## Test checklist
- [ ] Open a printed code → stamp collected, shows as "Synced".
- [ ] Edit one letter of `k` in the URL → "QR code isn't valid".
- [ ] Airplane mode, scan → "waiting to verify"; reconnect → status becomes "Synced".
- [ ] Log in with email/password on a second device → the same saved profile and stamps appear.
- [ ] `admin.html` shows the scan; *New token* makes the old printed code stop working.
- [ ] Open the site in a private window, collect 4 stamps → "Completed passports" goes up by one.
- [ ] Create account → profile saves and passport opens without an OTP or email link.
- [ ] Log out → the displayed name, photo, and stamps clear; log back in → saved details return.
- [ ] Sign in on a second device → the same private profile and verified stamps appear.
- [ ] Account A cannot read or update account B's `profiles` row through the API.

Local automated checks: `node --test tests/cloud.test.cjs` (mocked Supabase Auth).
Browser checks: run a server on `127.0.0.1:4173` and headless Chrome with CDP on
port 9224, then run `node tests/account-browser.cjs`. Those checks use an in-memory
service and never send email. They do not replace the live delivery/RLS checks above.
