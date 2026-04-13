# SmartSound Session Limiter — Deploy Guide
**Takes about 5 minutes. Everything is free.**

---

## Step 1 — Create a Cloudflare account
Go to https://cloudflare.com and sign up (free).

---

## Step 2 — Install Wrangler (Cloudflare CLI)
Open your terminal and run:
```bash
npm install -g wrangler
```

---

## Step 3 — Log in to Cloudflare
```bash
wrangler login
```
This opens a browser window. Click "Allow".

---

## Step 4 — Create the KV namespace
```bash
wrangler kv:namespace create "SESSION_LIMIT"
```
This prints something like:
```
{ binding = "SESSION_LIMIT", id = "abc123def456..." }
```
**Copy the ID** (the long string after "id =").

---

## Step 5 — Paste the KV namespace ID
Open `wrangler.toml` and replace:
```
id = "PASTE_YOUR_KV_NAMESPACE_ID_HERE"
```
with your actual ID, e.g.:
```
id = "abc123def456abc123def456abc123de"
```

---

## Step 6 — Deploy the worker
```bash
wrangler deploy
```
It will print your worker URL, something like:
```
https://smartsound-session-limiter.YOUR-SUBDOMAIN.workers.dev
```
**Copy this URL.**

---

## Step 7 — Add the URL to SmartSound
Open your SmartSound HTML file and find this line near the top of the `<script>`:
```javascript
var SESSION_WORKER_URL = 'YOUR_WORKER_URL_HERE';
```
Replace it with your actual worker URL:
```javascript
var SESSION_WORKER_URL = 'https://smartsound-session-limiter.YOUR-SUBDOMAIN.workers.dev';
```

---

## That's it!
Free users will now be limited to 1 session per day by IP address.
Premium users bypass the limit entirely.

The worker handles ~100,000 requests/day on Cloudflare's free tier.
IP addresses are SHA-256 hashed before storage — never stored raw.
