import { useState, useEffect } from "react";
import axios from "axios";
import { API_CONFIG } from "../config/constants";
import { Loader, Edit, Trash2, Plus, X, AlertTriangle } from "lucide-react";
import DataTable from "../components/common/DataTable";
import toast from "react-hot-toast";

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

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

  // Fetch videos from API
  useEffect(() => {
    const fetchVideos = async () => {
      if (!token) return;

      try {
        const response = await axios.get(`${API_CONFIG.baseURL}/media/video`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVideos(response.data.data.video || []);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [token]);

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
      alert("All fields are required.");
      return;
    }

    setIsUploading(true);

    const videoData = new FormData();
    videoData.append("title", formData.title);
    videoData.append("description", formData.description);
    videoData.append("category", formData.category);
    if (formData.file) videoData.append("file", formData.file);

    try {
      if (isEditing && selectedVideo) {
        // ✅ Update existing video with PATCH request
        const response = await axios.patch(
          `${API_CONFIG.baseURL}/media/video/${selectedVideo._id}`,
          videoData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setVideos((prev) =>
          prev.map((v) =>
            v._id === selectedVideo._id ? response.data.data : v
          )
        );
      } else {
        // ✅ Upload new video (POST request)
        const response = await axios.post(
          `${API_CONFIG.baseURL}/media/video`,
          videoData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setVideos((prev) => [response.data.data, ...prev]);
      }

      // Close the modal
      closeModal();

      // Reload the page to get the updated list of videos
      window.location.reload();
    } catch (error) {
      console.error("Error uploading/updating video:", error);
      toast.error("Failed to upload or update video.");
    } finally {
      setIsUploading(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-600">
        <Loader className="animate-spin w-6 h-6 mr-2" /> Loading videos...
      </div>
    );
  }

  return (
    <div className="">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-3xl font-bold text-gray-800">Videos</h3>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-[#22b573] text-white px-5 py-2 rounded-lg hover:bg-green-400 transition-all"
        >
          <Plus className="w-5 h-5" /> Upload New Video
        </button>
      </div>

      {/* Video Grid */}
      {videos.length > 0 ? (
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
          <div className="bg-white rounded-xl shadow-xl w-full sm:w-96 p-6 relative">
            <button
              onClick={closeModal}
              disabled={isUploading}
              className={`absolute top-4 right-4 ${isUploading ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <X className="w-5 h-5" />
            </button>

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
                  disabled={isUploading}
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
                  disabled={isUploading}
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
                  disabled={isUploading}
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
        isUploading ? "bg-gray-200 text-gray-400 cursor-not-allowed" : formData.file
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
                    disabled={isUploading}
                    className="hidden"
                    accept="video/*"
                    required={!isEditing}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isUploading}
                className={`w-full flex justify-center items-center gap-2 py-3 mt-4 bg-[#22b573] text-white font-semibold rounded-lg hover:bg-green-400 transition ${
                  isUploading ? "opacity-60 cursor-wait" : ""
                }`}
              >
                {isUploading && <Loader className="animate-spin w-4 h-4" />}
                {isEditing ? "Save Changes" : "Upload Video"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Videos;
