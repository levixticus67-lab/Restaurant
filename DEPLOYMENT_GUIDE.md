# 🍽️ Saveur Restaurant App — Complete Deployment Guide

This guide takes you from zero to a fully live, production restaurant website in under an hour.

---

## 📋 Table of Contents

1. [What You're Building](#what-youre-building)
2. [Step 1: Get Your Firebase Credentials](#step-1-get-your-firebase-credentials)
3. [Step 2: Set Up Cloudinary](#step-2-set-up-cloudinary)
4. [Step 3: Push to GitHub](#step-3-push-to-github)
5. [Step 4: Set Up GitHub Secrets](#step-4-set-up-github-secrets)
6. [Step 5: Deploy Frontend to Firebase Hosting](#step-5-deploy-frontend-to-firebase-hosting)
7. [Step 6: Deploy API to Render](#step-6-deploy-api-to-render)
8. [Step 7: Connect a Custom Domain (Optional)](#step-7-connect-a-custom-domain-optional)
9. [Step 8: Create Your Admin Account](#step-8-create-your-admin-account)
10. [Step 9: Add Your First Meals](#step-9-add-your-first-meals)
11. [How GitHub Auto-Deploy Works](#how-github-auto-deploy-works)
12. [Troubleshooting](#troubleshooting)

---

## What You're Building

| Layer         | Technology          | Host          |
|---------------|---------------------|---------------|
| Frontend      | React + Vite        | Firebase Hosting (free) |
| Database      | Firestore (NoSQL)   | Firebase (free tier) |
| Auth          | Firebase Auth       | Firebase (free tier) |
| Image Uploads | Cloudinary          | Cloudinary (free tier) |
| API Server    | Express.js          | Render (free tier) |
| CI/CD         | GitHub Actions      | GitHub (free) |

---

## Step 1: Get Your Firebase Credentials

### 1.1 Create a Firebase Project

1. Go to **[firebase.google.com](https://firebase.google.com)** → Click **Get started**
2. Sign in with your Google account
3. Click **Add project**
4. Enter a project name (e.g. `saveur-restaurant`) → Click **Continue**
5. Disable Google Analytics for now (you can add it later) → Click **Create project**
6. Wait ~30 seconds → Click **Continue**

### 1.2 Enable Firestore Database

1. In the left sidebar → Click **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** → Click **Next**
   > ⚠️ Test mode allows anyone to read/write for 30 days. You'll secure this in a later step.
4. Choose a location closest to your users (e.g. `us-central` for USA) → Click **Done**

### 1.3 Enable Authentication

1. In the left sidebar → Click **Authentication**
2. Click **Get started**
3. Under **Sign-in providers** → Click **Email/Password**
4. Toggle **Enable** → Click **Save**

### 1.4 Register a Web App and Get Config Keys

1. Go to **Project Overview** (top of left sidebar, click the ⚙️ gear icon → Project settings)
2. Scroll down to **Your apps** → Click **</>** (Web icon)
3. Enter an app nickname (e.g. `restaurant-web`) → Click **Register app**
4. **COPY the firebaseConfig object** — you'll need these exact values:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",              ← VITE_FIREBASE_API_KEY
  authDomain: "your-project.firebaseapp.com",  ← VITE_FIREBASE_AUTH_DOMAIN
  projectId: "your-project-id",     ← VITE_FIREBASE_PROJECT_ID
  storageBucket: "your-project.appspot.com",   ← VITE_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789",   ← VITE_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123:web:abc123"         ← VITE_FIREBASE_APP_ID
};
```

5. Click **Continue to console**

### 1.5 Secure Firestore Rules (After Testing)

Once your app is working, replace your Firestore rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anyone can read meals
    match /meals/{mealId} {
      allow read: if true;
      // Only authenticated admins can write
      allow write: if request.auth != null;
    }
  }
}
```

Go to **Firestore → Rules** tab, paste the above, and click **Publish**.

---

## Step 2: Set Up Cloudinary

Cloudinary handles all your food photo uploads.

### 2.1 Create a Cloudinary Account

1. Go to **[cloudinary.com](https://cloudinary.com)** → Click **Sign Up for Free**
2. Enter your details and verify your email
3. Log in → You'll see your **Dashboard**

### 2.2 Get Your Cloud Name

On your Dashboard, find your **Cloud name** at the top (e.g. `dq7xabcd1`). This is your `VITE_CLOUDINARY_CLOUD_NAME`.

### 2.3 Create an Unsigned Upload Preset

This allows the app to upload images directly without exposing your API secret.

1. Click the ⚙️ **Settings** (gear icon, top right)
2. Click the **Upload** tab
3. Scroll down to **Upload presets** → Click **Add upload preset**
4. Set:
   - **Preset name**: `restaurant_menu` (this is your `VITE_CLOUDINARY_UPLOAD_PRESET`)
   - **Signing mode**: Change from "Signed" to **Unsigned** ← Important!
   - **Folder**: `restaurant-menu` (optional, keeps things organized)
5. Click **Save**

---

## Step 3: Push to GitHub

### 3.1 Create a GitHub Repository

1. Go to **[github.com](https://github.com)** → Click **New repository**
2. Name it `saveur-restaurant`
3. Set to **Private** (recommended) → Click **Create repository**

### 3.2 Upload Your Project

If you downloaded the zip from Replit:

```bash
# Unzip the downloaded file
unzip saveur-restaurant.zip -d saveur-restaurant
cd saveur-restaurant

# Initialize git
git init
git add .
git commit -m "Initial commit: Saveur Restaurant App"

# Link to your GitHub repo (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/saveur-restaurant.git
git branch -M main
git push -u origin main
```

> **First time with git?** Download [GitHub Desktop](https://desktop.github.com) — it's much easier. Just drag your folder in, click "Publish repository".

### 3.3 Add a .gitignore

Make sure `.env` is in your `.gitignore` (it already is in this project). Never commit real credentials.

---

## Step 4: Set Up GitHub Secrets

GitHub Secrets let the auto-deploy workflow access your credentials securely.

### 4.1 Open Repository Secrets

1. On your GitHub repo → Click **Settings**
2. In the left sidebar → Click **Secrets and variables** → **Actions**
3. Click **New repository secret** for each secret below

### 4.2 Add All Required Secrets

Add these **one by one**:

| Secret Name | Where to Get It |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase config (Step 1.4) |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase config (Step 1.4) |
| `VITE_FIREBASE_PROJECT_ID` | Firebase config (Step 1.4) |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase config (Step 1.4) |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase config (Step 1.4) |
| `VITE_FIREBASE_APP_ID` | Firebase config (Step 1.4) |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary Dashboard |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary preset name (Step 2.3) |
| `FIREBASE_TOKEN` | See below ↓ |
| `RENDER_DEPLOY_HOOK_URL` | See Step 6 ↓ |

### 4.3 Get Your FIREBASE_TOKEN

This lets GitHub deploy to Firebase Hosting automatically.

```bash
# Install Firebase CLI (requires Node.js — get it at nodejs.org)
npm install -g firebase-tools

# Log in and generate a token
firebase login:ci
```

Copy the long token that appears (starts with `1//...`) and save it as `FIREBASE_TOKEN` in GitHub Secrets.

---

## Step 5: Deploy Frontend to Firebase Hosting

### 5.1 Initialize Firebase in Your Project

In your project folder, run:

```bash
cd artifacts/restaurant
firebase init hosting
```

Prompts:
- **Use an existing project** → select your Firebase project
- **Public directory**: `dist/public`
- **Configure as single-page app**: **Yes**
- **Set up automatic builds with GitHub**: **No** (we use our own workflow)
- **Overwrite index.html**: **No**

### 5.2 First Manual Deploy

```bash
# From inside artifacts/restaurant/
export PORT=3000
export BASE_PATH=/
pnpm run build

# Then deploy
firebase deploy --only hosting
```

Your app is now live at: `https://your-project-id.web.app` 🎉

### 5.3 All Future Deploys are Automatic

Every `git push` to `main` will automatically:
1. Run typechecks
2. Build your app with your secrets injected
3. Deploy to Firebase Hosting

---

## Step 6: Deploy API to Render

The Express API server handles backend routes.

### 6.1 Create a Render Account

1. Go to **[render.com](https://render.com)** → **Get started for free**
2. Sign up with GitHub (easiest — gives Render access to your repo)

### 6.2 Create a Web Service

1. Dashboard → Click **New** → **Web Service**
2. Connect your `saveur-restaurant` GitHub repo
3. Configure:
   - **Name**: `saveur-api`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install -g pnpm && pnpm install && pnpm --filter @workspace/api-server run build`
   - **Start Command**: `node artifacts/api-server/dist/index.mjs`
   - **Instance Type**: Free

4. Under **Environment Variables**, add:
   - `PORT` = `10000` (Render assigns this, but set it anyway)
   - `NODE_ENV` = `production`
   - `SESSION_SECRET` = (generate a random 32-char string)

5. Click **Create Web Service**

### 6.3 Get Your Deploy Hook URL

1. In your Render service → Click **Settings**
2. Scroll down to **Deploy** section → Find **Deploy Hook**
3. Click **Generate Deploy Hook**
4. Copy the URL and save it as `RENDER_DEPLOY_HOOK_URL` in GitHub Secrets

Now every `git push` to `main` also redeploys your API! ✅

---

## Step 7: Connect a Custom Domain (Optional)

### Firebase Hosting (Frontend)

1. Firebase Console → **Hosting** → **Add custom domain**
2. Enter your domain (e.g. `www.saveur.restaurant`)
3. Firebase gives you two DNS records (type: A or CNAME)
4. Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
5. Add those DNS records → Wait up to 24 hours for propagation
6. Firebase auto-provisions your SSL certificate (HTTPS) for free!

### Render (API)

1. Render service → **Settings** → **Custom Domains**
2. Add `api.saveur.restaurant`
3. Add the CNAME record at your registrar

---

## Step 8: Create Your Admin Account

Your admin portal is at `/admin` (or `/login` to sign in).

### Create an Admin User in Firebase

1. Firebase Console → **Authentication** → **Users**
2. Click **Add user**
3. Enter your email and a strong password → Click **Add user**
4. Go to your live site → Navigate to `/login`
5. Sign in with those credentials
6. You're now in the Admin Portal — you can add, edit, and delete meals!

---

## Step 9: Add Your First Meals

Once logged in to the Admin Portal:

1. Click **Add Meal**
2. Fill in:
   - **Meal Name** (e.g. "Signature Burger")
   - **Price** (e.g. `18.99`)
   - **Category** (Burgers, Mains, Starters, etc.)
   - **Description** (be descriptive — it shows in the meal popup)
   - **Prep Time** and **Calories** (optional)
   - **Ingredients** (comma-separated)
3. **Upload a photo**:
   - Click "Upload via Cloudinary" → Pick a photo from your device
   - OR paste a URL directly
4. Toggle **Available** and **Featured** as needed
5. Click **Add Meal**

Your meal immediately appears on the public menu — no refresh needed (Firestore is real-time)!

---

## How GitHub Auto-Deploy Works

```
You make changes locally
         ↓
git add . && git commit -m "Update menu layout"
         ↓
git push origin main
         ↓
GitHub Actions triggers automatically:
  1. ✅ Typecheck (catches TypeScript errors)
  2. 🔨 Build frontend (injects your Firebase/Cloudinary secrets)
  3. 🚀 Deploy to Firebase Hosting
  4. 🔨 Build API server
  5. 🚀 Trigger Render redeploy
         ↓
Your live site updates in ~3-4 minutes!
```

You can watch the deploy progress at:
`github.com/YOUR_USERNAME/saveur-restaurant/actions`

---

## Troubleshooting

### "Firebase not configured" banner showing
→ Your `VITE_FIREBASE_*` env vars are missing. Check GitHub Secrets (for production) or your local `.env` file.

### Images not uploading
→ Make sure your Cloudinary upload preset is set to **Unsigned** (not Signed).

### Admin login says "Invalid password"
→ Create the user in Firebase Console → Authentication → Users first.

### Build failing in GitHub Actions
→ Check the Actions tab on GitHub. Click the failed step to see the error log. Common causes: missing secrets, TypeScript errors.

### Firestore permission denied after 30 days
→ Your test-mode rules expired. Update your Firestore Security Rules (see Step 1.5).

### Render API is slow on first request
→ This is normal — Render's free tier "spins down" after inactivity. The first request after ~15 min takes 30s to wake up. Upgrade to a paid plan ($7/mo) to avoid this.

---

## 📁 Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | ✅ | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Firebase messaging sender |
| `VITE_FIREBASE_APP_ID` | ✅ | Firebase app ID |
| `VITE_CLOUDINARY_CLOUD_NAME` | ✅ | Your Cloudinary cloud name |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | ✅ | Unsigned upload preset name |
| `FIREBASE_TOKEN` | ✅ (CI) | Token for Firebase CLI deploy |
| `RENDER_DEPLOY_HOOK_URL` | ✅ (CI) | Render auto-deploy webhook |

---

*Built with ❤️ — Saveur Restaurant App*
