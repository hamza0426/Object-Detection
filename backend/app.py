from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from ultralytics import YOLO
import os, uuid, cv2
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
model = YOLO("yolov8n.pt")  # pretrained

@app.post("/process-video")
async def process_video(video: UploadFile = File(...)):

    # Save uploaded video
    input_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{video.filename}")
    with open(input_path, "wb") as f:
        f.write(await video.read())

    # Output video path
    output_filename = f"processed_{uuid.uuid4()}.mp4"
    output_path = os.path.join(OUTPUT_DIR, output_filename)

    # ---------------- Process video ----------------
    results = model.track(
        source=input_path,
        show=False,
        stream=True
    )

    # ---------------- Save video with labels ----------------
    cap = cv2.VideoCapture(input_path)
    
    # Try H.264 codec (more compatible), fallback to MJPG if needed
    try:
        fourcc = cv2.VideoWriter_fourcc(*"H264")
    except:
        fourcc = cv2.VideoWriter_fourcc(*"MJPG")
    
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    # Validate video writer
    if not out.isOpened():
        print(f"Error: VideoWriter failed to open. Codec may not be available.")
        cap.release()
        return {"error": "Video encoding failed. Codec not available."}, 500

    object_count = {}

    frame_idx = 0
    for result in results:
        frame_idx += 1
        frame = result.orig_img.copy()

        if result.boxes.id is not None:
            names = result.names
            for cls_id, track_id, box in zip(
                result.boxes.cls.cpu().numpy(),
                result.boxes.id.cpu().numpy(),
                result.boxes.xyxy.cpu().numpy()
            ):
                label = names[int(cls_id)]
                if label not in object_count:
                    object_count[label] = set()
                object_count[label].add(track_id)

                # Draw box
                x1, y1, x2, y2 = map(int, box)
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0,255,0), 2)
                cv2.putText(frame, f"{label} ID:{int(track_id)}", (x1, y1-10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,255,0), 2)

        out.write(frame)

    cap.release()   
    out.release()

    # Convert sets to counts
    object_count = {k: len(v) for k,v in object_count.items()}
    total_count = sum(object_count.values())    
    return {
        "frame_count": frame_idx,
        "timestamp": datetime.now().isoformat(),
        "video_url": f"/outputs/{output_filename}",
        "download_url": f"/download/{output_filename}",
        "filename": output_filename,
        "total": total_count,
        **object_count
    }

@app.get("/outputs/{filename}")
def serve_video(filename: str):
    file_path = os.path.join(OUTPUT_DIR, filename)
    
    # Validate file exists and has content
    if not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
        return {"error": "Video file not found or empty"}, 404
    
    return FileResponse(
        file_path,
        media_type="video/mp4",
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Cache-Control": "no-cache, no-store, must-revalidate"
        }
    )

@app.get("/download/{filename}")
def download_video(filename: str):
    return FileResponse(
        os.path.join(OUTPUT_DIR, filename),
        media_type="video/mp4",
        filename=filename
    )
