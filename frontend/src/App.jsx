// import React, { useState, useRef, useEffect } from "react";

// function App() {
//   const [videoFile, setVideoFile] = useState(null);
//   const [previewUrl, setPreviewUrl] = useState(null);
//   const [results, setResults] = useState(null);
//   const [processedVideoUrl, setProcessedVideoUrl] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [videoKey, setVideoKey] = useState(Date.now());

//   const fileInputRef = useRef(null);
//   const videoRef = useRef(null);

//   const API_URL = "http://localhost:5000";

//   // Handle file selection
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     // Validate file type
//     if (!file.type.startsWith("video/")) {
//       setError("Please select a valid video file");
//       return;
//     }

//     // Validate file size (max 100MB)
//     if (file.size > 100 * 1024 * 1024) {
//       setError("File size too large. Maximum 100MB allowed.");
//       return;
//     }

//     setVideoFile(file);
//     setPreviewUrl(URL.createObjectURL(file));
//     setResults(null);
//     setProcessedVideoUrl(null);
//     setError("");
//   };

//   // Process video
//   const processVideo = async () => {
//     if (!videoFile) {
//       setError("Please select a video file first");
//       return;
//     }

//     setLoading(true);
//     setError("");

//     const formData = new FormData();
//     formData.append("video", videoFile);

//     try {
//       console.log("Starting video processing...");

//       const response = await fetch(`${API_URL}/process-video`, {
//         method: "POST",
//         body: formData,
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || "Processing failed");
//       }

//       console.log("Processing complete:", data);
//       setResults(data);

//       // Build video URL with cache busting
//       if (data.video_url) {
//         const videoUrl = `${API_URL}${data.video_url}?t=${Date.now()}`;
//         console.log("Video URL:", videoUrl);
//         setProcessedVideoUrl(videoUrl);
//         setVideoKey(Date.now());
//       }
//     } catch (err) {
//       console.error("Error:", err);
//       setError(err.message || "Failed to process video. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Download processed video
//   const downloadVideo = () => {
//     if (results?.download_url) {
//       const downloadUrl = `${API_URL}${results.download_url}`;
//       const link = document.createElement("a");
//       link.href = downloadUrl;
//       link.download = `processed_${results.filename}`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     }
//   };

//   // Reset everything
//   const resetAll = () => {
//     setVideoFile(null);
//     setPreviewUrl(null);
//     setResults(null);
//     setProcessedVideoUrl(null);
//     setError("");
//     setVideoKey(Date.now());
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   // Handle video errors
//   const handleVideoError = (e) => {
//     console.error("Video playback error:", e);
//     setError(
//       "Video failed to load. You can still download the processed video."
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
//       {/* Header */}
//       <header className="text-center mb-8 md:mb-12">
//         <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
//           🍎 Fruit Detection & Counting System
//         </h1>
//         <p className="text-gray-600 text-lg">
//           Digital Image Processing Project - Detect, track, and count fruits by
//           size
//         </p>
//       </header>

//       <div className="max-w-7xl mx-auto">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
//           {/* Left Column - Upload & Controls */}
//           <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
//             <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
//               <span className="mr-3">📁</span> Upload Video
//             </h2>

//             {/* File Upload Area */}
//             <div className="mb-6">
//               <label className="block text-gray-700 font-medium mb-3">
//                 Select Video File
//               </label>
//               <div
//                 className="border-3 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50 hover:bg-blue-50"
//                 onClick={() => fileInputRef.current?.click()}
//               >
//                 <input
//                   type="file"
//                   accept="video/*"
//                   onChange={handleFileChange}
//                   ref={fileInputRef}
//                   className="hidden"
//                   id="videoUpload"
//                 />
//                 <div className="cursor-pointer">
//                   {videoFile ? (
//                     <div className="space-y-3">
//                       <div className="text-green-500 text-5xl mb-3">✅</div>
//                       <p className="font-semibold text-gray-800 text-lg truncate">
//                         {videoFile.name}
//                       </p>
//                       <p className="text-gray-600">
//                         Size: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
//                       </p>
//                     </div>
//                   ) : (
//                     <div className="space-y-4">
//                       <div className="text-6xl text-gray-400 mb-3">📁</div>
//                       <p className="text-gray-700 font-medium text-lg">
//                         Click to select video
//                       </p>
//                       <p className="text-gray-500 text-sm">
//                         Supports: MP4, AVI, MOV, MKV, WEBM • Max 100MB
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Original Video Preview */}
//             {previewUrl && (
//               <div className="mb-6">
//                 <h3 className="text-lg font-semibold text-gray-700 mb-3">
//                   📹 Original Video Preview
//                 </h3>
//                 <div className="rounded-lg overflow-hidden shadow-md bg-black">
//                   <video
//                     src={previewUrl}
//                     controls
//                     className="w-full h-48 md:h-64 object-contain"
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Error Message */}
//             {error && (
//               <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
//                 <span className="text-red-500 mr-3 mt-1">⚠️</span>
//                 <div className="flex-1">
//                   <p className="text-red-700 font-medium">Error</p>
//                   <p className="text-red-600 text-sm mt-1">{error}</p>
//                 </div>
//                 <button
//                   onClick={() => setError("")}
//                   className="text-red-500 hover:text-red-700 ml-2"
//                 >
//                   ✕
//                 </button>
//               </div>
//             )}

