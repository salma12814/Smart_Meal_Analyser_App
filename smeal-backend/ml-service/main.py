from __future__ import annotations

import json
import os
from contextlib import asynccontextmanager
from io import BytesIO
from pathlib import Path
from typing import Any

import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel, Field
from torchvision import models, transforms
from torch import nn
from ultralytics import YOLO

MAX_IMAGE_BYTES = 20 * 1024 * 1024
ROOT = Path(os.getenv("SMEAL_ROOT", "/app"))
WEIGHTS_PATH = Path(os.getenv("CLASSIFIER_WEIGHTS", str(ROOT / "models/resnet18_food101.pth")))
DETECTOR_PATH = Path(os.getenv("DETECTOR_WEIGHTS", str(ROOT / "yolov8n.pt")))
CLASSES_PATH = Path(os.getenv("CLASSES_PATH", str(ROOT / "src/config.json")))
RL_RESULTS_PATH = Path(os.getenv("RL_RESULTS_PATH", str(ROOT / "models/rl_results.json")))
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
PREPROCESS = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not WEIGHTS_PATH.is_file() or not DETECTOR_PATH.is_file() or not CLASSES_PATH.is_file():
        raise RuntimeError("SMEAL model files or class configuration are missing")
    with CLASSES_PATH.open(encoding="utf-8") as stream:
        app.state.classes = json.load(stream)["classes"]
    if len(app.state.classes) != 101:
        raise RuntimeError("Expected the Food-101 class list")

    classifier = models.resnet18(weights=None)
    classifier.fc = nn.Sequential(
        nn.Linear(classifier.fc.in_features, 512),
        nn.ReLU(),
        nn.Dropout(0.4),
        nn.Linear(512, len(app.state.classes)),
    )
    checkpoint = torch.load(WEIGHTS_PATH, map_location=DEVICE, weights_only=True)
    classifier.load_state_dict(checkpoint.get("model_state_dict", checkpoint))
    classifier.to(DEVICE).eval()
    app.state.classifier = classifier
    app.state.detector = YOLO(str(DETECTOR_PATH))
    try:
        with RL_RESULTS_PATH.open(encoding="utf-8") as stream:
            app.state.rl_results = json.load(stream)
    except FileNotFoundError:
        app.state.rl_results = {"best_meal": {"meal": [], "avg_score": 0}}
    yield


app = FastAPI(title="SMEAL ML API", version="1.0.0", lifespan=lifespan)


async def load_upload(upload: UploadFile) -> tuple[bytes, Image.Image]:
    if upload.content_type not in {"image/jpeg", "image/png"}:
        raise HTTPException(status_code=400, detail="Only JPEG and PNG images are accepted")
    content = await upload.read(MAX_IMAGE_BYTES + 1)
    if not content or len(content) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image must be between 1 byte and 20 MB")
    try:
        image = Image.open(BytesIO(content))
        image.verify()
        image = Image.open(BytesIO(content)).convert("RGB")
    except (UnidentifiedImageError, OSError) as exc:
        raise HTTPException(status_code=400, detail="Invalid image file") from exc
    return content, image


def classify_image(image: Image.Image, app_state: Any) -> dict[str, Any]:
    tensor = PREPROCESS(image).unsqueeze(0).to(DEVICE)
    with torch.inference_mode():
        probabilities = torch.softmax(app_state.classifier(tensor), dim=1)[0]
        probability, index = torch.max(probabilities, dim=0)
    return {"class": app_state.classes[index.item()], "probability": float(probability.item())}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "UP", "version": app.version}


@app.post("/predict/classify")
async def classify(file: UploadFile = File(...)) -> dict[str, Any]:
    _, image = await load_upload(file)
    return classify_image(image, app.state)


@app.post("/predict/detect")
async def detect(file: UploadFile = File(...)) -> dict[str, Any]:
    _, image = await load_upload(file)
    result = app.state.detector.predict(source=image, conf=0.15, verbose=False)[0]
    objects = []
    if result.boxes is not None:
        for box in result.boxes:
            x1, y1, x2, y2 = (float(value) for value in box.xyxy[0].tolist())
            class_id = int(box.cls[0].item())
            objects.append({
                "box": [x1, y1, x2, y2],
                "class": str(result.names[class_id]),
                "confidence": float(box.conf[0].item()),
            })
    return {"objects": objects}


class RecommendationRequest(BaseModel):
    selectedFoods: list[str] = Field(default_factory=list, max_length=101)


@app.post("/recommend")
def recommend(request: RecommendationRequest) -> dict[str, Any]:
    best_meal = app.state.rl_results.get("best_meal", {})
    learned_combo = best_meal.get("meal", [])
    score = float(best_meal.get("avg_score", 0))
    selected = {food.casefold() for food in request.selectedFoods}
    suggestions = [
        {
            "food": food,
            "reason": "Suggested by the learned best-meal combination",
            "scoreBoost": score,
            "compatibility": 1.0,
        }
        for food in learned_combo
        if food.casefold() not in selected
    ]
    return {"suggestions": suggestions}
