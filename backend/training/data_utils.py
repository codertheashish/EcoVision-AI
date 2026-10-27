"""Dataset discovery, de-duplication and a reproducible stratified train/val/test split.

Why not image_dataset_from_directory(validation_split=...)?  Its split depends on shuffle
settings, so train.py and evaluate.py could silently disagree and the "test" images could
overlap the training images. Here the split is computed ONCE on file paths, saved to
models/split_manifest.json, and every script reads that same file.
"""
import hashlib
import json
import os
import sys
from collections import Counter
from pathlib import Path
from typing import Dict, List, Tuple

import numpy as np
from sklearn.model_selection import train_test_split

# Make `app.ml.preprocessing` importable when running `python training/train.py` from backend/
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.ml.preprocessing import path_to_array  # noqa: E402

IMAGE_EXTS = {".jpg", ".jpeg", ".png"}
EXPECTED_CLASSES = ["cardboard", "glass", "metal", "paper", "plastic", "trash"]


def find_dataset_root(data_dir: str) -> Path:
    """Kaggle zips are often nested (Garbage classification/Garbage classification/<classes>).
    Walk down until a folder containing the class sub-folders is found."""
    root = Path(data_dir)
    if not root.exists():
        raise FileNotFoundError(f"Dataset folder '{data_dir}' not found. See docs/DATASET.md.")
    for candidate in [root, *sorted(p for p in root.rglob("*") if p.is_dir())]:
        subdirs = {p.name.lower() for p in candidate.iterdir() if p.is_dir()}
        if set(EXPECTED_CLASSES).issubset(subdirs):
            return candidate
    raise FileNotFoundError(
        f"No folder with the sub-folders {EXPECTED_CLASSES} found under '{data_dir}'."
    )


def collect_files(root: Path) -> Tuple[List[str], List[int], List[str]]:
    class_names = sorted(EXPECTED_CLASSES)
    paths, labels = [], []
    for idx, name in enumerate(class_names):
        folder = next(p for p in root.iterdir() if p.is_dir() and p.name.lower() == name)
        for f in sorted(folder.iterdir()):
            if f.suffix.lower() in IMAGE_EXTS:
                paths.append(str(f))
                labels.append(idx)
    return paths, labels, class_names


def drop_exact_duplicates(paths: List[str], labels: List[int]) -> Tuple[List[str], List[int], int]:
    """Remove byte-identical files (same SHA-256) so a copy cannot land in both train and test."""
    seen, kept_p, kept_l, dropped = set(), [], [], 0
    for p, l in zip(paths, labels):
        digest = hashlib.sha256(Path(p).read_bytes()).hexdigest()
        if digest in seen:
            dropped += 1
            continue
        seen.add(digest)
        kept_p.append(p)
        kept_l.append(l)
    return kept_p, kept_l, dropped


def make_manifest(data_dir: str, seed: int, out_path: str) -> Dict:
    root = find_dataset_root(data_dir)
    paths, labels, class_names = collect_files(root)
    raw_counts = Counter(labels)
    paths, labels, n_dups = drop_exact_duplicates(paths, labels)

    # 70 / 15 / 15, stratified by class
    p_train, p_tmp, l_train, l_tmp = train_test_split(
        paths, labels, test_size=0.30, stratify=labels, random_state=seed
    )
    p_val, p_test, l_val, l_test = train_test_split(
        p_tmp, l_tmp, test_size=0.50, stratify=l_tmp, random_state=seed
    )
    rel = lambda ps: [os.path.relpath(p, root) for p in ps]  # noqa: E731
    manifest = {
        "dataset_root": str(root),
        "seed": seed,
        "class_names": class_names,
        "raw_class_counts": {class_names[k]: v for k, v in sorted(raw_counts.items())},
        "exact_duplicates_removed": n_dups,
        "splits": {
            "train": {"files": rel(p_train), "labels": l_train},
            "val": {"files": rel(p_val), "labels": l_val},
            "test": {"files": rel(p_test), "labels": l_test},
        },
    }
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f)
    return manifest


def load_manifest(path: str) -> Dict:
    if not os.path.exists(path):
        raise FileNotFoundError(f"Split manifest '{path}' not found. Run training/train.py first.")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_split(manifest: Dict, split: str, data_dir: str = None) -> Tuple[np.ndarray, np.ndarray]:
    """Load one split into memory as (uint8 images, int labels) using the shared preprocessing."""
    root = Path(data_dir) if data_dir else Path(manifest["dataset_root"])
    entry = manifest["splits"][split]
    images = np.stack([path_to_array(str(root / f)) for f in entry["files"]]).astype("uint8")
    return images, np.array(entry["labels"], dtype="int32")
