import { useState } from "react";
import {
  Eye,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
  User,
} from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import { formatDateTime } from "../utils/helpers";
import Select from "../components/ui/Select";
import FilterBar from "../components/ui/FilterBar";

const Reports = () => {
  const [reports, setReports] = useState([
    {
      id: "RPT001",
      userId: 1,
      userName: "John Doe",
      userEmail: "john@example.com",
      reportedUserId: 2,
      reportedUserName: "Jane Smith",
      reportedUserEmail: "jane@example.com",
      type: "inappropriate_content",
      category: "harassment",
      subject: "Inappropriate messages in chat",
      description:
        "This user has been sending inappropriate messages and making other users uncomfortable.",
      status: "pending",
      priority: "high",
      evidence: ["screenshot1.png", "screenshot2.png"],
      createdAt: "2024-01-20T10:30:00Z",
      updatedAt: "2024-01-20T10:30:00Z",
      reviewedBy: null,
      resolution: null,
      actionTaken: null,
    },
    {
      id: "RPT002",
      userId: 3,
      userName: "Bob Johnson",
      userEmail: "bob@example.com",
      reportedUserId: 4,
      reportedUserName: "Alice Brown",
      reportedUserEmail: "alice@example.com",
      type: "spam",
      category: "promotional_content",
      subject: "Spam messages",
      description: "User is sending promotional messages repeatedly.",
      status: "resolved",
      priority: "medium",
      evidence: ["chat_log.txt"],
      createdAt: "2024-01-19T14:15:00Z",
      updatedAt: "2024-01-20T09:22:00Z",
      reviewedBy: "Admin User",
      resolution: "User warned and content removed",
      actionTaken: "warning",
    },
    {
      id: "RPT003",
      userId: 5,
      userName: "Charlie Wilson",
      userEmail: "charlie@example.com",
      reportedUserId: 6,
      reportedUserName: "Diana Davis",
      reportedUserEmail: "diana@example.com",
      type: "fake_profile",
      category: "identity_theft",
      subject: "Fake profile using stolen photos",
      description: "This profile is using photos stolen from social media.",
      status: "investigating",
      priority: "high",
      evidence: ["comparison.jpg", "original_source.jpg"],
      createdAt: "2024-01-18T16:45:00Z",
      updatedAt: "2024-01-19T11:30:00Z",
      reviewedBy: "Admin User",
      resolution: null,
      actionTaken: null,
    },
  ]);

  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    priority: "",
  });

  const columns = [
    {
      key: "id",
      label: "Report ID",

      render: (value) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: "userName",
      label: "Reporter",

      render: (value, report) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-medium text-sm">
              {value.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500">{report.userEmail}</p>
          </div>
        </div>
      ),
    },
    {
      key: "reportedUserName",
      label: "Reported User",

      render: (value, report) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-600 font-medium text-sm">
              {value.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500">{report.reportedUserEmail}</p>
          </div>
        </div>
      ),
    },
    {
      key: "subject",
      label: "Subject",

      render: (value, report) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500">
            {report.type.replace("_", " ")} •{" "}
            {report.category.replace("_", " ")}
          </p>
        </div>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      render: (value) => (
        <Badge
          variant={
            value === "high"
              ? "danger"
              : value === "medium"
              ? "warning"
              : "default"
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge
          variant={
            value === "pending"
              ? "warning"
              : value === "investigating"
              ? "info"
              : value === "resolved"
              ? "success"
              : value === "dismissed"
              ? "default"
              : "default"
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Reported",

      render: (value) => (
        <div>
          <p className="text-sm">{new Date(value).toLocaleDateString()}</p>
          <p className="text-xs text-gray-500">
            {new Date(value).toLocaleTimeString()}
          </p>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, report) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(report)}
            icon={<Eye className="w-4 h-4" />}
            title="View Details"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownload(report)}
            icon={<Download className="w-4 h-4" />}
            title="Download Evidence"
          />
          {report.status === "pending" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleResolve(report)}
                icon={<CheckCircle className="w-4 h-4" />}
                title="Mark as Resolved"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismiss(report)}
                icon={<XCircle className="w-4 h-4" />}
                title="Dismiss Report"
              />
            </>
          )}
        </div>
      ),
    },
  ];

  const handleView = (report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const handleDownload = (report) => {
    alert(`Downloading evidence for report ${report.id}`);
  };

  const handleResolve = (report) => {
    const resolution = prompt("Enter resolution details:");
    if (resolution) {
      setReports(
        reports.map((r) =>
          r.id === report.id
            ? {
                ...r,
                status: "resolved",
                resolution,
                reviewedBy: "Admin User",
                updatedAt: new Date().toISOString(),
              }
            : r
        )
      );
    }
  };

  const handleDismiss = (report) => {
    const reason = prompt("Enter dismissal reason:");
    if (reason) {
      setReports(
        reports.map((r) =>
          r.id === report.id
            ? {
                ...r,
                status: "dismissed",
                resolution: `Dismissed: ${reason}`,
                reviewedBy: "Admin User",
                updatedAt: new Date().toISOString(),
              }
            : r
        )
      );
    }
  };

  const handleStatusChange = (reportId, newStatus) => {
    setReports(
      reports.map((r) =>
        r.id === reportId
          ? { ...r, status: newStatus, updatedAt: new Date().toISOString() }
          : r
      )
    );
  };

  // Calculate stats
  const pendingReports = reports.filter((r) => r.status === "pending").length;
  const investigatingReports = reports.filter(
    (r) => r.status === "investigating"
  ).length;
  const resolvedReports = reports.filter((r) => r.status === "resolved").length;
  const highPriorityReports = reports.filter(
    (r) => r.priority === "high"
  ).length;

  // Filter reports
  const filteredReports = reports.filter((report) => {
    if (filters.status && report.status !== filters.status) return false;
    if (filters.type && report.type !== filters.type) return false;
    if (filters.priority && report.priority !== filters.priority) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pending Reports
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {pendingReports}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Investigating
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {investigatingReports}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Resolved
              </p>
              <p className="text-2xl font-bold text-green-600">
                {resolvedReports}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                High Priority
              </p>
              <p className="text-2xl font-bold text-red-600">
                {highPriorityReports}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <FilterBar
          filters={[
            {
              key: "status",
              label: "Status",
              type: "select",
              value: filters.status,
              onChange: (value) =>
                setFilters((prev) => ({ ...prev, status: value })),
              options: [
                { value: "pending", label: "Pending" },
                { value: "investigating", label: "Investigating" },
                { value: "resolved", label: "Resolved" },
                { value: "dismissed", label: "Dismissed" },
              ],
            },
            {
              key: "type",
              label: "Type",
              type: "select",
              value: filters.type,
              onChange: (value) =>
                setFilters((prev) => ({ ...prev, type: value })),
              options: [
                {
                  value: "inappropriate_content",
                  label: "Inappropriate Content",
                },
                { value: "spam", label: "Spam" },
                { value: "fake_profile", label: "Fake Profile" },
                { value: "harassment", label: "Harassment" },
                { value: "other", label: "Other" },
              ],
            },
            {
              key: "priority",
              label: "Priority",
              type: "select",
              value: filters.priority,
              onChange: (value) =>
                setFilters((prev) => ({ ...prev, priority: value })),
              options: [
                { value: "high", label: "High" },
                { value: "medium", label: "Medium" },
                { value: "low", label: "Low" },
              ],
            },
          ]}
          onClear={() => setFilters({ status: "", type: "", priority: "" })}
        />
      </Card>

      {/* Reports Table */}
      <DataTable
        title="User Reports"
        data={filteredReports}
        columns={columns}
        searchable={true}
        filterable={false}
        exportable={true}
        addButton={false}
      />

      {/* Report Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Report Details"
        size="xl"
      >
        {selectedReport && (
          <div className="space-y-6">
            {/* Report Header */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedReport.id} - {selectedReport.subject}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Reported on {formatDateTime(selectedReport.createdAt)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant={
                    selectedReport.priority === "high"
                      ? "danger"
                      : selectedReport.priority === "medium"
                      ? "warning"
                      : "default"
                  }
                >
                  {selectedReport.priority} priority
                </Badge>

                <Select
                  value={selectedReport.status}
                  onChange={(e) =>
                    handleStatusChange(selectedReport.id, e.target.value)
                  }
                  options={[
                    { value: "pending", label: "Pending" },
                    { value: "investigating", label: "Investigating" },
                    { value: "resolved", label: "Resolved" },
                    { value: "dismissed", label: "Dismissed" },
                  ]}
                />
              </div>
            </div>

            {/* Report Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Reporter Information
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Name
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedReport.userName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedReport.userEmail}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      User ID
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedReport.userId}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Reported User Information
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Name
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedReport.reportedUserName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedReport.reportedUserEmail}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      User ID
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedReport.reportedUserId}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Report Content */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Report Details
              </h4>
              <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Type
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedReport.type.replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Category
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedReport.category.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Description
                  </label>
                  <p className="text-gray-900 dark:text-white mt-1">
                    {selectedReport.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Evidence */}
            {selectedReport.evidence && selectedReport.evidence.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Evidence
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedReport.evidence.map((file, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center"
                    >
                      <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {file}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => alert(`Downloading ${file}`)}
                      >
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution */}
            {selectedReport.resolution && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Resolution
                </h4>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-gray-900 dark:text-white">
                    {selectedReport.resolution}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Resolved by {selectedReport.reviewedBy} on{" "}
                    {formatDateTime(selectedReport.updatedAt)}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => handleDownload(selectedReport)}
                icon={<Download className="w-4 h-4" />}
              >
                Download Evidence
              </Button>
              {selectedReport.status === "pending" && (
                <>
                  <Button
                    variant="danger"
                    onClick={() => {
                      handleDismiss(selectedReport);
                      setShowDetailModal(false);
                    }}
                    icon={<XCircle className="w-4 h-4" />}
                  >
                    Dismiss
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => {
                      handleResolve(selectedReport);
                      setShowDetailModal(false);
                    }}
                    icon={<CheckCircle className="w-4 h-4" />}
                  >
                    Resolve
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Reports;
