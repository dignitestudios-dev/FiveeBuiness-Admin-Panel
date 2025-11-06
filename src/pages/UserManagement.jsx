import { useState, useEffect, useMemo } from "react";
import { Eye, Shield, ShieldOff, Ban } from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import { useForm } from "react-hook-form";
import { formatDate } from "../utils/helpers";
import useGetAllUsers from "../hooks/users/useGetAllUsers";
import axios from "axios";
import { API_CONFIG } from "../config/constants";
import toast from "react-hot-toast";

const UserManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
const [userToConfirm, setUserToConfirm] = useState(null);

  const [filters, setFilters] = useState({
    role: "",
    status: "",
    dateRange: { start: "", end: "" },
  });
  const [apiFilters, setApiFilters] = useState(filters);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();



  

const { totalData, totalPages, users, loading, getAllUsers } = 
  useGetAllUsers(apiFilters, currentPage, pageSize, searchTerm);
  console.log("Users:", users);

   // Ensure pagination is handled by the custom hook
  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (size) => {
    setPagination((prev) => ({ ...prev, page: 1, limit: size }));
  };

  useEffect(() => {
    setApiFilters(filters);
  }, [filters]);

  const columns = [
    {
      key: "firstName",
      label: "Name",
      render: (value) => (
        <div className="flex items-center space-x-3">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{value}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (value) => (
        <Badge variant={value === "admin" ? "danger" : value === "manager" ? "warning" : "default"}>
          {value}
        </Badge>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (value) => <p className="text-sm text-gray-500">{value}</p>,
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (value) => formatDate(value),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, user) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => handleView(user)} icon={<Eye className="w-4 h-4" />} title="View Details" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleBlock(user)}
            icon={user.status === "blocked" ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
            title={user.status === "blocked" ? "Unblock User" : "Block User"}
          />
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingUser(null);
    reset();
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    reset(user);
    setShowModal(true);
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleToggleBlock = (user) => {
  const action = user.status === "blocked" ? "active" : "blocked";
  setUserToConfirm(user);
  setIsConfirmModalOpen(true);
};


  const updateUserStatus = async (userId, status) => {
    console.log("Updating user status:", userId, status);
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: token ? `Bearer ${token}` : "" };
      const response = await axios.patch(`${API_CONFIG.baseURL}/user/status/${userId}`, { status }, { headers });
      console.log("Update response:", response);
      if (response.status === 200 && response.data.status) {
      toast.success(`User status updated to ${status}`);
        getAllUsers(apiFilters, currentPage, pageSize);
      }
    } catch (error) {
      toast.error("An error occurred while updating the user status.");
      console.error("Error updating user status:", error);
    }
  };

  const onSubmit = (data) => {
    if (editingUser) {
      setUsers(users.map((u) => (u.id === editingUser.id ? { ...u, ...data } : u)));
    } else {
      const newUser = { ...data, id: Math.max(...users.map((u) => u.id)) + 1, createdAt: new Date().toISOString(), status: "active" };
      setUsers([...users, newUser]);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <DataTable
  title="User Management"
  data={users}
  loading={loading}
  columns={columns}
  totalData={totalData}
  totalPages={totalPages}
  currentPage={currentPage}
  pageSize={pageSize}
  searchTerm={searchTerm}
  onPageChange={setCurrentPage}   // updates currentPage state
  onPageSizeChange={setPageSize}  // updates pageSize state
  onSearch={setSearchTerm}
/>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingUser ? "Edit User" : "Add New User"} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Full Name" {...register("name", { required: "Name is required" })} error={errors.name?.message} />
          <Input
            label="Email"
            type="email"
            {...register("email", { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email address" } })}
            error={errors.email?.message}
          />
          <Input label="Phone" {...register("phone")} error={errors.phone?.message} />
          <Input label="Address" {...register("address")} error={errors.address?.message} />
          <Select
            label="Role"
            options={[
              { value: "", label: "Select Role" },
              { value: "user", label: "User" },
              { value: "manager", label: "Manager" },
              { value: "admin", label: "Admin" },
            ]}
            {...register("role", { required: "Role is required" })}
            error={errors.role?.message}
          />
          <Select
            label="Status"
            options={[
              { value: "", label: "Select Status" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
            {...register("status", { required: "Status is required" })}
            error={errors.status?.message}
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingUser ? "Update User" : "Create User"}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="User Details" size="lg">
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedUser.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant={selectedUser.status === "active" ? "success" : "default"}>{selectedUser.status}</Badge>
                  <Badge variant={selectedUser.role === "admin" ? "danger" : selectedUser.role === "manager" ? "warning" : "default"}>{selectedUser.role}</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">Contact Information</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900 dark:text-white">{selectedUser.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-gray-900 dark:text-white">{selectedUser.address || "Not provided"}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">Account Statistics</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Member Since</label>
                    <p className="text-gray-900 dark:text-white">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>


      <Modal
  isOpen={isConfirmModalOpen}
  onClose={() => setIsConfirmModalOpen(false)}
  title={`Are you sure you want to ${userToConfirm ? (userToConfirm.status === "blocked" ? "unblock" : "block") : ""} this user?`}
  size="sm"
>
  <div className="space-x-4">
    <Button
      variant="outline"
      onClick={() => setIsConfirmModalOpen(false)}
    >
      Cancel
    </Button>
    <Button
      onClick={() => {
        if (userToConfirm) {
          const action = userToConfirm.status === "blocked" ? "active" : "blocked";
          updateUserStatus(userToConfirm._id, action);
          setIsConfirmModalOpen(false);
        }
      }}
    >
      Confirm
    </Button>
  </div>
</Modal>

    </div>
  );
};

export default UserManagement;
