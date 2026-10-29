# Road Damage Detection AI Inference Engine

This inference service powers real-time object detection and multi-frame tracking for 5 road pavement distress categories:
1. **Transverse crack** (perpendicular lane fractures, thermal cracks)
2. **Longitudinal crack** (parallel wheel-path fatigue cracks)
3. **Alligator crack** (interconnected crocodile pattern fatigue distress)
4. **Pothole** (asphalt cavity, pavement edge breakup, subsidence)
5. **Manhole hazard** (sunken rims, protruding cast iron lips, cracked collar surrounds)

---

## Architecture Overview

```
 [User Browser / Mobile] 
          │  Upload Video (MP4, MOV, AVI, WEBM)
          ▼
   [Node Express API] ──(Extract frames via FFmpeg)──┐
          │                                           │
          ├──────────────────────────┐                │
          ▼                          ▼                ▼
   [Gemini Vision AI]        [Python YOLO FastAPI]  [Frame Tracker]
   (gemini-3.8-flash)       (Ultralytics YOLOv8/v11)  (SORT/IoU matching)
          │                          │                │
          └──────────────────────────┘                │
                       │                              │
                       ▼                              ▼
          [Annotated Frame Rendering] ──(FFmpeg)──> [Annotated MP4 Video]
```

---

## Running with Trained YOLO Model (Option 1)

1. **Install requirements:**
   ```bash
   pip install fastapi uvicorn ultralytics opencv-python pillow
   ```

2. **Download or train Road Damage Model:**
   Trained on the **RDD2022 (Road Damage Dataset)** or **Crowdsensing Road Dataset**.
   Save weights as `best.pt` in `inference_service/`.

3. **Start FastAPI Service:**
   ```bash
   cd inference_service
   export ROAD_DAMAGE_MODEL_PATH="best.pt"
   python app.py
   ```
   Service runs on `http://localhost:8000`.

4. **Connect to Main Server:**
   Set `YOLO_INFERENCE_URL="http://localhost:8000/predict"` in your `.env`.

---

## Running with Gemini Vision AI (Option 2 - Built-in)

The server comes equipped with native `@google/genai` vision detection using Google's `gemini-3.8-flash` model.
Simply ensure `GEMINI_API_KEY` is present in your environment:
```bash
GEMINI_API_KEY="your-api-key"
```

The server automatically extracts frames at 1-2 FPS, identifies defects across the 5 categories with normalized bounding boxes, tracks them across consecutive frames, and generates the annotated output video.

---

## Object Tracking Across Video Frames

To prevent double-counting defects across sequential frames, the backend implements a **2D IoU + Centroid spatial tracker**:
- When defect bounding box overlap between frame $t$ and frame $t+1$ exceeds threshold ($\ge 0.30$) or distance is within vehicle velocity radius with matching category, it maintains the same `trackingId` (`TRK-001`, `TRK-002`).
- Computes **Total Unique Defects** rather than counting every individual frame detection.
- Generates synchronized timeline markers so clicking any defect jumps the player directly to that frame.
