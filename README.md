# EcoVision AI

Waste image classification web app: **React + Vite + TypeScript + Tailwind** frontend (Vercel) and a **FastAPI** backend (Render) that runs a **MobileNetV2** (TensorFlow/Keras) model trained on the 6-class TrashNet garbage dataset (cardboard, glass, metal, paper, plastic, trash).

> **Status:** the code is complete and tested, but **no trained model is included in this repository**. Until you train one (steps below), the API starts, reports `model_loaded: false` and `/api/v1/predict` returns HTTP 503. There are no fake or heuristic predictions. The public website shows no accuracy figures; measured metrics live in the evaluation report after you train.

```
ecovision-ai/
├── src/                 React app (pages, components, API service)
├── backend/
│   ├── app/             FastAPI app (api, core config, ml preprocessing, services)
│   ├── training/        train.py, evaluate.py, predict_image.py, data_utils.py
│   ├── models/          class_indices.json (+ trained model after training)
│   └── tests/           pytest suite
├── docs/                DATASET.md, MODEL.md, DEPLOYMENT.md
├── render.yaml          optional Render blueprint
└── vercel.json          Vercel config (SPA routing)
```

## Local development on Windows (PowerShell)

Tested versions: Node 22, Python 3.12, TensorFlow 2.21.0. Use Python **3.12** (the version everything here was tested with).

### 1. Frontend (run from the project root, where `package.json` is)
```powershell
npm install
copy .env.example .env.local      # then edit: VITE_API_BASE_URL=http://127.0.0.1:8000
npm run dev                       # open http://127.0.0.1:3000
npm run build                     # production build check
```

### 2. Backend (run from the `backend` folder)
```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Open **http://127.0.0.1:8000/health** and **http://127.0.0.1:8000/docs**.
Do **not** open `http://0.0.0.0:8000`: `0.0.0.0` means "listen on all interfaces", it is not an address a browser can visit. That is why it failed before.

If PowerShell blocks `Activate.ps1`: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

### 3. Get the dataset, then train (one time, in `backend/`)
See [docs/DATASET.md](docs/DATASET.md) to download the data into `backend/dataset/`.
```powershell
pip install -r training/requirements-training.txt
python training/train.py --data-dir "dataset/Garbage classification"
```
This writes `models/mobilenetv2_waste.keras`, `class_indices.json`, `run_info.json`, `split_manifest.json` and `evaluation_report.json` (accuracy, per-class precision/recall/F1, confusion matrix on a held-out test split). Training needs internet the first time to download ImageNet weights. On a CPU it takes a while; Google Colab is a fine alternative (copy the `models/` output back).

```powershell
python training/evaluate.py                                   # re-run evaluation on the saved test split
python training/predict_image.py --image path\to\photo.jpg    # classify one image
pytest                                                        # backend tests
```
Restart the backend; `/health` should now show `"model_loaded": true`. Your measured test metrics are in `backend/models/evaluation_report.json` (also exposed by the API at `/api/v1/model-info`; the public website does not display them).

## Tests
- Frontend: `npm run build` runs `tsc --noEmit` (type check) then the Vite build. There are no frontend unit tests.
- Backend: `cd backend && pytest`. Tests of the prediction endpoint use a stub model to test the API logic only; one test uses the real model if a model file exists.

## Deploying
See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) (GitHub, Render, Vercel, environment variables, free-tier limits).

## Known limitations
- Only 6 classes; there is no organic/food, e-waste or battery class. The website says these are not covered.
- TrashNet photos are mostly single objects on plain backgrounds. Accuracy on cluttered real-world photos will be lower than on the test split.
- Recycling advice is general; local rules differ.
- Full TensorFlow needs more than 512 MB RAM (measured, see DEPLOYMENT.md), so Render's free plan is likely to run out of memory.
