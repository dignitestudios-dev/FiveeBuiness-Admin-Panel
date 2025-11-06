import { useState, useEffect } from "react";
import axios from "axios";
import { API_CONFIG } from "../config/constants";
import { Send, Eye, Trash2, Plus } from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import TextArea from "../components/ui/TextArea";
import Select from "../components/ui/Select";
import { useForm } from "react-hook-form";
import { formatDateTime } from "../utils/helpers";
import { useAuth } from "../contexts/AuthContext";

const Notifications = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [creating, setCreating] = useState(false);

  // ✅ Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalData, setTotalData] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const watchType = watch("type");
  const token = localStorage.getItem("authToken");

  // ✅ Fetch notifications with pagination
  const fetchNotifications = async () => {
    if (!token || !isAuthenticated) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API_CONFIG.baseURL}/notification`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: currentPage,
          limit: pageSize,
        },
      });

      const data = response.data.data;
      const notificationsList = data.notifications || [];

      setNotifications(notificationsList);
      setTotalData(data.total || notificationsList.length);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [isAuthenticated, token, currentPage, pageSize]);

  // Table columns
  const columns = [
    {
      key: "title",
      label: "Title",
      render: (value, notification) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500 truncate max-w-xs">
            {notification.message}
          </p>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (value) => (
        <p className="font-medium text-gray-900 dark:text-white">{value}</p>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (value) => (
        <p className="text-sm">{new Date(value).toLocaleDateString()}</p>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, notification) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(notification)}
            icon={<Eye className="w-4 h-4" />}
            title="View Details"
          />
          {user?.role === "admin" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(notification)}
              icon={<Trash2 className="w-4 h-4" />}
              title="Delete"
            />
          )}
        </div>
      ),
    },
  ];

  // Handlers
  const handleCreate = () => {
    reset();
    setShowCreateModal(true);
  };

  const handleView = (notification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);
  };

  const handleDelete = async (notification) => {
    if (confirm(`Delete notification "${notification.title}"?`)) {
      try {
        await axios.delete(`${API_CONFIG.baseURL}/notification/${notification.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchNotifications(); // ✅ refetch after deletion
      } catch (error) {
        console.error("Error deleting notification:", error);
      }
    }
  };

  // ✅ Create Notification API
  const onSubmit = async (data) => {
    setCreating(true);
    try {
      const payload = {
        title: data.title,
        message: data.message,
        type: data.type || "instant",
        scheduledAt: data.scheduledAt || new Date().toISOString(),
      };

      await axios.post(`${API_CONFIG.baseURL}/notification`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowCreateModal(false);
      reset();
      fetchNotifications(); // ✅ refetch after creation
    } catch (error) {
      console.error("Error creating notification:", error);
      alert("Failed to create notification. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  if (authLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="text-right">
        <Button variant="primary" onClick={handleCreate} icon={<Plus />}>
          Add Notification
        </Button>
      </div>

      {/* ✅ DataTable with pagination support */}
      <DataTable
        title="Push Notification"
        columns={columns}
        data={notifications}
        loading={loading}
        totalData={totalData}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        noDataMessage="No notifications available"
      />

      {/* Create Notification Modal */}
      <Modal
        isOpen={showCreateModal}
        title="Create Notification"
        onClose={() => setShowCreateModal(false)}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Title"
            placeholder="Enter notification title"
            {...register("title", { required: "Title is required" })}
            error={errors.title?.message}
          />
          <TextArea
            label="Message"
            placeholder="Enter message content"
            {...register("message", { required: "Message is required" })}
            error={errors.message?.message}
          />
          <Select
            label="Type"
            {...register("type", { required: "Type is required" })}
            options={[
              { label: "Instant", value: "instant" },
              { label: "Scheduled", value: "scheduled" },
            ]}
          />
          {watchType === "scheduled" && (
            <Input
              type="datetime-local"
              label="Scheduled At"
              {...register("scheduledAt", { required: "Scheduled time required" })}
              error={errors.scheduledAt?.message}
            />
          )}

          <div className="text-right">
            <Button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Notification Modal */}
      <Modal
        isOpen={showDetailModal}
        title="Notification Details"
        onClose={() => setShowDetailModal(false)}
      >
        {selectedNotification && (
          <div>
            <h3 className="font-semibold">{selectedNotification.title}</h3>
            <p>{selectedNotification.message}</p>
            <div className="mt-4 text-sm text-gray-500">
              <p>Type: {selectedNotification.type}</p>
              <p>Created on: {formatDateTime(selectedNotification.createdAt)}</p>
              {selectedNotification.scheduledAt && (
                <p>Scheduled for: {formatDateTime(selectedNotification.scheduledAt)}</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Notifications;