//             {/* Action Buttons */}
//             <div className="space-y-4 mb-6">
//               <button
//                 onClick={processVideo}
//                 disabled={!videoFile || loading}
//                 className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
//                   !videoFile || loading
//                     ? "bg-gray-400 cursor-not-allowed"
//                     : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
//                 } text-white`}
//               >
//                 {loading ? (
//                   <div className="flex items-center justify-center">
//                     <svg
//                       className="animate-spin h-6 w-6 mr-3 text-white"
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                     >
//                       <circle
//                         className="opacity-25"
//                         cx="12"
//                         cy="12"
//                         r="10"
//                         stroke="currentColor"
//                         strokeWidth="4"
//                       ></circle>
//                       <path
//                         className="opacity-75"
//                         fill="currentColor"
//                         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                       ></path>
//                     </svg>
//                     Processing Video...
//                   </div>
//                 ) : (
//                   <div className="flex items-center justify-center">
//                     <span className="mr-2">🚀</span> Detect & Count Fruits
//                   </div>
//                 )}
//               </button>

//               <button
//                 onClick={resetAll}
//                 className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-colors"
//               >
//                 🔄 Reset & Upload New Video
//               </button>
//             </div>

//             {/* Instructions */}
//             <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
//               <h4 className="font-bold text-blue-800 mb-3 flex items-center">
//                 <span className="mr-2">📋</span> How to Use
//               </h4>
//               <ol className="list-decimal pl-5 text-gray-700 space-y-2">
//                 <li>
//                   Upload a video containing fruits (tomatoes, oranges, etc.)
//                 </li>
//                 <li>Click "Detect & Count Fruits" to process</li>
//                 <li>View results with colored circles around each fruit</li>
//                 <li>Download the processed video</li>
//               </ol>
//               <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
//                 <p className="text-sm text-blue-700">
//                   <span className="font-bold">Detection Method:</span>{" "}
//                   Color-based segmentation + Contour detection + Object tracking
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Right Column - Results */}
//           <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
//             <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
//               <span className="mr-3">📊</span> Detection Results
//             </h2>

//             {results ? (
//               <>
//                 {/* Results Summary Cards */}
//                 <div className="mb-8">
//                   <h3 className="text-xl font-semibold text-gray-700 mb-4">
//                     Fruit Count by Size
//                   </h3>
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                     {/* Small Card */}
//                     <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-300 text-center transform hover:scale-105 transition-transform">
//                       <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
//                         {results.small}
//                       </div>
//                       <div className="font-semibold text-gray-800">Small</div>
//                       <div className="text-xs text-gray-500 mt-1">
//                         Radius &lt; 20px
//                       </div>
//                     </div>

//                     {/* Medium Card */}
//                     <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-5 rounded-xl border-2 border-yellow-300 text-center transform hover:scale-105 transition-transform">
//                       <div className="text-3xl md:text-4xl font-bold text-yellow-600 mb-2">
//                         {results.medium}
//                       </div>
//                       <div className="font-semibold text-gray-800">Medium</div>
//                       <div className="text-xs text-gray-500 mt-1">20-35px</div>
//                     </div>

//                     {/* Large Card */}
//                     <div className="bg-gradient-to-br from-red-50 to-pink-50 p-5 rounded-xl border-2 border-red-300 text-center transform hover:scale-105 transition-transform">
//                       <div className="text-3xl md:text-4xl font-bold text-red-600 mb-2">
//                         {results.large}
//                       </div>
//                       <div className="font-semibold text-gray-800">Large</div>
//                       <div className="text-xs text-gray-500 mt-1">
//                         &gt; 35px
//                       </div>
//                     </div>

//                     {/* Total Card */}
//                     <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-blue-300 text-center transform hover:scale-105 transition-transform">
//                       <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
//                         {results.total}
//                       </div>
//                       <div className="font-semibold text-gray-800">Total</div>
//                       <div className="text-xs text-gray-500 mt-1">
//                         Unique Fruits
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Processed Video */}
//                 <div className="mb-8">
//                   <h3 className="text-xl font-semibold text-gray-700 mb-4">
//                     🎥 Processed Video with Detection
//                   </h3>

//                   {processedVideoUrl ? (
//                     <div className="space-y-4">
//                       <div className="relative rounded-xl overflow-hidden shadow-lg bg-black">
//                         <video
//                           key={videoKey}
//                           ref={videoRef}
//                           src={processedVideoUrl}
//                           controls
//                           className="w-full h-64 md:h-72 object-contain"
//                           onError={handleVideoError}
//                           onLoadedData={() =>
//                             console.log("Video loaded successfully")
//                           }
//                         >
//                           Your browser does not support the video tag.
//                         </video>
//                       </div>

