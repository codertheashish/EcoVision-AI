"""Image decoding + preprocessing shared by the API, the training scripts and the CLI.

Single source of truth: whatever happens here at training time MUST happen at inference time.

Contract
--------
* Output: float32 array, shape (224, 224, 3), RGB, pixel values in [0, 255].
* The [-1, 1] MobileNetV2 scaling is NOT done here. It is a `Rescaling` layer INSIDE the
  saved Keras model (see training/train.py), so it cannot be applied twice or forgotten.
"""
import io
from typing import Tuple

import numpy as np
from PIL import Image, ImageOps, UnidentifiedImageError

IMG_SIZE = 224
ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP"}


class ImageValidationError(ValueError):
    """Raised when uploaded bytes are not an acceptable image (maps to HTTP 415/422)."""

    def __init__(self, message: str, unsupported_type: bool = False):
        super().__init__(message)
        self.unsupported_type = unsupported_type


def decode_image(
    data: bytes,
    max_dimension: int = 4096,
    max_pixels: int = 25_000_000,
) -> Image.Image:
    """Safely decode bytes into an RGB PIL image (no files are written to disk)."""
    # Guard against decompression bombs: Pillow raises if pixels exceed 2x this value.
    Image.MAX_IMAGE_PIXELS = max_pixels
    try:
        probe = Image.open(io.BytesIO(data))
        fmt = probe.format
        width, height = probe.size  # reads the header only
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError) as exc:
        raise ImageValidationError("File is not a readable image.", unsupported_type=True) from exc

    if fmt not in ALLOWED_FORMATS:
        raise ImageValidationError(
            f"Unsupported image format '{fmt}'. Use JPEG, PNG or WEBP.", unsupported_type=True
        )
    if width > max_dimension or height > max_dimension:
        raise ImageValidationError(
            f"Image is {width}x{height}px; the maximum is {max_dimension}px on either side."
        )
    if width * height > max_pixels:
        raise ImageValidationError("Image has too many pixels.")

    try:
        image = Image.open(io.BytesIO(data))
        image.load()  # full decode; raises on truncated/corrupt files
        image = ImageOps.exif_transpose(image)  # honour phone-camera rotation
        return image.convert("RGB")
    except (OSError, SyntaxError, ValueError, Image.DecompressionBombError) as exc:
        raise ImageValidationError("Image file is corrupted or truncated.") from exc


def image_to_array(image: Image.Image) -> np.ndarray:
    """RGB PIL image -> float32 (224, 224, 3) in [0, 255]."""
    resized = image.resize((IMG_SIZE, IMG_SIZE), Image.Resampling.BILINEAR)
    return np.asarray(resized, dtype=np.float32)


def bytes_to_model_input(data: bytes, max_dimension: int = 4096, max_pixels: int = 25_000_000) -> Tuple[np.ndarray, Tuple[int, int]]:
    """Bytes -> (batch of 1 model input, original (width, height))."""
    image = decode_image(data, max_dimension=max_dimension, max_pixels=max_pixels)
    original_size = image.size
    return np.expand_dims(image_to_array(image), axis=0), original_size


def path_to_array(path: str) -> np.ndarray:
    """Used by training/evaluation scripts to load dataset files with the SAME pipeline."""
    with Image.open(path) as img:
        img = ImageOps.exif_transpose(img).convert("RGB")
        return image_to_array(img)
