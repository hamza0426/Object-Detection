# 🎯 Object Detection & Tracking System

<div align="center">

![Python](https://img.shields.io/badge/Python-3.10-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-FF6B35?style=for-the-badge)
![OpenCV](https://img.shields.io/badge/OpenCV-4.9-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white)
![Deployed](https://img.shields.io/badge/Deployed-Live-22c55e?style=for-the-badge)

**A full-stack computer vision application that detects, tracks, and counts objects in uploaded videos using the YOLOv8 neural network — with a professional React dashboard.**

[🚀 Live Demo](https://object-detection-hamza.vercel.app/) · [📦 Backend API](https://hamza0426-object-detection.hf.space/docs) · [⭐ Star this repo](#)

</div>

---

## ✨ Features

- 🎬 **Video Upload** — Drag & drop or browse to upload MP4, MOV, AVI, MKV files
- 🤖 **YOLOv8 Detection** — Real-time object detection using the YOLOv8n neural network trained on 80 COCO classes
- 🔢 **Object Tracking** — Unique ID assignment per object using BotSort tracker — counts each unique object once even as it moves across frames
- 📊 **Detection Dashboard** — Live results with class breakdown, confidence scores, frame count, and animated progress
- 🎥 **Annotated Video Output** — Download the processed video with bounding boxes and labels drawn on every frame
- 📱 **Fully Responsive** — Works on desktop, tablet, and mobile

---

## 🖥️ Demo

> Upload any video → AI processes it → Get annotated output with detection statistics

**Example — Orange Conveyor Belt Detection:**

The system correctly detects and tracks individual oranges moving on an industrial conveyor belt, assigning unique IDs and counting them as they pass through the frame.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS |
| **Backend** | FastAPI, Python 3.10 |
| **ML Model** | YOLOv8n (Ultralytics) |
| **Computer Vision** | OpenCV |
| **Object Tracking** | BotSort (custom config) |
| **Video Encoding** | FFmpeg (H264/yuv420p) |
| **Frontend Deploy** | Vercel |
| **Backend Deploy** | Hugging Face Spaces (Docker) |

---

## 🚀 Running Locally

### Prerequisites
- Python 3.9+
- Node.js 18+
- pip

### Backend

```bash
# Clone the repo
git clone https://github.com/hamza0426/Object-Detection.git
cd Object-Detection

# Install dependencies
pip install fastapi uvicorn python-multipart ultralytics opencv-python numpy torch torchvision

# Run the backend
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Backend will be live at `http://localhost:8000`
API docs available at `http://localhost:8000/docs`

### Frontend

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Update API URL in src/App.jsx
# Change: const API_URL = "https://hamza0426-object-detection.hf.space"
# To:     const API_URL = "http://localhost:8000"

# Run the frontend
npm run dev
```

Frontend will be live at `http://localhost:5173`

---

## 📁 Project Structure

```
Object-Detection/
├── app.py                  # FastAPI backend — detection & tracking logic
├── Dockerfile              # Docker config for Hugging Face deployment
├── requirements.txt        # Python dependencies
├── custom_tracker.yaml     # BotSort tracker config (auto-generated)
├── uploads/                # Temporary uploaded videos (gitignored)
├── outputs/                # Processed output videos (gitignored)
└── frontend/
    ├── src/
    │   └── App.jsx         # Main React component
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## ⚙️ How It Works

```
User uploads video
       ↓
FastAPI receives file → saves to disk
       ↓
YOLOv8n runs detection on every frame (imgsz=640, conf=0.2)
       ↓
BotSort tracker assigns unique IDs — tracks objects across frames
       ↓
OpenCV draws bounding boxes + labels on each frame
       ↓
FFmpeg re-encodes output to H264 (browser-compatible)
       ↓
Frontend displays results + streams annotated video
```

---

## 🌐 Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | https://object-detection-hamza.vercel.app |
| Backend API | Hugging Face Spaces | https://hamza0426-object-detection.hf.space |

> **Note:** The Hugging Face free tier may take 30–60 seconds to wake up if idle. Processing a video takes 3–5 minutes on the free CPU tier.

---

## 📚 Academic Context

This project was developed as part of the **Digital Image Processing (DIP) Lab** course. It demonstrates practical application of:
- Convolutional Neural Networks for object detection
- Multi-object tracking algorithms
- REST API design for ML model serving
- Full-stack deployment of AI applications

---

## 👨‍💻 Author

**Hamza** — Computer Science Student  
[GitHub](https://github.com/hamza0426) · [LinkedIn](https://www.linkedin.com/in/muhammad-hamza-owais)

---

<div align="center">
Made with ❤️ by Hamza
</div>
