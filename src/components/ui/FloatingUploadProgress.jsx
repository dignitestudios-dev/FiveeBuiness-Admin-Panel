import { useContext, useState } from "react";
import { UploadContext } from "../../contexts/UploadContext";
import { Loader, X, ChevronDown } from "lucide-react";

const FloatingUploadProgress = () => {
  const { uploadState, cancelUpload } = useContext(UploadContext);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!uploadState.isUploading) {
    return null;
  }

  const getStatusText = () => {
    if (uploadState.progress === 100) return "Finalizing...";
    if (uploadState.progress > 85) return "Saving to Database...";
    if (uploadState.progress > 10) return "Uploading to Server...";
    return "Preparing...";
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header - Always Visible */}
      <div className="bg-gradient-to-r from-[#22b573] to-green-400 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Loader className="w-4 h-4 animate-spin" />
            <h3 className="font-semibold">Video Upload in Progress</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white/60 hover:text-white transition-colors p-1"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isMinimized ? "-rotate-90" : ""
                }`}
              />
            </button>
            <button
              onClick={cancelUpload}
              className="text-white/60 hover:text-white transition-colors p-1"
              title="Cancel upload"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {!isMinimized && (
          <p className="text-sm text-white/80 mt-2">
            Do not close the window or navigate away
          </p>
        )}
      </div>

      {/* Content - Hidden When Minimized */}
      {!isMinimized && (
        <div className="w-96 p-4 space-y-3">
          {/* File Info */}
          <div className="text-sm">
            <p className="text-gray-600 mb-1">File:</p>
            <p className="text-gray-800 font-medium truncate">
              {uploadState.fileName}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {(uploadState.fileSize / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-700">
                {getStatusText()}
              </span>
              <span className="text-sm font-bold text-[#22b573]">
                {uploadState.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#22b573] via-green-400 to-emerald-500 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadState.progress}%` }}
              />
            </div>
          </div>

          {/* Status Steps */}
          <div className="space-y-1.5 pt-2 border-t border-gray-200">
            {uploadState.progress >= 5 && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22b573]" />
                <span>Getting upload credentials</span>
              </div>
            )}
            {uploadState.progress >= 10 && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22b573]" />
                <span>Uploading video file</span>
              </div>
            )}
            {uploadState.progress >= 85 && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22b573]" />
                <span>Saving video information</span>
              </div>
            )}
            {uploadState.progress >= 95 && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22b573]" />
                <span>Completing upload</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingUploadProgress;
