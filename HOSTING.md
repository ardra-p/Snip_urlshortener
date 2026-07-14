# Hosting Guide

This project has two parts, so it needs two hosting steps:
1. Host the **backend** (Django) on **Render** (free tier works).
2. Host the **frontend** (static files) on **Netlify** (free tier works).

---

## 1. Put your code on GitHub

Both `backend/` and `frontend/` can live in the **same GitHub repo** — you'll
just point each hosting platform at the right subfolder.

```bash
cd project
git init
git add .
git commit -m "Initial commit: URL shortener"
```
Create a new repo on github.com, then:
```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

---

## 2. Host the backend on Render

1. Go to https://render.com and sign up / log in (GitHub login is easiest).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repo.
4. Fill in the settings:
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:**
     ```
     pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput
     ```
   - **Start Command:**
     ```
     gunicorn urlshortener.wsgi
     ```
5. Add an environment variable (under **Environment**):
   - `DJANGO_SECRET_KEY` → any long random string
   - `DJANGO_DEBUG` → `False`
6. Click **Create Web Service**. Render will build and deploy it.
7. Once deployed, you'll get a URL like `https://your-app.onrender.com` —
   this is your **backend URL**.

Note: Render's free tier spins down after inactivity, so the first request
after a while may take ~30–60 seconds to wake up. That's normal.

---

## 3. Host the frontend on Netlify

1. Go to https://app.netlify.com and sign up / log in.
2. Click **Add new site** → **Import an existing project**.
3. Connect the same GitHub repo.
4. Set:
   - **Base directory:** `frontend`
   - **Build command:** leave blank (it's static HTML/CSS/JS, no build step)
   - **Publish directory:** `frontend`
5. Click **Deploy site**. You'll get a URL like
   `https://your-site.netlify.app` — this is your **frontend URL**.

*(GitHub Pages also works great for this since the frontend is fully static —
just enable Pages on the repo and set the source folder to `frontend`.)*

---

## 4. Connect them

1. Open your live frontend site.
2. In the **"Backend URL"** field at the bottom of the page, paste your
   Render backend URL (e.g. `https://your-app.onrender.com`).
3. It's saved automatically for next time (stored in your browser).
4. Try shortening a link — it should now work end-to-end.

---

## 5. (Optional) Lock things down for production

- In `backend/urlshortener/settings.py`, replace
  `ALLOWED_HOSTS = ["*"]` with your actual Render domain.
- Replace `CORS_ALLOW_ALL_ORIGINS = True` with
  `CORS_ALLOWED_ORIGINS = ["https://your-site.netlify.app"]`.
- Consider hard-coding the deployed backend URL as the default in
  `frontend/script.js` (`DEFAULT_API_BASE`) so users don't have to paste it
  in manually.

That's it — you now have a working, hosted full-stack URL shortener.
