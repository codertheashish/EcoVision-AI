"""Train MobileNetV2 on the 6-class garbage dataset (transfer learning + fine-tuning).

Run from the backend/ folder:
    python training/train.py --data-dir "dataset/Garbage classification"
"""
import argparse
import json
import os
import platform
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import numpy as np  # noqa: E402
import tensorflow as tf  # noqa: E402
from sklearn.utils.class_weight import compute_class_weight  # noqa: E402
from tensorflow.keras import callbacks, layers, models, optimizers  # noqa: E402

from data_utils import load_manifest, load_split, make_manifest  # noqa: E402
from evaluate import evaluate_model  # noqa: E402

IMG = 224


def parse_args():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--data-dir", default="dataset/Garbage classification")
    p.add_argument("--output-dir", default="models")
    p.add_argument("--batch-size", type=int, default=32)
    p.add_argument("--epochs-head", type=int, default=10)
    p.add_argument("--epochs-fine", type=int, default=10)
    p.add_argument("--seed", type=int, default=42)
    p.add_argument("--weights", choices=["imagenet", "none"], default="imagenet",
                   help="'none' = random init. ONLY for smoke-testing the code; the result is not a useful model.")
    return p.parse_args()


def build_model(num_classes: int, weights):
    """Preprocessing lives INSIDE the model: input is raw RGB 0..255, so the API, CLI and
    training all feed the same thing and scaling can never be applied twice."""
    inputs = layers.Input(shape=(IMG, IMG, 3), name="image_0_255")
    x = layers.RandomFlip("horizontal")(inputs)       # augmentation: active only in training
    x = layers.RandomRotation(0.1)(x)
    x = layers.RandomZoom(0.1)(x)
    x = layers.RandomContrast(0.1)(x)
    x = layers.Rescaling(1.0 / 127.5, offset=-1.0, name="scale_to_minus1_1")(x)  # MobileNetV2 range
    base = tf.keras.applications.MobileNetV2(
        input_shape=(IMG, IMG, 3), include_top=False, weights=weights
    )
    base.trainable = False
    x = base(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(num_classes, activation="softmax", name="predictions")(x)
    return models.Model(inputs, outputs, name="ecovision_mobilenetv2"), base


def make_callbacks(checkpoint_path: str):
    # Fresh callback objects per phase so patience counters/best values do not leak across phases.
    return [
        callbacks.EarlyStopping(monitor="val_loss", patience=4, restore_best_weights=True, verbose=1),
        callbacks.ModelCheckpoint(checkpoint_path, monitor="val_loss", save_best_only=True, verbose=1),
        callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=2, min_lr=1e-6, verbose=1),
    ]


def main():
    args = parse_args()
    tf.keras.utils.set_random_seed(args.seed)
    out = Path(args.output_dir)
    out.mkdir(parents=True, exist_ok=True)
    manifest_path = str(out / "split_manifest.json")

    manifest = make_manifest(args.data_dir, args.seed, manifest_path)
    class_names = manifest["class_names"]
    print("Raw class counts:", manifest["raw_class_counts"])
    print("Exact duplicates removed:", manifest["exact_duplicates_removed"])
    print({k: len(v["files"]) for k, v in manifest["splits"].items()})

    x_train, y_train = load_split(manifest, "train")
    x_val, y_val = load_split(manifest, "val")

    # Class weights from the TRAINING split only (the dataset is imbalanced: 'trash' is small).
    cw = compute_class_weight("balanced", classes=np.arange(len(class_names)), y=y_train)
    class_weight = {i: float(w) for i, w in enumerate(cw)}
    print("Class weights:", class_weight)

    with open(out / "class_indices.json", "w", encoding="utf-8") as f:
        json.dump({str(i): n for i, n in enumerate(class_names)}, f, indent=2)

    model, base = build_model(len(class_names), None if args.weights == "none" else "imagenet")
    ckpt = str(out / "mobilenetv2_waste.keras")
    fit_kwargs = dict(x=x_train, y=y_train, validation_data=(x_val, y_val),
                      batch_size=args.batch_size, class_weight=class_weight)

    print("\n[PHASE 1] training the classification head (backbone frozen)")
    model.compile(optimizers.Adam(1e-3), loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    h1 = model.fit(epochs=args.epochs_head, callbacks=make_callbacks(ckpt), **fit_kwargs)

    print("\n[PHASE 2] fine-tuning the last 30 backbone layers (BatchNorm kept frozen)")
    base.trainable = True
    for layer in base.layers[:-30]:
        layer.trainable = False
    for layer in base.layers:
        if isinstance(layer, layers.BatchNormalization):
            layer.trainable = False
    model.compile(optimizers.Adam(1e-5), loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    h2 = model.fit(epochs=args.epochs_fine, callbacks=make_callbacks(ckpt), **fit_kwargs)

    # Reload the best checkpoint saved on disk (this is exactly what the API will load).
    best = tf.keras.models.load_model(ckpt, compile=False)

    run_info = {
        "weights": args.weights,
        "seed": args.seed,
        "tensorflow": tf.__version__,
        "python": platform.python_version(),
        "class_names": class_names,
        "split_sizes": {k: len(v["files"]) for k, v in manifest["splits"].items()},
        "raw_class_counts": manifest["raw_class_counts"],
        "exact_duplicates_removed": manifest["exact_duplicates_removed"],
        "epochs_run": {"head": len(h1.history["loss"]), "fine_tune": len(h2.history["loss"])},
        "best_val_accuracy_phase2": float(max(h2.history["val_accuracy"])),
    }
    with open(out / "run_info.json", "w", encoding="utf-8") as f:
        json.dump(run_info, f, indent=2)

    print("\n[EVALUATION] held-out TEST split (never used for training or model selection)")
    evaluate_model(best, manifest, str(out / "evaluation_report.json"), args.batch_size)
    if args.weights == "none":
        print("\nWARNING: weights=none was a smoke test. Do NOT deploy this model.")


if __name__ == "__main__":
    main()
