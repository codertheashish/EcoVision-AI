# Dataset

**Used:** "Garbage Classification" on Kaggle: https://www.kaggle.com/datasets/asdasdasasdas/garbage-classification
This is a re-upload of **TrashNet** (Gary Thung & Mindy Yang, Stanford, 2016). 6 classes: cardboard, glass, metal, paper, plastic, trash.

## What was verified (and what was not)
| Item | Status |
|---|---|
| Kaggle slug exists, 6 classes, 2527 images | Confirmed via a public notebook that downloads it (an 82 MB zip). I could not open Kaggle itself from my environment. |
| Image counts | **Measured** on the upstream TrashNet `dataset-resized.zip` from GitHub: cardboard 403, glass 501, metal 410, paper 594, plastic 482, trash 137 = 2527. Your Kaggle copy should match; `train.py` prints the counts it actually finds. |
| Exact duplicate images | Measured on the upstream copy: **3** byte-identical files (removed automatically by `train.py` before splitting). Near-duplicates are not detected. |
| License | The upstream TrashNet repository is **MIT** (LICENSE file read). The Kaggle page's own license field was **not verified**; check it before redistributing the data. The earlier "CC0" claim in this project was unverified and has been removed. |
| Class imbalance | `trash` is only about 5% of the images. `train.py` uses class weights computed from the training split. |

## Download (Windows)
Put the images so that the 6 class folders sit under `backend\dataset\`:

**Manual:** open the Kaggle link while logged in, click Download, extract into `backend\dataset\`. The zip is often nested, e.g. `dataset\Garbage classification\Garbage classification\cardboard\...`. The training script searches for the folder containing the 6 class folders, so nesting is fine.

**Kaggle CLI (optional):**
1. Kaggle > Settings > "Create New Token" downloads `kaggle.json`. Put it in `C:\Users\<you>\.kaggle\kaggle.json`. **Never commit it.**
2. ```powershell
   pip install kaggle
   cd backend
   kaggle datasets download -d asdasdasasdas/garbage-classification -p dataset --unzip
   ```

**Alternative source without an account:** the original TrashNet repo https://github.com/garythung/trashnet contains `data/dataset-resized.zip` (same 6 classes). Extract it and pass `--data-dir` to that folder.

## Splitting
`train.py` removes exact duplicates, then makes a **stratified 70/15/15** split of file paths with a fixed seed and saves it to `models/split_manifest.json`. `evaluate.py` reads the same manifest, so the test images are never seen in training. Test images are also never used for model selection (the validation split does that).
The dataset images are **not** committed to Git (`backend/dataset/` is ignored).
