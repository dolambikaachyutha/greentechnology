# 🚀 Deployment Guide – SolarClean AI Platform

**SolarClean AI** is built with zero build step dependencies (native ES modules, HTML5, Vanilla CSS3, Three.js, Chart.js, and Open-Meteo REST API). It can be deployed in under 1 minute to any modern cloud hosting platform.

---

## Method 1: Vercel (Recommended - 1-Click Deployment)

1. **Initialize Git and Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Deploy SolarClean AI"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/solarclean-ai.git
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in.
   - Click **"Add New"** > **"Project"**.
   - Select your `solarclean-ai` GitHub repository.
   - Set **Framework Preset** to **Other** (Root directory `./`).
   - Click **"Deploy"**.

Your live URL will be ready at `https://solarclean-ai.vercel.app`.

---

## Method 2: Netlify Drop (Instant Drag-and-Drop, No Git Required)

1. Open [app.netlify.com/drop](https://app.netlify.com/drop) in your browser.
2. Drag and drop the entire project folder containing `index.html`, `css/`, `js/`.
3. Your site will be live instantly!

---

## Method 3: GitHub Pages (Free Hosting on GitHub)

1. Push your code to a public GitHub repository.
2. Go to your repository on GitHub > **Settings** > **Pages**.
3. Under **Build and deployment**:
   - **Source**: Deploy from a branch
   - **Branch**: `main` / `/ (root)`
4. Click **Save**. Site will be published at `https://YOUR_USERNAME.github.io/solarclean-ai/`.

---

## Method 4: Render / VPS (Python Web Server)

To deploy using Python on [render.com](https://render.com) or a Linux VPS:

1. Create a file named `Procfile` in the root folder with content:
   ```txt
   web: python -m http.server $PORT
   ```
2. Connect your repo to Render Web Service.
3. Set **Start Command** to `python -m http.server $PORT`.
