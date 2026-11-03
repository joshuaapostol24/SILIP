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
Use **Log in / Sign up** for verified email accounts and saved profile details.
Email codes require Supabase Email auth and email OTP templates; follow the Email accounts
section in `SETUP.md`. With blank `config.js` credentials, guest mode still works.
