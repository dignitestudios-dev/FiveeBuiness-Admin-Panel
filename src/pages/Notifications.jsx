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

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const watchType = watch("type");
  const token = localStorage.getItem("authToken");

  // Fetch notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token || !isAuthenticated) return;

      try {
        const response = await axios.get(`${API_CONFIG.baseURL}/notification`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data.data.notifications;
        setNotifications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [isAuthenticated, token]);

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
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{value}</p>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (value) => (
        <div>
          <p className="text-sm">{new Date(value).toLocaleDateString()}</p>
        </div>
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
        await axios.delete(`${API_CONFIG.baseURL}/notifications/${notification.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(notifications.filter((n) => n.id !== notification.id));
      } catch (error) {
        console.error("Error deleting notification:", error);
      }
    }
  };

  // ✅ Create Notification API integration
  const onSubmit = async (data) => {
    setCreating(true);
    try {
      const payload = {
        title: data.title,
        message: data.message,
        type: data.type || "instant", // fallback to "instant"
        scheduledAt: data.scheduledAt || new Date().toISOString(),
      };

      const response = await axios.post(
        `${API_CONFIG.baseURL}/notification`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const created = response.data.data?.notification || payload;
      setNotifications([created, ...notifications]);

      setShowCreateModal(false);
      reset();
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

      <DataTable
      title="Push Notification"
        columns={columns}
        data={notifications}
        loading={loading}
        noDataMessage="No notifications available"
      />

      {/* Create Notification Modal */}
      <Modal
        isOpen={showCreateModal}
        title="Create Notification"
        onClose={() => setShowCreateModal(false)}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              label="Title"
              placeholder="Enter notification title"
              {...register("title", { required: true })}
              error={errors.title}
            />
          </div>
          <div>
            <TextArea
              label="Message"
              placeholder="Enter message content"
              {...register("message", { required: true })}
              error={errors.message}
            />
          </div>

          <div>
            <Select
              label="Type"
              {...register("type", { required: true })}
              options={[
                { label: "Instant", value: "instant" },
                { label: "Scheduled", value: "scheduled" },
              ]}
            />
          </div>

          {watchType === "scheduled" && (
            <div>
              <Input
                type="datetime-local"
                label="Scheduled At"
                {...register("scheduledAt", { required: true })}
                error={errors.scheduledAt}
              />
            </div>
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
