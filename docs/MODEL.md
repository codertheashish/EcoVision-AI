# Model

- Backbone: MobileNetV2 (ImageNet weights, `include_top=False`), input 224x224 RGB.
- Head: GlobalAveragePooling > Dropout(0.3) > Dense(6, softmax).
- Augmentation (random flip/rotation/zoom/contrast) is layers **inside** the model and is active only during training.
- Preprocessing is a `Rescaling(1/127.5, offset=-1)` layer **inside** the model. The API, the CLI and training all feed raw RGB pixels in the 0-255 range (`backend/app/ml/preprocessing.py` is the single shared implementation). The original project scaled the image to [-1, 1] before the model *and* inside the model, which would have squashed the input at inference; that bug is fixed by this design.
- Training: phase 1 trains the head (backbone frozen, lr 1e-3); phase 2 fine-tunes the last 30 backbone layers (BatchNorm frozen, lr 1e-5). Early stopping and checkpointing monitor validation loss. Class weights handle imbalance.
- Labels: `models/class_indices.json` (alphabetical: 0 cardboard, 1 glass, 2 metal, 3 paper, 4 plastic, 5 trash) is written by `train.py` and read by the API; the API refuses to load a model whose output size differs.

## Results
**None are reported here on purpose.** Run `python training/train.py` (or `evaluate.py`). Metrics are written to `models/evaluation_report.json` and served by the API at `/api/v1/model-info`. Commit that file together with the model.

## Verified in this repository's test run
A smoke-test run (1 epoch, **random weights** because ImageNet weights could not be downloaded in the test sandbox) confirmed that splitting, training, checkpointing, evaluation, the CLI and the API all work and agree with each other (same test accuracy from `train.py` and `evaluate.py`; same confidence from the CLI and the API for the same image). That model was discarded and is not a usable classifier (19% accuracy).
Measured with TensorFlow-CPU 2.21.0: 2,265,670 parameters in the 6-class model; about 700 MB resident memory in the running API after loading and one prediction.
