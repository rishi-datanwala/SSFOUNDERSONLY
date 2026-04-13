# SmartSound — Neural Pacer

## 📁 Repository Structure
```
index.html          ← Your entire app — upload this to GitHub Pages
worker/
  worker.js         ← Cloudflare Worker for IP session limiting
  wrangler.toml     ← Worker config (paste your KV namespace ID here)
DEPLOY.md           ← Step-by-step guide to deploy the worker
README.md           ← This file
```

## 🚀 GitHub Pages (your app)
1. Upload everything in this folder to your GitHub repository
2. Go to Settings → Pages → set source to `main` branch, `/ (root)`
3. Your app is live at `https://yourusername.github.io/your-repo/`

## ⚡ Cloudflare Worker (IP session limiter)
Follow the instructions in `DEPLOY.md` — takes ~5 minutes, completely free.
Once deployed, open `index.html`, find this line:
```javascript
var SESSION_WORKER_URL = '';
```
Replace with your worker URL:
```javascript
var SESSION_WORKER_URL = 'https://smartsound-session-limiter.YOUR-SUBDOMAIN.workers.dev';
```
Then push to GitHub — done.

## 💳 Stripe
When you have your Stripe Payment Link, find this line in `index.html`:
```javascript
var STRIPE_PAYMENT_LINK = '';
```
Replace with your link:
```javascript
var STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/xxxxxxxxxx';
```
