# Deployment

## 0. Before deploying: get a trained model into the repo
Render builds from Git, and the model must be on the server. Choose one:
- **Commit the model** (recommended; the file is about 22 MB, under GitHub's 100 MB limit): after training, `backend/models/mobilenetv2_waste.keras`, `class_indices.json`, `run_info.json` and `evaluation_report.json` are allowed by `.gitignore`. `git add -f` is not needed.
- **Or** upload the `.keras` file to a GitHub Release and set `MODEL_URL` (https only) and optionally `MODEL_SHA256` on Render; the backend downloads it at startup.

## 1. GitHub
```powershell
cd path\to\ecovision-ai
git init
git add .
git status          # check: no .env, kaggle.json, dataset\ or node_modules\ listed
git commit -m "EcoVision AI"
git branch -M main
git remote add origin https://github.com/YOUR-USER/ecovision-ai.git
git push -u origin main
```

## 2. Render (backend) FIRST
1. Render dashboard > New > Web Service > connect the repo.
2. **Root Directory:** `backend`. **Runtime:** Python 3. **Build:** `pip install -r requirements.txt`. **Start:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. **Health check path:** `/health`.
3. Environment variables: `PYTHON_VERSION=3.12.3`, `CORS_ORIGINS=https://YOUR-APP.vercel.app` (fill in after step 3; no trailing slash).
   (Or use `render.yaml` as a Blueprint.)
4. Open `https://YOUR-SERVICE.onrender.com/health` and check `"model_loaded": true`.

### Resource reality check (read this)
- Render **Free** is 512 MB RAM / 0.1 CPU and spins down after 15 minutes idle; the first request after that takes about a minute (checked against Render's docs and pricing pages, October 2026; plans can change). Starter is also 512 MB; Standard is 2 GB.
- I measured about **700 MB** resident memory for this API with TensorFlow-CPU 2.21.0 loaded. That is **more than 512 MB**, so expect the free instance to be killed for running out of memory. Use a 2 GB instance (Standard) to run it reliably.
- If you must stay on a 512 MB plan, convert the trained model to ONNX or TFLite and serve it with `onnxruntime` / a TFLite runtime (much smaller than TensorFlow). **This is not implemented or tested in this repo**; it is the recommended next step.
- Do not rely on the free plan for guaranteed uptime. The frontend shows a "may take up to a minute" message for cold starts.

## 3. Vercel (frontend)
1. Vercel > Add New Project > import the repo. **Root Directory:** repository root (where `package.json` is). Framework: Vite. Build `npm run build`, output `dist` (also set in `vercel.json`, which also adds SPA routing).
2. Environment variable: `VITE_API_BASE_URL` = your real Render URL, e.g. `https://ecovision-ai-backend.onrender.com` (**the value in `.env.example` is only a placeholder**). It is baked in at build time, so redeploy after changing it.
3. Copy the Vercel URL into Render's `CORS_ORIGINS`, then redeploy/restart the backend.

## Environment variable checklist
| Where | Name | Value |
|---|---|---|
| Vercel | `VITE_API_BASE_URL` | Render service URL |
| Render | `CORS_ORIGINS` | Vercel URL (comma-separate multiple) |
| Render | `PYTHON_VERSION` | `3.12.3` |
| Render | `MODEL_URL`, `MODEL_SHA256` | optional |
| Render | `UNCERTAINTY_THRESHOLD`, `MAX_IMAGE_SIZE_MB` | optional (defaults 0.55, 10) |
No secrets are needed by this app. Never commit `.env*` (except `.env.example`) or `kaggle.json`.

## Troubleshooting
- Browser console "CORS" error: `CORS_ORIGINS` must exactly equal the page origin (scheme + host, no trailing slash).
- Analyze says "Model unavailable": the model file is not on the server; see section 0 and `/health`.
- Render logs show "Killed"/restarts: out of memory, see the resource check above.
