import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { API_CONFIG } from "../config/constants";
import { Loader, Edit, Trash2, Plus, X, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import DataTable from "../components/common/DataTable";
import { UploadContext } from "../contexts/UploadContext";
import toast from "react-hot-toast";

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Global upload context
  const { uploadState, startUpload, updateProgress, completeUpload, cancelUpload, hasUnfinishedUpload, clearUnfinishedFlag } = useContext(UploadContext);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(8);

  // 🆕 Delete Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    file: null,
  });

  const token = localStorage.getItem("authToken");

  // Refetch videos function
  const refetchVideos = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await axios.get(`${API_CONFIG.baseURL}/media/video?page=1&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVideos(response.data.data.video || []);
      setTotalPages(response.data.data.totalPages || 1);
      setTotal(response.data.data.total || 0);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch videos from API
  useEffect(() => {
    const fetchVideos = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const response = await axios.get(`${API_CONFIG.baseURL}/media/video?page=${currentPage}&limit=${limit}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVideos(response.data.data.video || []);
        setTotalPages(response.data.data.totalPages || 1);
        setTotal(response.data.data.total || 0);
        setLimit(response.data.data.limit || 10);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [token, currentPage, limit]);

  // Skeleton Loader Component
  const VideoSkeleton = () => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 animate-pulse">
      <div className="relative pt-[56.25%] bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="flex justify-end gap-3 mt-4">
          <div className="w-9 h-9 bg-gray-200 rounded-xl" />
          <div className="w-9 h-9 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );

  // Handle input and file changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, file }));
  };

  // Open upload or edit modal
  const openModal = (video = null) => {
    if (video) {
      // Edit mode
      setIsEditing(true);
      setSelectedVideo(video);
      setFormData({
        title: video.title,
        description: video.description,
        category: video.category,
        file: null,
      });
    } else {
      // Upload mode
      setIsEditing(false);
      setFormData({ title: "", description: "", category: "", file: null });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
    setFormData({ title: "", description: "", category: "", file: null });
  };

  // Upload or update video
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.category) {
      toast.error("All fields are required.");
      return;
    }

    // If editing, don't require file
    if (!isEditing && !formData.file) {
      toast.error("Video file is required.");
      return;
    }

    try {
      if (isEditing && selectedVideo) {
        // ✅ Update existing video metadata only (no progress bar needed)
        const response = await axios.patch(
          `${API_CONFIG.baseURL}/media/video/${selectedVideo._id}`,
          {
            title: formData.title,
            description: formData.description,
            category: formData.category,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // Safely pick updated video object from response (handles different API shapes)
        const updatedFromResponse =
          response?.data?.data?.video || response?.data?.data || response?.data || {};

        setVideos((prev) =>
          prev.map((v) =>
            v._id === selectedVideo._id ? { ...v, ...updatedFromResponse } : v
          )
        );

        // Also refetch first page to ensure consistent server state
        try {
          await refetchVideos();
        } catch (err) {
          console.error("Refetch after update failed:", err);
        }

        toast.success("Video updated successfully!");
        closeModal();
      } else {
        // ✅ Upload new video to S3 with progress
        // Close modal immediately and show floating progress bar
        closeModal();
        startUpload(formData.file.name, formData.file.size);

        // Step 1: Get pre-signed URL from backend
        updateProgress(5, "preparing");
        const presignedRes = await axios.get(
          `${API_CONFIG.baseURL}/media/presigned-url`,
          {
            params: {
              fileName: formData.file.name,
              fileType: formData.file.type,
            },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const { url, key } = presignedRes.data;
        updateProgress(10, "uploading");

        // Step 2: Upload video directly to S3
        await axios.put(url, formData.file, {
          headers: { "Content-Type": formData.file.type },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            // Map S3 upload progress (0-100) to overall progress (10-85)
            updateProgress(Math.min(10 + (percent * 0.75), 85), "uploading");
          },
        });

        updateProgress(90, "saving");
        const s3Url = url.split("?")[0]; // Strip query params

        // Step 3: Save metadata to backend
        const metadataRes = await axios.post(
          `${API_CONFIG.baseURL}/media/video`,
          {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            url: s3Url,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        updateProgress(100, "finalizing");
        
        // Refetch videos list from API
        setTimeout(async () => {
          await refetchVideos();
          toast.success("Video uploaded successfully!");
          completeUpload();
        }, 800);
      }
    } catch (error) {
      console.error("Error uploading/updating video:", error);
      cancelUpload();
      if (error.response?.status === 413) {
        toast.error("File is too large. Maximum size is 500MB.");
      } else {
        toast.error("Failed to upload or update video. Please try again.");
      }
    }
  };

  // 🆕 Open delete modal
  const openDeleteModal = (video) => {
    setVideoToDelete(video);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setVideoToDelete(null);
    setIsDeleteModalOpen(false);
  };

  // Delete video
  // Delete video
  // 🆕 Delete video (API call)
  const handleDelete = async () => {
    if (!videoToDelete) return;
    setIsDeleting(true);

    try {
      await axios.delete(
        `${API_CONFIG.baseURL}/media/video/${videoToDelete._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Remove deleted video from UI
      setVideos((prev) => prev.filter((v) => v._id !== videoToDelete._id));
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting video:", error);
      alert("Failed to delete video.");
    } finally {
      setIsDeleting(false);
    }
  };

  const skeletonArray = Array.from({ length: 8 });

  return (
    <div className="">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-3xl font-bold text-gray-800">Videos</h3>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-[#22b573] text-white px-5 py-2 rounded-lg hover:bg-green-400 transition-all"
          disabled={uploadState.isUploading}
        >
          <Plus className="w-5 h-5" /> Upload New Video
        </button>
      </div>

      {/* Video Grid or Skeleton Loaders */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {skeletonArray.map((_, index) => (
            <VideoSkeleton key={index} />
          ))}
        </div>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {videos.map((video) => (
            <div
              key={video._id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-100"
            >
              <div className="relative pt-[56.25%] bg-gray-100">
                <video
                  controls
                  className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
                >
                  <source src={video.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              <div className="p-4 space-y-2">
                <h4 className="font-semibold text-lg text-gray-900 truncate">
                  {video?.title}
                </h4>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {video?.description}
                </p>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {video?.category}
                </p>

                {/* Action buttons */}
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => openModal(video)}
                    className="p-2  text-black border-2 rounded-xl hover:bg-gray-500 hover:text-white transition"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(video)} // Open the delete modal when clicked
                    className="p-2 text-black border-2 hover:bg-red-500 hover:text-white rounded-xl transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-center mt-12">
          No videos available yet.
        </p>
      )}

      {/* Pagination Controls */}
      {videos.length > 0 && (
        <div className="flex justify-between items-center mt-8">
          <p className="text-sm text-gray-600">
            Showing page <span className="font-semibold">{currentPage}</span> of{" "}
            <span className="font-semibold">{totalPages}</span> (Total:{" "}
            <span className="font-semibold">{total}</span> videos)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || loading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 🆕 Delete Confirmation Modal */}
      {isDeleteModalOpen && videoToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full sm:w-96 p-6 relative">
            <button
              onClick={closeDeleteModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mb-3" />
              <h4 className="text-xl font-semibold text-gray-800 mb-2">
                Delete this video?
              </h4>
              <p className="text-gray-600 mb-5">
                You are about to permanently delete <b>{videoToDelete.title}</b>
                . This action cannot be undone.
              </p>

              <div className="flex justify-center gap-4 w-full">
                <button
                  onClick={closeDeleteModal}
                  className="w-1/2 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className={`w-1/2 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition ${
                    isDeleting ? "opacity-60 cursor-wait" : ""
                  }`}
                >
                  {isDeleting ? (
                    <Loader className="w-4 h-4 animate-spin inline-block" />
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full sm:w-96 p-6 relative overflow-hidden">
            {/* Close Button */}
            <button
              onClick={closeModal}
              disabled={uploadState.isUploading}
              className={`absolute top-4 right-4 ${uploadState.isUploading ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Upload Progress Overlay */}
            {uploadState.isUploading && (
              <div className="absolute inset-0 bg-white flex flex-col items-center justify-center rounded-xl">
                {/* Animated Upload Icon */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 rounded-full bg-[#22b573] opacity-20 animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#22b573] to-green-400 flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-white animate-bounce"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a2 2 0 00-2-2H8a2 2 0 00-2 2v4m10-4a2 2 0 00-2-2H8a2 2 0 00-2 2m10 0V7a2 2 0 00-2-2H8a2 2 0 00-2 2"
                      />
                    </svg>
                  </div>
                </div>

                {/* Main Message */}
                <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                  Video Upload in Progress
                </h3>
                <p className="text-gray-500 text-center mb-6 text-sm">
                  Please do not close this window
                </p>

                {/* File Information */}
                {uploadState.fileName && (
                  <div className="w-full mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">File:</p>
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {uploadState.fileName}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {(uploadState.fileSize / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                )}

                {/* Progress Bar with Percentage */}
                <div className="w-full space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Loader className="w-4 h-4 text-[#22b573] animate-spin" />
                      <span className="text-sm font-medium text-gray-700">
                        {uploadState.progress === 100
                          ? "Finalizing..."
                          : uploadState.progress > 85
                          ? "Saving to Database..."
                          : uploadState.progress > 10
                          ? "Uploading to Server..."
                          : "Preparing..."}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-[#22b573]">
                      {uploadState.progress}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-sm">
                    <div
                      className="bg-gradient-to-r from-[#22b573] via-green-400 to-emerald-500 h-full rounded-full transition-all duration-300 ease-out shadow-lg"
                      style={{ width: `${uploadState.progress}%` }}
                    />
                  </div>
                </div>

                {/* Status Messages */}
                <div className="w-full space-y-2">
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

            {/* Original Form (Hidden During Upload) */}
            <div className={uploadState.isUploading ? "opacity-0 pointer-events-none" : ""}>
              <h4 className="text-2xl font-semibold mb-6 text-center text-gray-800">
                {isEditing ? "Edit Video" : "Upload New Video"}
              </h4>

              <form onSubmit={handleUpload} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    disabled={uploadState.isUploading}
                    className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    disabled={uploadState.isUploading}
                    className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    disabled={uploadState.isUploading}
                    className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                {!isEditing && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Choose Video File
                    </label>
                    <div className="space-y-2">
                      <label
                        htmlFor="file"
                        className={`block p-3 text-center rounded-lg cursor-pointer transition ${
          uploadState.isUploading ? "bg-gray-200 text-gray-400 cursor-not-allowed" : formData.file
          ? "bg-[#22b573] text-white hover:bg-green-400"
          : "bg-white text-black border-2 border-green-300 hover:bg-[#6bc29b]"
        }`}
                      >
                        {formData.file ? "Choose different file" : "Choose a file"}
                      </label>
                      {formData.file && (
                        <p className="text-sm text-gray-600 truncate font-medium">
                          📄 {formData.file.name}
                        </p>
                      )}
                    </div>

                    <input
                      type="file"
                      id="file"
                      name="file"
                      onChange={handleFileChange}
                      disabled={uploadState.isUploading}
                      className="hidden"
                      accept="video/*"
                      required={!isEditing}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploadState.isUploading}
                  className={`w-full flex justify-center items-center gap-2 py-3 mt-4 bg-[#22b573] text-white font-semibold rounded-lg hover:bg-green-400 transition ${
                    uploadState.isUploading ? "opacity-60 cursor-wait" : ""
                  }`}
                >
                  {uploadState.isUploading ? (
                    <>
                      <Loader className="animate-spin w-4 h-4" />
                      <span>
                        {uploadState.progress === 100
                          ? "Finalizing..."
                          : uploadState.progress > 85
                          ? "Saving..."
                          : "Uploading..."}
                      </span>
                    </>
                  ) : (
                    `${isEditing ? "Save Changes" : "Upload Video"}`
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Videos;
