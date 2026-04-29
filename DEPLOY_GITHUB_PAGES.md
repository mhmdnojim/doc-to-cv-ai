# Deploying a Lovable App to GitHub Pages

This guide walks through publishing a Lovable (Vite + React + Supabase/Lovable Cloud) app to **GitHub Pages**, including every error we hit and how to fix it.

---

## Overview

GitHub Pages serves static files. Since Lovable apps are built with Vite, we:
1. Build the app with GitHub Actions on every push to `main`.
2. Upload the built `dist/` folder as a Pages artifact.
3. Deploy it to `https://<username>.github.io/<repo-name>/`.

---

## Prerequisites

- Project connected to GitHub (Lovable → **Connectors → GitHub → Connect project**).
- Repository is **Public** (or you have a paid GitHub plan that allows Pages on private repos).
- In the GitHub repo: **Settings → Pages → Source = GitHub Actions**.

---

## Step 1 — Add the GitHub Actions workflow

Create `.github/workflows/static.yml`:

```yaml
name: Deploy static content to Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.VITE_SUPABASE_PUBLISHABLE_KEY }}
          VITE_SUPABASE_PROJECT_ID: ${{ secrets.VITE_SUPABASE_PROJECT_ID }}

      - name: Copy index.html to 404.html for SPA routing
        run: cp dist/index.html dist/404.html

      - name: Setup Pages
        uses: actions/configure-pages@v5
        with:
          enablement: true

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

Key bits:
- `enablement: true` — auto-enables Pages on the repo if not already on.
- The `cp index.html 404.html` trick — makes client-side routes (React Router) work on refresh / deep links.
- `env:` block — passes Supabase variables into the build.

---

## Step 2 — Add Repository Secrets

In GitHub: **Settings → Secrets and variables → Actions → New repository secret**.

Add these three (values come from your Lovable project's `.env`):

| Secret name | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | `https://<project-id>.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | The anon/publishable key |
| `VITE_SUPABASE_PROJECT_ID` | The project ref (e.g. `kpcfcyrrzdxlphcxepus`) |

> These are publishable values — safe to use in client-side builds, but they MUST be present at build time or the app will white-screen.

---

## Step 3 — Configure the Vite `base` path

GitHub Pages serves the app at `/<repo-name>/`, not `/`. Without this, all `/assets/*.js` requests 404.

In `vite.config.ts`:

```ts
export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/<repo-name>/" : "/",
  // ...rest of config
}));
```

Replace `<repo-name>` with your actual repository name (e.g. `/doc-to-cv-ai/`).

---

## Step 4 — Configure React Router basename

Without this, React Router still thinks the app starts at `/`, so every route shows the **404 / NotFound** page on Pages.

In `src/App.tsx`:

```tsx
<BrowserRouter basename={import.meta.env.BASE_URL}>
  {/* routes */}
</BrowserRouter>
```

`import.meta.env.BASE_URL` automatically equals whatever you set as `base` in `vite.config.ts`, so this works in both dev and production.

---

## Step 5 — Enable Pages in repo settings

1. **Settings → Pages**
2. **Source: GitHub Actions** (NOT "Deploy from a branch")
3. Save.

---

## Step 6 — Trigger the workflow

- Push any commit to `main`, **OR**
- Go to **Actions → Deploy static content to Pages → Run workflow**.

Your site will be live at:
```
https://<username>.github.io/<repo-name>/
```

---

## Errors we hit & how we fixed them

### ❌ Error 1: "A file with the same name already exists"
**When:** Trying to commit `static.yml` from Lovable a second time.
**Why:** The workflow file is already in the repo.
**Fix:** Just cancel the commit dialog — no action needed.

---

### ❌ Error 2: "Get Pages site failed" / "Not Found"
**When:** The workflow runs but the deploy step fails because Pages isn't enabled yet.
**Fix:** Add `with: enablement: true` to the `actions/configure-pages@v5` step (already in the workflow above), AND set **Settings → Pages → Source = GitHub Actions**.

---

### ❌ Error 3: White screen after deploy
**Symptoms:** Page loads but shows nothing. Console shows 404s for `/assets/index-xxxx.js`.
**Why:** Vite is generating asset URLs as `/assets/...` but they actually live at `/<repo-name>/assets/...`.
**Fix:** Set the Vite `base` (Step 3 above).

Secondary cause: missing Supabase env vars at build time → `createClient(undefined, undefined)` → app crashes silently.
**Fix:** Add the three repo secrets (Step 2).

---

### ❌ Error 4: 404 / NotFound page on every route
**Symptoms:** Site loads, assets load, but you only ever see the React "404 Oops! Page not found" component.
**Why:** React Router is matching against the full URL including `/<repo-name>/`, which doesn't match any route.
**Fix:** Set `basename={import.meta.env.BASE_URL}` on `<BrowserRouter>` (Step 4).

---

### ❌ Error 5: 404 on page refresh (real GitHub 404, not the React one)
**Symptoms:** App works from the home page, but refreshing on `/builder` gives GitHub's own 404 page.
**Why:** GitHub Pages doesn't know about client-side routes — it looks for an actual `/builder/index.html` file.
**Fix:** The workflow copies `index.html` → `404.html`. GitHub Pages serves `404.html` for unknown paths, which lets React Router take over.

---

## Quick checklist

- [ ] `.github/workflows/static.yml` committed
- [ ] Repo is Public (or paid plan)
- [ ] **Settings → Pages → Source = GitHub Actions**
- [ ] 3 repo secrets added (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`)
- [ ] `vite.config.ts` has `base: "/<repo-name>/"` in production
- [ ] `App.tsx` has `<BrowserRouter basename={import.meta.env.BASE_URL}>`
- [ ] Workflow ran green in **Actions** tab

---

## Notes

- **Lovable's own publish** (`*.lovable.app` URL) does NOT need any of these changes — it serves from `/` and handles SPA routing automatically. These steps are ONLY needed for GitHub Pages.
- **Edge functions / Supabase backend** continue to run on Lovable Cloud. GitHub Pages only hosts the static frontend; it talks to the same backend.
- If you later rename the repository, update both `vite.config.ts` (`base`) to match.
