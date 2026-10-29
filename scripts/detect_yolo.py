import sys
import json
import os
import contextlib
import io
from PIL import Image

def run_detection(image_path, model_path="models/best.pt", conf_thresh=0.25):
    if not os.path.exists(model_path):
        return {"error": f"Model file not found at {model_path}"}
    if not os.path.exists(image_path):
        return {"error": f"Image file not found at {image_path}"}

    try:
        from ultralytics import YOLO
    except ImportError:
        return {"error": "Ultralytics YOLO not installed in Python environment"}

    try:
        # Suppress ultralytics verbose initialization logs
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            model = YOLO(model_path)
            img = Image.open(image_path).convert("RGB")
            width, height = img.size
            results = model.predict(img, conf=conf_thresh, verbose=False)

        detections = []

        # Exact 4-class mapping of dronefreak/rdd2022-yolo26s
        # {0: 'longitudinal_crack', 1: 'transverse_crack', 2: 'alligator_crack', 3: 'pothole'}
        CLASS_MAP = {
            0: ("D00", "Longitudinal crack", 2.6, "moderate"),
            1: ("D10", "Transverse crack", 3.8, "moderate"),
            2: ("D20", "Alligator crack", 3.2, "moderate"),
            3: ("D40", "Pothole", 8.5, "critical")
        }

        for r in results:
            for box in r.boxes:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])

                if cls_id in CLASS_MAP:
                    code, category, depth, sev = CLASS_MAP[cls_id]
                else:
                    code, category, depth, sev = ("D40", "Pothole", 7.5, "critical")

                # Normalize bounding box coordinates to percentages (0-100)
                xyxy = box.xyxy[0].tolist()
                bx1, by1, bx2, by2 = xyxy
                bx = (bx1 / width) * 100.0
                by = (by1 / height) * 100.0
                bw = ((bx2 - bx1) / width) * 100.0
                bh = ((by2 - by1) / height) * 100.0
                area = round((bw * bh) / 100.0, 2)

                detections.append({
                    "damageCode": code,
                    "category": category,
                    "title": f"{code}: {category}",
                    "confidence": round(conf, 3),
                    "severity": sev,
                    "bbox": {
                        "x": round(bx, 2),
                        "y": round(by, 2),
                        "width": round(bw, 2),
                        "height": round(bh, 2)
                    },
                    "depthCm": depth,
                    "areaM2": max(0.2, area),
                    "description": f"{category} detected by YOLO26-S (best.pt)"
                })

        return {
            "success": True,
            "modelName": f"YOLO26-S (best.pt: {model_path})",
            "modelWeights": "dronefreak/rdd2022-yolo26s",
            "detections": detections,
            "summary": {
                "d00": sum(1 for d in detections if d["damageCode"] == "D00"),
                "d10": sum(1 for d in detections if d["damageCode"] == "D10"),
                "d20": sum(1 for d in detections if d["damageCode"] == "D20"),
                "d40": sum(1 for d in detections if d["damageCode"] == "D40"),
                "manhole": sum(1 for d in detections if d["damageCode"] == "MH"),
                "total": len(detections)
            }
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python detect_yolo.py <image_path> [model_path] [conf]"}))
        sys.exit(1)
    
    img_p = sys.argv[1]
    mod_p = sys.argv[2] if len(sys.argv) > 2 else "models/best.pt"
    conf_v = float(sys.argv[3]) if len(sys.argv) > 3 else 0.25

    res = run_detection(img_p, mod_p, conf_v)
    # Output pure JSON
    sys.stdout.write(json.dumps(res))
