from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from ultralytics import YOLO
import os, uuid, cv2, subprocess, yaml
from datetime import datetime

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Load YOLO
model = YOLO("yolov8n.pt")

TRACKER_CONFIG = "custom_tracker.yaml"
tracker_cfg = {
    "tracker_type":      "botsort",
    "track_high_thresh": 0.25,
    "track_low_thresh":  0.1,
    "new_track_thresh":  0.25,
    "track_buffer":      60,
    "match_thresh":      0.9,
    "proximity_thresh":  0.5,  
    "appearance_thresh": 0.25,  
    "fuse_score":        True,
    "gmc_method":        "sparseOptFlow",
    "with_reid":         False,
}
with open(TRACKER_CONFIG, "w") as f:
    yaml.dump(tracker_cfg, f)


@app.post("/process-video")
async def process_video(video: UploadFile = File(...)):

    # Save uploaded video
    input_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{video.filename}")
    with open(input_path, "wb") as f:
        f.write(await video.read())

    raw_filename    = f"raw_{uuid.uuid4()}.mp4"
    output_filename = f"processed_{uuid.uuid4()}.mp4"
    raw_path        = os.path.join(OUTPUT_DIR, raw_filename)
    output_path     = os.path.join(OUTPUT_DIR, output_filename)

    # ── Video properties ────────────────────────────────────────
    cap    = cv2.VideoCapture(input_path)
    fps    = int(cap.get(cv2.CAP_PROP_FPS)) or 25
    width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    cap.release()

    # ── VideoWriter ─────────────────────────────────────────────
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out    = cv2.VideoWriter(raw_path, fourcc, fps, (width, height))

    if not out.isOpened():
        return {"error": "Video encoding failed."}, 500

    # ── YOLO tracking ───────────────────────────────────────────
    results = model.track(
        source=input_path,
        show=False,
        stream=True,
        imgsz=640,
        conf=0.2,
        iou=0.45,
        tracker=TRACKER_CONFIG,
        verbose=False,
    )

    object_count = {}
    frame_idx    = 0

    for result in results:
        frame_idx += 1
        frame = result.orig_img.copy()

        if result.boxes.id is not None:
            names = result.names
            for cls_id, track_id, box, conf_score in zip(
                result.boxes.cls.cpu().numpy(),
                result.boxes.id.cpu().numpy(),
                result.boxes.xyxy.cpu().numpy(),
                result.boxes.conf.cpu().numpy(),
            ):
                label = names[int(cls_id)]

                if label not in object_count:
                    object_count[label] = set()
                object_count[label].add(track_id)

                x1, y1, x2, y2 = map(int, box)
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(
                    frame,
                    f"{label} ID:{int(track_id)} {conf_score:.2f}",
                    (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    (0, 255, 0),
                    2,
                )

        out.write(frame)

    out.release()

    # ── Re-encode to H264 with ffmpeg ───────────────────────────
    try:
        subprocess.run(
            [
                "ffmpeg", "-y",
                "-i", raw_path,
                "-vcodec", "libx264",
                "-crf", "23",
                "-preset", "ultrafast",
                "-pix_fmt", "yuv420p",
                output_path,
            ],
            check=True,
            capture_output=True,
        )
        os.remove(raw_path)
    except Exception as e:
        print(f"ffmpeg failed: {e}")
        os.rename(raw_path, output_path)

    try:
        os.remove(input_path)
    except Exception:
        pass

    object_count = {k: len(v) for k, v in object_count.items()}
    total_count  = sum(object_count.values())

    return {
        "frame_count":  frame_idx,
        "timestamp":    datetime.now().isoformat(),
        "video_url":    f"/outputs/{output_filename}",
        "download_url": f"/download/{output_filename}",
        "filename":     output_filename,
        "total":        total_count,
        **object_count,
    }


@app.get("/outputs/{filename}")
def serve_video(filename: str):
    file_path = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
        return {"error": "Video file not found or empty"}, 404
    return FileResponse(
        file_path,
        media_type="video/mp4",
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Cache-Control": "no-cache, no-store, must-revalidate",
        },
    )

@app.get("/download/{filename}")
def download_video(filename: str):
    return FileResponse(
        os.path.join(OUTPUT_DIR, filename),
        media_type="video/mp4",
        filename=filename,
    )