//                       {/* Legend */}
//                       <div className="flex flex-wrap justify-center gap-4 md:gap-6 p-4 bg-gray-50 rounded-lg">
//                         <div className="flex items-center">
//                           <div className="w-5 h-5 rounded-full bg-green-500 mr-2 border-2 border-white shadow"></div>
//                           <span className="text-sm font-medium text-gray-700">
//                             Small (Green)
//                           </span>
//                         </div>
//                         <div className="flex items-center">
//                           <div className="w-5 h-5 rounded-full bg-yellow-500 mr-2 border-2 border-white shadow"></div>
//                           <span className="text-sm font-medium text-gray-700">
//                             Medium (Orange)
//                           </span>
//                         </div>
//                         <div className="flex items-center">
//                           <div className="w-5 h-5 rounded-full bg-red-500 mr-2 border-2 border-white shadow"></div>
//                           <span className="text-sm font-medium text-gray-700">
//                             Large (Red)
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="text-center py-12 bg-gray-50 rounded-xl">
//                       <div className="text-5xl text-gray-300 mb-4">📹</div>
//                       <p className="text-gray-500">
//                         Processed video will appear here
//                       </p>
//                     </div>
//                   )}
//                 </div>

//                 {/* Download Button */}
//                 <div className="mb-8">
//                   <button
//                     onClick={downloadVideo}
//                     className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl font-semibold text-white text-lg shadow-lg transition-all duration-300 transform hover:-translate-y-1"
//                   >
//                     <div className="flex items-center justify-center">
//                       <span className="mr-3">⬇️</span> Download Processed Video
//                     </div>
//                   </button>
//                   <p className="text-center text-gray-500 text-sm mt-3">
//                     Video includes colored circles around each detected fruit
//                     with tracking IDs
//                   </p>
//                 </div>

//                 {/* Results Details */}
//                 <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-5 border border-gray-200">
//                   <h4 className="font-bold text-gray-800 mb-4 flex items-center">
//                     <span className="mr-2">📋</span> Detection Summary
//                   </h4>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <div className="flex justify-between items-center p-2 bg-white rounded-lg">
//                         <span className="text-gray-600">Total Frames:</span>
//                         <span className="font-bold">{results.frame_count}</span>
//                       </div>
//                       <div className="flex justify-between items-center p-2 bg-white rounded-lg">
//                         <span className="text-gray-600">Small Fruits:</span>
//                         <span className="font-bold text-green-600">
//                           {results.small}
//                         </span>
//                       </div>
//                       <div className="flex justify-between items-center p-2 bg-white rounded-lg">
//                         <span className="text-gray-600">Medium Fruits:</span>
//                         <span className="font-bold text-yellow-600">
//                           {results.medium}
//                         </span>
//                       </div>
//                     </div>
//                     <div className="space-y-2">
//                       <div className="flex justify-between items-center p-2 bg-white rounded-lg">
//                         <span className="text-gray-600">Large Fruits:</span>
//                         <span className="font-bold text-red-600">
//                           {results.large}
//                         </span>
//                       </div>
//                       <div className="flex justify-between items-center p-2 bg-white rounded-lg">
//                         <span className="text-gray-600">Total Unique:</span>
//                         <span className="font-bold text-blue-600">
//                           {results.total}
//                         </span>
//                       </div>
//                       <div className="flex justify-between items-center p-2 bg-white rounded-lg">
//                         <span className="text-gray-600">Processing Time:</span>
//                         <span className="font-bold">
//                           {new Date(results.timestamp).toLocaleTimeString()}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </>
//             ) : (
//               /* No Results Placeholder */
//               <div className="text-center py-16">
//                 <div className="text-7xl text-gray-200 mb-6">📈</div>
//                 <h3 className="text-2xl font-semibold text-gray-400 mb-4">
//                   No Results Yet
//                 </h3>
//                 <p className="text-gray-500 mb-8 max-w-md mx-auto">
//                   Upload and process a video to see detection results with
//                   colored circles around each fruit
//                 </p>
//                 <div className="max-w-md mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
//                   <p className="text-gray-700">
//                     <span className="font-bold">Expected Output:</span> Each
//                     fruit will have a colored circle based on its size, with
//                     tracking IDs for accurate counting.
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Footer */}
//         <footer className="mt-12 pt-8 border-t border-gray-200 text-center">
//           <p className="text-gray-600 mb-2 font-medium">
//             Digital Image Processing Project • Object Detection & Counting
//             System
//           </p>
//           <p className="text-sm text-gray-500">
//             Color Segmentation + Contour Detection + Object Tracking | Accuracy:
//             70-80% for moving/still objects
//           </p>
//         </footer>
//       </div>
//     </div>
//   );
// }

// export default App;

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
                <p>Small Fruits: {results.small}</p>
                <p>Medium Fruits: {results.medium}</p>
                <p>Large Fruits: {results.large}</p>
                <p>Total Unique: {results.total}</p>
                <p>
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
