import React, { useState, useRef, useEffect } from "react";

const API_URL = "http://localhost:8000";
const BAR_COLORS = [
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
];

export default function App() {
  const [videoFile, setVideoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [results, setResults] = useState(null);
  const [processedUrl, setProcessedUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [error, setError] = useState("");
  const [videoKey, setVideoKey] = useState(Date.now());
  const [dragOver, setDragOver] = useState(false);
  const [mounted, setMounted] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
  }, []);

  const STEPS = [
    "Initializing YOLO model...",
    "Extracting video frames...",
    "Running object detection...",
    "Tracking objects across frames...",
    "Compiling detection results...",
    "Encoding output video...",
    "Finalizing...",
  ];

  useEffect(() => {
    let iv, sv;
    if (loading) {
      setProgress(0);
      let idx = 0;
      setProgressLabel(STEPS[0]);
      sv = setInterval(() => {
        idx = Math.min(idx + 1, STEPS.length - 1);
        setProgressLabel(STEPS[idx]);
      }, 2200);
      iv = setInterval(() => {
        setProgress((p) => (p < 90 ? p + Math.random() * 2.2 : p));
      }, 300);
    } else {
      setProgress(100);
    }
    return () => {
      clearInterval(iv);
      clearInterval(sv);
    };
  }, [loading]);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setError("Invalid file type. Please select a video file.");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError("File exceeds 100 MB limit.");
      return;
    }
    setVideoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResults(null);
    setProcessedUrl(null);
    setError("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const processVideo = async () => {
    if (!videoFile) return;
    setLoading(true);
    setError("");
    setProcessedUrl(null);
    setResults(null);
    const fd = new FormData();
    fd.append("video", videoFile);
    try {
      const res = await fetch(`${API_URL}/process-video`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Processing failed");
      setResults(data);
      if (data.video_url) {
        setProcessedUrl(`${API_URL}${data.video_url}?t=${Date.now()}`);
        setVideoKey(Date.now());
      }
    } catch (err) {
      setError(err.message || "Request failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const downloadVideo = () => {
    if (!results?.download_url) return;
    const a = document.createElement("a");
    a.href = `${API_URL}${results.download_url}`;
    a.download = results.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setVideoFile(null);
    setPreviewUrl(null);
    setResults(null);
    setProcessedUrl(null);
    setError("");
    setVideoKey(Date.now());
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Only show objects that were actually detected (count > 0)
  const objectCounts = results
    ? Object.entries(results)
        .filter(
          ([k, v]) =>
            ![
              "frame_count",
              "timestamp",
              "video_url",
              "download_url",
              "filename",
              "total",
            ].includes(k) && v > 0,
        )
        .sort(([, a], [, b]) => b - a)
    : [];
  const maxCount = objectCounts[0]?.[1] || 1;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn  { from{opacity:0;transform:scale(0.85)}      to{opacity:1;transform:scale(1)}     }
        @keyframes barIn  { from{width:0} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.4} }
        .anim-fadeup { animation: fadeUp 0.5s ease both; }
        .anim-popin  { animation: popIn  0.4s ease both; }
        .anim-barin  { animation: barIn  0.7s ease both; }
        .spinner     { animation: spin   0.7s linear infinite; }
        .pulse-dot   { animation: pulse  2s ease-in-out infinite; }
        video        { background: #0f172a; }
      `}</style>

      <div
        className="min-h-screen flex flex-col bg-slate-100"
        style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.3s" }}
      >
        {/* ── Topbar ──────────────────────────────────────── */}
        <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
          <div className="flex items-center justify-between px-4 sm:px-6 h-14 sm:h-[60px]">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-[34px] sm:h-[34px] bg-sky-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                <svg
                  className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <circle cx="17.5" cy="17.5" r="3.5" />
                </svg>
              </div>
              <span className="text-[0.95rem] sm:text-[1rem] font-bold tracking-tight text-slate-900">
                Object<span className="text-sky-600">Detect</span>
              </span>
            </div>

            {/* Badges — hide some on very small screens */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[0.65rem] sm:text-[0.72rem] font-semibold px-2 sm:px-2.5 py-1 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot flex-shrink-0" />
                Online
              </span>
              <span className="hidden xs:inline text-[0.65rem] sm:text-[0.72rem] font-semibold px-2 sm:px-2.5 py-1 rounded-md border border-sky-200 bg-sky-50 text-sky-700">
                YOLOv8
              </span>
              <span className="hidden sm:inline text-[0.72rem] font-semibold px-2.5 py-1 rounded-md border border-sky-200 bg-sky-50 text-sky-700">
                FastAPI
              </span>
            </div>
          </div>
        </nav>

        {/* ── Hero ────────────────────────────────────────── */}
        <section className="bg-white border-b border-slate-200 py-8 sm:py-10 px-4 sm:px-6 text-center anim-fadeup">
          <div className="inline-flex items-center gap-1.5 text-[0.68rem] sm:text-[0.72rem] font-semibold tracking-widest uppercase text-sky-600 bg-sky-50 border border-sky-200 px-3 sm:px-3.5 py-1.5 rounded-full mb-3 sm:mb-4">
            ◈ Computer Vision System
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 leading-tight mb-2 sm:mb-3">
            Object <span className="text-sky-600">Detection</span> &amp;
            Tracking
          </h1>
          <p className="text-[0.82rem] sm:text-sm text-slate-500 leading-relaxed max-w-lg mx-auto mb-4 sm:mb-5 font-normal">
            Upload any video to detect and track objects in real-time using the
            YOLOv8 neural network. Outputs an annotated video with bounding
            boxes and unique tracking IDs.
          </p>
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
            {[
              "YOLOv8 Model",
              "80+ COCO Classes",
              "Object Tracking",
              "MP4 Output",
              "Unique ID Assignment",
            ].map((t) => (
              <span
                key={t}
                className="text-[0.68rem] sm:text-[0.72rem] font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-md px-2.5 sm:px-3 py-1"
              >
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* ── Main Grid ───────────────────────────────────── */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 p-4 sm:p-5 max-w-[1280px] w-full mx-auto">
          {/* LEFT — Input */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm anim-fadeup">
            <div className="flex items-center justify-between pb-3 sm:pb-4 mb-4 sm:mb-5 border-b border-slate-200">
              <div className="flex items-center gap-2 text-[0.75rem] sm:text-[0.8rem] font-bold uppercase tracking-widest text-slate-500">
                <span className="w-2 h-2 bg-sky-600 rounded-sm flex-shrink-0" />
                Video Input
              </div>
              <span className="text-[0.68rem] sm:text-[0.7rem] text-slate-400 font-medium">
                Max 100 MB
              </span>
            </div>

            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200
                ${
                  dragOver
                    ? "border-sky-500 bg-sky-50"
                    : "border-slate-300 bg-slate-50 hover:border-sky-500 hover:bg-sky-50"
                }`}
            >
              <input
                type="file"
                accept="video/*"
                ref={fileInputRef}
                onChange={(e) => handleFile(e.target.files[0])}
                className="hidden"
              />
              <div
                className={`w-11 h-11 sm:w-12 sm:h-12 mx-auto mb-3 rounded-xl bg-white border flex items-center justify-center text-xl sm:text-2xl shadow-sm transition-all duration-200
                ${dragOver ? "border-sky-400 shadow-sky-100 -translate-y-0.5" : "border-slate-200"}`}
              >
                🎬
              </div>
              <p className="text-[0.85rem] sm:text-[0.9rem] font-semibold text-slate-800 mb-1">
                Drop your video here
              </p>
              <p className="text-[0.72rem] sm:text-[0.75rem] text-slate-400">
                MP4, MOV, AVI, MKV — or click to browse
              </p>
            </div>

            {/* File info */}
            {videoFile && (
              <div className="flex items-center gap-2 mt-3 px-3 sm:px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="text-sm sm:text-base flex-shrink-0">✅</span>
                <span className="flex-1 text-[0.75rem] sm:text-[0.8rem] font-semibold text-emerald-800 truncate">
                  {videoFile.name}
                </span>
                <span className="text-[0.68rem] sm:text-[0.7rem] text-emerald-700 whitespace-nowrap flex-shrink-0">
                  {(videoFile.size / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
            )}

            {/* Preview */}
            {previewUrl && (
              <div className="mt-3 sm:mt-4">
                <p className="text-[0.68rem] sm:text-[0.7rem] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Input Preview
                </p>
                <video
                  src={previewUrl}
                  controls
                  className="w-full rounded-lg max-h-[220px] sm:max-h-[250px] object-contain border border-slate-200 shadow-sm"
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 mt-3 px-3 sm:px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[0.75rem] sm:text-[0.78rem] font-medium">
                <span className="flex-shrink-0">⚠</span>
                {error}
              </div>
            )}

            {/* Progress */}
            {loading && (
              <div className="mt-3 sm:mt-4">
                <div className="flex justify-between text-[0.7rem] sm:text-[0.73rem] font-medium text-slate-500 mb-1.5">
                  <span className="truncate pr-2">{progressLabel}</span>
                  <span className="flex-shrink-0">{Math.round(progress)}%</span>
                </div>
                <div className="h-[5px] bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-2 sm:gap-2.5 mt-4 sm:mt-5">
              <button
                onClick={processVideo}
                disabled={!videoFile || loading}
                className={`w-full py-2.5 sm:py-3 px-5 rounded-lg text-[0.82rem] sm:text-[0.85rem] font-semibold flex items-center justify-center gap-2 transition-all duration-200
                  ${
                    !videoFile || loading
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-sky-600 text-white shadow-md shadow-sky-200 hover:bg-sky-700 hover:shadow-sky-300 hover:-translate-y-px"
                  }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spinner flex-shrink-0" />
                    Processing...
                  </>
                ) : (
                  "▶  Run Detection"
                )}
              </button>
              <button
                onClick={reset}
                className="w-full py-2.5 px-5 rounded-lg text-[0.8rem] sm:text-[0.82rem] font-medium text-slate-600 bg-transparent border border-slate-300 hover:bg-slate-50 hover:text-slate-800 transition-all duration-200"
              >
                ↺ Clear &amp; Reset
              </button>
            </div>
          </div>

          {/* RIGHT — Output */}
          <div
            className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm anim-fadeup"
            style={{ animationDelay: "0.08s" }}
          >
            <div className="flex items-center justify-between pb-3 sm:pb-4 mb-4 sm:mb-5 border-b border-slate-200">
              <div className="flex items-center gap-2 text-[0.75rem] sm:text-[0.8rem] font-bold uppercase tracking-widest text-slate-500">
                <span className="w-2 h-2 bg-sky-600 rounded-sm flex-shrink-0" />
                Detection Output
              </div>
              {results && (
                <span className="text-[0.7rem] sm:text-[0.72rem] font-semibold text-emerald-600 flex-shrink-0">
                  ● Complete
                </span>
              )}
            </div>

            {results ? (
              <div className="anim-fadeup">
                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-5">
                  <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-[1.5rem] sm:text-[1.75rem] font-bold text-sky-600 leading-none anim-popin">
                      {results.total}
                    </div>
                    <div className="text-[0.6rem] sm:text-[0.65rem] font-semibold uppercase tracking-widest text-slate-400 mt-1">
                      Total
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-[1.3rem] sm:text-[1.5rem] font-bold text-slate-700 leading-none anim-popin">
                      {results.frame_count}
                    </div>
                    <div className="text-[0.6rem] sm:text-[0.65rem] font-semibold uppercase tracking-widest text-slate-400 mt-1">
                      Frames
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 text-center">
                    <div
                      className="text-[1.3rem] sm:text-[1.5rem] font-bold leading-none anim-popin"
                      style={{ color: "#d97706" }}
                    >
                      {objectCounts.length}
                    </div>
                    <div className="text-[0.6rem] sm:text-[0.65rem] font-semibold uppercase tracking-widest text-slate-400 mt-1">
                      Classes
                    </div>
                  </div>
                </div>

                {/* Class breakdown — only actually detected objects */}
                {objectCounts.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 text-[0.68rem] sm:text-[0.7rem] font-bold uppercase tracking-widest text-slate-400 mb-2 sm:mb-2.5">
                      Detected Classes
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>
                    <div className="flex flex-col gap-1.5 mb-3 sm:mb-4">
                      {objectCounts.map(([name, count], i) => {
                        const color = BAR_COLORS[i % BAR_COLORS.length];
                        const pct = (count / maxCount) * 100;
                        return (
                          <div
                            key={name}
                            className="grid items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all duration-150"
                            style={{
                              gridTemplateColumns:
                                "minmax(80px,110px) 1fr 32px",
                            }}
                          >
                            <span className="text-[0.75rem] sm:text-[0.8rem] font-medium text-slate-800 capitalize truncate">
                              {name}
                            </span>
                            <div className="h-[5px] bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full anim-barin"
                                style={{ width: `${pct}%`, background: color }}
                              />
                            </div>
                            <span
                              className="text-[0.78rem] sm:text-[0.82rem] font-bold text-right"
                              style={{ color }}
                            >
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Note about ML accuracy — educates viewers */}
                    <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg mb-3 sm:mb-4">
                      <span className="text-amber-500 text-sm flex-shrink-0">
                        ℹ
                      </span>
                      <p className="text-[0.68rem] sm:text-[0.7rem] text-amber-700 leading-relaxed">
                        Only objects detected with ≥45% confidence are shown.
                        Visually similar objects may occasionally be
                        misclassified — this is normal behavior for any ML
                        model.
                      </p>
                    </div>
                  </>
                )}

                {/* Processed video */}
                {processedUrl && (
                  <div className="mb-3 sm:mb-4">
                    <p className="text-[0.68rem] sm:text-[0.7rem] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Processed Output
                    </p>
                    <video
                      key={videoKey}
                      ref={videoRef}
                      src={processedUrl}
                      controls
                      className="w-full rounded-lg max-h-[220px] sm:max-h-[250px] object-contain border border-slate-200 shadow-sm"
                      onError={() =>
                        setError(
                          "Video playback error. Use the download button.",
                        )
                      }
                    />
                  </div>
                )}

                {/* Meta */}
                <div className="flex justify-between items-center text-[0.67rem] sm:text-[0.7rem] text-slate-400 border-t border-slate-200 pt-2.5 sm:pt-3 mb-2.5 sm:mb-3">
                  <span>
                    Processed at{" "}
                    {new Date(results.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="truncate max-w-[120px] sm:max-w-[160px] ml-2">
                    {results.filename?.slice(0, 20)}…
                  </span>
                </div>

                {/* Download */}
                <button
                  onClick={downloadVideo}
                  className="w-full py-2.5 px-5 flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-300 rounded-lg text-[0.78rem] sm:text-[0.82rem] font-semibold text-emerald-700 hover:bg-emerald-100 hover:shadow-md hover:-translate-y-px transition-all duration-200"
                >
                  ↓ Download Annotated Video
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 gap-3 text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-xl sm:text-2xl">
                  ⬡
                </div>
                <p className="text-[0.85rem] sm:text-[0.88rem] font-semibold text-slate-600">
                  No Results Yet
                </p>
                <p className="text-[0.75rem] sm:text-[0.78rem] text-slate-400 leading-relaxed">
                  Upload a video on the left and
                  <br />
                  click Run Detection to see results here.
                </p>
              </div>
            )}
          </div>
        </main>

        {/* ── Footer ──────────────────────────────────────── */}
        <footer className="bg-white border-t border-slate-200 px-4 sm:px-6 py-3 sm:py-3.5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
            {/* Left — branding */}
            <span className="text-[0.7rem] sm:text-[0.72rem] text-slate-500 font-medium text-center sm:text-left">
              Object Detection System — YOLOv8 + FastAPI + React
            </span>

            {/* Center — made by */}
            <span className="text-[0.72rem] sm:text-[0.75rem] font-semibold text-slate-600 flex items-center gap-1">
              Made with{" "}
              <span className="text-red-500 text-base leading-none">♥</span> by
              Hamza
            </span>

            {/* Right — tech pills */}
            <div className="flex flex-wrap justify-center gap-1 sm:gap-1.5">
              {["Python 3.x", "Ultralytics", "OpenCV", "React", "FastAPI"].map(
                (t) => (
                  <span
                    key={t}
                    className="text-[0.62rem] sm:text-[0.68rem] font-medium text-slate-500 bg-slate-100 border border-slate-200 rounded px-1.5 sm:px-2 py-0.5"
                  >
                    {t}
                  </span>
                ),
              )}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
