<div align="center">

<img src="https://img.shields.io/badge/-%F0%9F%8E%AF%20OBJECT%20DETECT-0284c7?style=for-the-badge&labelColor=0ea5e9&color=0284c7" alt="ObjectDetect" height="40"/>

# Object Detection & Tracking System

**Upload any video. Detect every object. Track them all in real-time.**

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Visit%20App-0284c7?style=for-the-badge)](https://object-detection-hamza.vercel.app/)
[![API Docs](https://img.shields.io/badge/📡%20API%20Docs-FastAPI-0ea5e9?style=for-the-badge)](https://hamza0426-object-detection.hf.space/docs)
[![GitHub](https://img.shields.io/badge/⭐%20Star%20this%20Repo-GitHub-1e40af?style=for-the-badge)](https://github.com/hamza0426/Object-Detection)

![Python](https://img.shields.io/badge/Python-3.10-0284c7?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-0ea5e9?style=flat-square&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-38bdf8?style=flat-square&logo=react&logoColor=white)
![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-1d4ed8?style=flat-square)
![OpenCV](https://img.shields.io/badge/OpenCV-4.9-0369a1?style=flat-square&logo=opencv&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-0284c7?style=flat-square&logo=tailwindcss&logoColor=white)
![Deployed](https://img.shields.io/badge/Status-Live-22c55e?style=flat-square)

</div>

---

## 📸 Screenshots

> *Add your screenshots here after taking them locally*

<!-- Replace these with your actual screenshots -->
<!-- Tip: Drag and drop images directly into GitHub's README editor to upload them -->

| Dashboard | Detection Results |
|:---------:|:-----------------:|
| *Upload your screenshot here* | *Upload your results screenshot here* |

---

<div align="center">

## 🔷 How It Works

</div>

```
 ┌─────────────┐     ┌──────────────────┐     ┌─────────────────────┐
 │ Upload Video │ ──▶ │  YOLOv8 Detection │ ──▶ │  BotSort Tracking   │
 │  (any format)│     │  imgsz=640        │     │  Unique ID per obj  │
 └─────────────┘     └──────────────────┘     └─────────────────────┘
                                                          │
 ┌─────────────┐     ┌──────────────────┐                ▼
 │  React UI   │ ◀── │  FastAPI Response │ ◀── ┌─────────────────────┐
 │  Dashboard  │     │  JSON + Video URL │     │  FFmpeg H264 Encode │
 └─────────────┘     └──────────────────┘     │  Browser Compatible │
                                               └─────────────────────┘
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎬 **Drag & Drop Upload** | Upload MP4, MOV, AVI, MKV — up to 100MB |
| 🤖 **YOLOv8 Detection** | 80+ COCO object classes detected per frame |
| 🔢 **Unique ID Tracking** | BotSort assigns each object a unique ID — counts it once even as it moves |
| 📊 **Live Dashboard** | Animated results with class breakdown, confidence scores, frame count |
| 🎥 **Annotated Video** | Download processed video with bounding boxes + labels on every frame |
| ⚡ **Step Progress** | Real-time progress with descriptive labels during processing |
| 📱 **Fully Responsive** | Clean UI that works on desktop, tablet, and mobile |

---

## 🏗️ Tech Stack

<div align="center">

| Layer | Technology | Purpose |
|:-----:|:----------:|:-------:|
| **Frontend** | React 18 + Vite + Tailwind CSS | UI Dashboard |
| **Backend** | FastAPI + Python 3.10 | REST API Server |
| **ML Model** | YOLOv8n (Ultralytics) | Object Detection |
| **Tracking** | BotSort (custom config) | Multi-object Tracking |
| **Vision** | OpenCV | Frame Processing |
| **Encoding** | FFmpeg libx264 | Browser-compatible Video |
| **Frontend Host** | Vercel | Auto-deploy from GitHub |
| **Backend Host** | Hugging Face Spaces | Docker Container |

</div>

---

## 🚀 Getting Started

### Prerequisites

- **Python** 3.9 or higher
- **Node.js** 18 or higher
- **pip** and **npm**

---

### ⚙️ Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/hamza0426/Object-Detection.git
cd Object-Detection/backend

# 2. Install Python dependencies
pip install fastapi uvicorn python-multipart ultralytics opencv-python numpy torch torchvision

# 3. Start the backend server
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

✅ Backend live at `http://localhost:8000`  
📡 API docs at `http://localhost:8000/docs`

---

### 🖥️ Frontend Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Update API URL in src/App.jsx
#    Change: const API_URL = "https://hamza0426-object-detection.hf.space"
#    To:     const API_URL = "http://localhost:8000"

# 4. Start the development server
npm run dev
```

✅ Frontend live at `http://localhost:5173`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|:------:|----------|-------------|
| `POST` | `/process-video` | Upload a video — runs full detection + tracking pipeline |
| `GET` | `/outputs/{filename}` | Stream the processed annotated video |
| `GET` | `/download/{filename}` | Download the processed video file |

---

## 📁 Project Structure

```
Object-Detection/
│
├── backend/
│   ├── app.py                  # FastAPI server — detection & tracking logic
│   ├── Dockerfile              # Docker config for Hugging Face deployment
│   ├── requirements.txt        # Python dependencies
│   ├── uploads/                # Temp video uploads      (gitignored)
│   └── outputs/                # Processed output videos (gitignored)
│
├── frontend/
│   ├── src/
│   │   └── App.jsx             # Main React dashboard component
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🌐 Deployment Architecture

```
 GitHub Repo
      │
      ├──── Vercel ──────────────▶  frontend (React)
      │     Auto-deploy on push      https://object-detection-hamza.vercel.app
      │
      └──── Hugging Face Spaces ──▶  backend (FastAPI + Docker)
            Manual push               https://hamza0426-object-detection.hf.space
```

> ⚠️ **Note:** Hugging Face free tier may take **30–60 seconds to wake up** if idle.  
> Processing time is **3–5 minutes** on the free CPU tier.  
> For best results, run locally where full CPU speed is available.

---

## 📚 Academic Context

This project was built as part of the **Digital Image Processing (DIP) Lab** course and demonstrates:

- Convolutional Neural Networks for real-time object detection
- Multi-object tracking with unique ID assignment
- REST API design for serving ML models
- Full-stack deployment of AI-powered web applications

---

<div align="center">

## 👨‍💻 Author

**Muhammad Hamza Owais**  
Computer Science Graduate

[![GitHub](https://img.shields.io/badge/GitHub-hamza0426-0284c7?style=flat-square&logo=github)](https://github.com/hamza0426)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0ea5e9?style=flat-square&logo=linkedin)](https://linkedin.com/in/muhammad-hamza-owais)

---

*Made with ❤️ by Hamza — Object Detection Project*

![visitors](https://visitor-badge.laobi.icu/badge?page_id=hamza0426.Object-Detection&style=flat-square&color=0284c7)

</div>