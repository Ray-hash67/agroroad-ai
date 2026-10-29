"""
Road Damage Detection FastAPI Inference Service
Powered by YOLO26-S (RDD2022 Best Model, yolo26s.pt).
Detects standard road defect categories defined in RDD2022:
1. D00: Longitudinal crack (wheel-path and paving seam fractures)
2. D10: Transverse crack (perpendicular cross-lane fractures)
3. D20: Alligator crack (crocodile fatigue distress)
4. D40: Pothole (asphalt cavity, localized breakup, or subsidence)
5. MH:  Manhole hazard (sunken rim or frame depression)
"""

import os
import io
import time
from typing import List, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image

app = FastAPI(
    title="Road Damage Detection YOLO26-S Inference Service",
    description="High-throughput road pavement defect object detection & tracking service using YOLO26-S",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Standard 4 classes from RDD2022 + Manhole hazard
DAMAGE_CLASSES = [
    "D00: Longitudinal crack",
    "D10: Transverse crack",
    "D20: Alligator crack",
    "D40: Pothole",
    "MH: Manhole hazard"
]

class BoundingBox(BaseModel):
    x: float       # 0 - 100 percentage
    y: float       # 0 - 100 percentage
    width: float   # 0 - 100 percentage
    height: float  # 0 - 100 percentage
    label: str
    confidence: float
    category: str
    severity: str

class DetectionResponse(BaseModel):
    detections: List[BoundingBox]
    model_name: str
    inference_time_ms: float
    total_detections: int

# Lazy model loader
model = None
MODEL_PATH = os.environ.get("ROAD_DAMAGE_MODEL_PATH", "best.pt")

def load_yolo_model():
    global model
    if model is None:
        try:
            from ultralytics import YOLO
            if os.path.exists(MODEL_PATH):
                model = YOLO(MODEL_PATH)
                print(f"[AI Model] Loaded YOLO weights from {MODEL_PATH}")
            else:
                # Can fall back to standard yolo model or alert
                print(f"[AI Model] Model file not found at {MODEL_PATH}. Standby mode.")
        except ImportError:
            print("[AI Model] Ultralytics not installed. Run 'pip install ultralytics'.")
    return model

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Road Damage Detection Inference Service",
        "classes": DAMAGE_CLASSES,
        "model_loaded": model is not None,
        "model_path": MODEL_PATH
    }

@app.post("/predict", response_model=DetectionResponse)
async def predict_frame(file: UploadFile = File(...)):
    start_time = time.time()
    
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image")
    
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    width, height = image.size

    yolo = load_yolo_model()
    detections: List[BoundingBox] = []

    if yolo is not None:
        results = yolo.predict(image, conf=0.35, verbose=False)
        for r in results:
            for box in r.boxes:
                cls_id = int(box.cls[0])
                cls_name = yolo.names.get(cls_id, "Pothole")
                conf = float(box.conf[0])
                
                # Normalize bounding box to 0-100%
                xyxy = box.xyxy[0].tolist()
                bx1, by1, bx2, by2 = xyxy
                bx = (bx1 / width) * 100.0
                by = (by1 / height) * 100.0
                bw = ((bx2 - bx1) / width) * 100.0
                bh = ((by2 - by1) / height) * 100.0
                
                # Map to standard 5 categories
                category = "Pothole"
                name_lower = cls_name.lower()
                if "transverse" in name_lower or "d10" in name_lower:
                    category = "Transverse crack"
                elif "longitudinal" in name_lower or "d00" in name_lower:
                    category = "Longitudinal crack"
                elif "alligator" in name_lower or "d20" in name_lower:
                    category = "Alligator crack"
                elif "manhole" in name_lower or "d43" in name_lower or "d44" in name_lower:
                    category = "Manhole hazard"
                elif "pothole" in name_lower or "d40" in name_lower:
                    category = "Pothole"
                
                severity = "critical" if (category == "Pothole" or bh > 25) else "moderate"
                
                detections.append(BoundingBox(
                    x=round(bx, 2),
                    y=round(by, 2),
                    width=round(bw, 2),
                    height=round(bh, 2),
                    label=f"{category} {round(conf, 2)}",
                    confidence=round(conf, 3),
                    category=category,
                    severity=severity
                ))
    else:
        # If no YOLO model weights are provided yet, do NOT fabricate detections.
        raise HTTPException(
            status_code=503,
            detail=f"Trained model not loaded at {MODEL_PATH}. Please provide a trained YOLO road damage model."
        )

    duration_ms = (time.time() - start_time) * 1000.0
    return DetectionResponse(
        detections=detections,
        model_name="YOLO-RoadDamage-v8",
        inference_time_ms=round(duration_ms, 2),
        total_detections=len(detections)
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
