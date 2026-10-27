"""Evaluate a saved model on the held-out TEST split recorded in models/split_manifest.json.

    python training/evaluate.py
"""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import numpy as np  # noqa: E402
from sklearn.metrics import classification_report, confusion_matrix  # noqa: E402

from data_utils import load_manifest, load_split  # noqa: E402


def evaluate_model(model, manifest, output_json: str, batch_size: int = 32, data_dir: str = None):
    x, y_true = load_split(manifest, "test", data_dir)
    probs = model.predict(x, batch_size=batch_size, verbose=0)
    y_pred = np.argmax(probs, axis=1)
    names = manifest["class_names"]
    labels = list(range(len(names)))

    report = classification_report(y_true, y_pred, labels=labels, target_names=names,
                                   output_dict=True, zero_division=0)
    cm = confusion_matrix(y_true, y_pred, labels=labels)
    print(classification_report(y_true, y_pred, labels=labels, target_names=names, zero_division=0))
    print("Confusion matrix (rows = true, columns = predicted):")
    print(cm)

    result = {
        "split": "test",
        "num_test_images": int(len(y_true)),
        "accuracy": float(report["accuracy"]),
        "macro_precision": float(report["macro avg"]["precision"]),
        "macro_recall": float(report["macro avg"]["recall"]),
        "macro_f1": float(report["macro avg"]["f1-score"]),
        "per_class": {n: {k: float(report[n][k]) for k in ("precision", "recall", "f1-score")}
                      | {"support": int(report[n]["support"])} for n in names},
        "classes": names,
        "confusion_matrix": cm.tolist(),
    }
    Path(output_json).parent.mkdir(parents=True, exist_ok=True)
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)
    print(f"Saved: {output_json}")
    return result


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--model-path", default="models/mobilenetv2_waste.keras")
    p.add_argument("--manifest", default="models/split_manifest.json")
    p.add_argument("--data-dir", default=None, help="Override dataset root stored in the manifest")
    p.add_argument("--output-json", default="models/evaluation_report.json")
    p.add_argument("--batch-size", type=int, default=32)
    a = p.parse_args()
    if not Path(a.model_path).exists():
        sys.exit(f"Model '{a.model_path}' not found. Train first: python training/train.py")
    import tensorflow as tf
    evaluate_model(tf.keras.models.load_model(a.model_path, compile=False),
                   load_manifest(a.manifest), a.output_json, a.batch_size, a.data_dir)


if __name__ == "__main__":
    main()
