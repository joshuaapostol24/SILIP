# SILIP · Digital Heritage Passport (PWA)

Scan QR codes at the heritage sites of Malolos, Bulacan, and collect digital stamps in a personal passport.

## Run locally
    python3 -m http.server 8000   # then open http://localhost:8000

## Deploy (HTTPS required for install, offline and camera)
For Vercel, import this GitHub repository. The included `vercel.json` prepares and
publishes `deploy/silip` automatically with demo stamp collection disabled.
Keep Root Directory set to the repository root and Framework Preset set to Other.

For a manual upload to Netlify or another static host, run:

    node scripts/prepare-deploy.cjs

Upload the generated `deploy/silip` folder. Add the deployed URL to Supabase's
Authentication > URL Configuration (Site URL and allowed Redirect URLs).

## QR codes
- Local-only mode: `/qr.html` prints plain codes (`/?stamp=<site-id>`).
- With the database on: use the **QR codes** tab in `/admin.html` (codes carry a secret and can be rotated).

## Photos
The home screen uses `assets/heritage-collage.png`; the thank-you screen uses
`assets/thanks.jpg`. The supplied stamp images are stored in `assets/stamp-*.png`.

## Stack
HTML, CSS, vanilla JavaScript, Service Worker, Web App Manifest, SVG, Canvas API,
MediaDevices / BarcodeDetector, jsQR, qrcode-generator, Web Share API, localStorage, Supabase (Postgres, Row Level Security, anonymous auth).

## Database (optional)
See `SETUP.md`. Schema: `supabase/schema.sql`. Admin dashboard: `/admin.html`.

## Accounts
Use **Log in / Sign up** for email/password accounts and saved profile details.
Signup opens the passport immediately; login uses email and password. No OTP or
email link is needed. Turn **Confirm email OFF** in Supabase Authentication and
run **supabase/email-accounts.sql** for an existing database. See SETUP.md.
With blank config.js credentials, guest mode still works.

## Interface
The parchment and navy theme uses locally bundled Playfair Display, Inter,
Dancing Script, and Great Vibes fonts; their open-source licenses are in fonts/.
The PWA caches the fonts for offline use. Persistent bottom navigation connects
Home, Heritage sites, Scan QR, and Passport in both supported languages.
Browser checks cover 320, 390, 768, 1024, and 1440px widths, password visibility,
account isolation, passport access, and stamp map links.
