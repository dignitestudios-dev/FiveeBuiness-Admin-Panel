import { createContext, useState, useCallback, useEffect } from "react";

export const UploadContext = createContext();

export const UploadProvider = ({ children }) => {
  const [uploadState, setUploadState] = useState({
    isUploading: false,
    progress: 0,
    fileName: "",
    fileSize: 0,
    status: "", // "preparing", "uploading", "saving", "finalizing"
  });

  const [hasUnfinishedUpload, setHasUnfinishedUpload] = useState(false);

  // Initialize from sessionStorage on mount
  useEffect(() => {
    const savedUploadState = sessionStorage.getItem("uploadState");
    if (savedUploadState) {
      try {
        const parsed = JSON.parse(savedUploadState);
        // Only restore if it was in the middle of uploading
        if (parsed.isUploading && parsed.progress > 0 && parsed.progress < 100) {
          setHasUnfinishedUpload(true);
          // Don't auto-restore state, just flag it for user notification
        } else {
          sessionStorage.removeItem("uploadState");
        }
      } catch (error) {
        console.error("Error parsing saved upload state:", error);
      }
    }
  }, []);

  // Persist upload state to sessionStorage
  useEffect(() => {
    if (uploadState.isUploading) {
      sessionStorage.setItem("uploadState", JSON.stringify(uploadState));
    }
  }, [uploadState]);

  const startUpload = useCallback((fileName, fileSize) => {
    setUploadState({
      isUploading: true,
      progress: 0,
      fileName,
      fileSize,
      status: "preparing",
    });
  }, []);

  const updateProgress = useCallback((progress, status) => {
    setUploadState((prev) => ({
      ...prev,
      progress: Math.min(progress, 100),
      status: status || prev.status,
    }));
  }, []);

  const completeUpload = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      fileName: "",
      fileSize: 0,
      status: "",
    });
    sessionStorage.removeItem("uploadState");
    setHasUnfinishedUpload(false);
  }, []);

  const cancelUpload = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      fileName: "",
      fileSize: 0,
      status: "",
    });
    sessionStorage.removeItem("uploadState");
  }, []);

  const clearUnfinishedFlag = useCallback(() => {
    setHasUnfinishedUpload(false);
  }, []);

  return (
    <UploadContext.Provider
      value={{
        uploadState,
        startUpload,
        updateProgress,
        completeUpload,
        cancelUpload,
        hasUnfinishedUpload,
        clearUnfinishedFlag,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
};
