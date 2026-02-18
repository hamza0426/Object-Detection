import React, { useState, useRef } from "react";

function App() {
  const [videoFile, setVideoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [results, setResults] = useState(null);
  const [processedVideoUrl, setProcessedVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [videoKey, setVideoKey] = useState(Date.now());

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const API_URL = "http://localhost:8000";

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError("File too large. Max 100MB allowed.");
      return;
    }

    setVideoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResults(null);
    setProcessedVideoUrl(null);
    setError("");
  };

  // Process video
  const processVideo = async () => {
    if (!videoFile) return;

    setLoading(true);
    setError("");
    setProcessedVideoUrl(null);
    setResults(null);

    const formData = new FormData();
    formData.append("video", videoFile);

    try {
      const response = await fetch(`${API_URL}/process-video`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Processing failed");
      }

      console.log("Processing complete:", data);

      setResults(data);

      // Video URL with cache busting
      if (data.video_url) {
        const videoUrl = `${API_URL}${data.video_url}?t=${Date.now()}`;
        setProcessedVideoUrl(videoUrl);
        setVideoKey(Date.now());
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Failed to process video.");
    } finally {
      setLoading(false);
    }
  };

  // Download video
  const downloadVideo = () => {
    if (results?.download_url) {
      const link = document.createElement("a");
      link.href = `${API_URL}${results.download_url}`;
      link.download = `processed_${results.filename}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Reset everything
  const resetAll = () => {
    setVideoFile(null);
    setPreviewUrl(null);
    setResults(null);
    setProcessedVideoUrl(null);
    setError("");
    setVideoKey(Date.now());
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleVideoError = (e) => {
    const video = e.target;
    const errorCode = video?.error?.code;
    const errorMessage = video?.error?.message || "Unknown error";

    const errorDetails = {
      code: errorCode,
      message: errorMessage,
      url: video?.src,
    };

    console.error("Video playback error:", errorDetails);
    setError("Video failed to load. You can still download it.");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <header className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
          🍎 Fruit Detection & Counting System
        </h1>
        <p className="text-gray-600 text-lg">
          Digital Image Processing Project - Detect, track, and count fruits by
          size
        </p>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Upload */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            📁 Upload Video
          </h2>
          <div
            className="border-3 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50 hover:bg-blue-50"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
            {videoFile ? (
              <div className="space-y-3">
                <div className="text-green-500 text-5xl mb-3">✅</div>
                <p className="font-semibold text-gray-800 text-lg truncate">
                  {videoFile.name}
                </p>
              </div>
            ) : (
              <div className="text-gray-400 text-6xl">📁</div>
            )}
          </div>

          {previewUrl && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Original Video Preview
              </h3>
              <video
                src={previewUrl}
                controls
                className="w-full h-48 md:h-64 object-contain rounded-lg shadow-md bg-black"
              />
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <button
              onClick={processVideo}
              disabled={!videoFile || loading}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg text-white ${
                !videoFile || loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              }`}
            >
              {loading ? "Processing Video..." : "🚀 Detect & Count Fruits"}
            </button>

            <button
              onClick={resetAll}
              className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700"
            >
              🔄 Reset
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            📊 Detection Results
          </h2>

          {results ? (
            <>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">
                  🎥 Processed Video
                </h3>
                {processedVideoUrl ? (
                  <video
                    key={videoKey}
                    ref={videoRef}
                    src={processedVideoUrl}
                    controls
                    className="w-full h-64 md:h-72 object-contain rounded-lg shadow-lg bg-black"
                    onError={handleVideoError}
                  />
                ) : (
                  <p className="text-gray-500">Processed video loading...</p>
                )}
              </div>

              {/* Report */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-bold mb-2">Detection Summary</h3>
                <p>Total Frames: {results.frame_count}</p>
                <p className="font-semibold text-gray-700 mt-3 mb-2">
                  Top Detected Objects:
                </p>
                {(() => {
                  const objectCounts = Object.entries(results)
                    .filter(
                      ([key]) =>
                        ![
                          "frame_count",
                          "timestamp",
                          "video_url",
                          "download_url",
                          "filename",
                          "total",
                        ].includes(key),
                    )
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5);

                  return objectCounts.length > 0 ? (
                    objectCounts.map(([name, count]) => (
                      <p key={name} className="text-gray-600">
                        {name}: <span className="font-semibold">{count}</span>
                      </p>
                    ))
                  ) : (
                    <p className="text-gray-500">No objects detected</p>
                  );
                })()}
                <p className="mt-3 border-t pt-3">
                  Total Unique: {results.total}
                </p>
                <p className="text-sm text-gray-500">
                  Processed at:{" "}
                  {new Date(results.timestamp).toLocaleTimeString()}
                </p>
              </div>

              <button
                onClick={downloadVideo}
                className="mt-4 w-full py-3 px-6 bg-green-500 hover:bg-green-600 rounded-xl font-semibold text-white"
              >
                ⬇️ Download Processed Video
              </button>
            </>
          ) : (
            <p className="text-gray-400">No results yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
