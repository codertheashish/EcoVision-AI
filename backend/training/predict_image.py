"""Classify ONE image from the command line using the real trained model.

    python training/predict_image.py --image path/to/photo.jpg
"""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.ml.preprocessing import bytes_to_model_input  # noqa: E402


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--image", required=True)
    p.add_argument("--model-path", default="models/mobilenetv2_waste.keras")
    p.add_argument("--class-indices", default="models/class_indices.json")
    p.add_argument("--uncertainty-threshold", type=float, default=0.55)
    a = p.parse_args()

    if not Path(a.image).is_file():
        sys.exit(f"Image '{a.image}' not found.")
    if not Path(a.model_path).is_file():
        sys.exit(f"Model '{a.model_path}' not found. No prediction is made without a trained model.\n"
                 "Train it first: python training/train.py")
    names = {int(k): v for k, v in json.loads(Path(a.class_indices).read_text()).items()}

    import tensorflow as tf
    model = tf.keras.models.load_model(a.model_path, compile=False)
    batch, _ = bytes_to_model_input(Path(a.image).read_bytes())  # same preprocessing as the API
    probs = model.predict(batch, verbose=0)[0]

    order = probs.argsort()[::-1]
    print(f"Predicted: {names[int(order[0])]}  ({probs[order[0]] * 100:.2f}%)")
    if probs[order[0]] < a.uncertainty_threshold:
        print("Warning: low confidence, treat this prediction as uncertain.")
    for i in order[1:4]:
        print(f"  {names[int(i)]:10s} {probs[i] * 100:5.2f}%")


if __name__ == "__main__":
    main()
