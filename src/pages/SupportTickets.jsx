import { useMemo, useState } from "react";
import {
  Eye,
  MessageSquare,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Filter,
  AlertCircle,
  Ticket,
} from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import FilterBar from "../components/ui/FilterBar";
import { formatDateTime, formatNumber } from "../utils/helpers";
import TextArea from "../components/ui/TextArea";
import StatsCard from "../components/common/StatsCard";

const SupportTickets = () => {
  const [tickets, setTickets] = useState([
    {
      id: "TICK001",
      userId: 1,
      userName: "John Doe",
      userEmail: "john@example.com",
      subject: "Unable to access premium features",
      description:
        "I upgraded to premium but still cannot access the advanced features. Please help.",
      status: "open",
      priority: "high",
      category: "billing",
      createdAt: "2024-01-20T10:30:00Z",
      updatedAt: "2024-01-20T10:30:00Z",
      assignedTo: null,
      responses: [],
    },
    {
      id: "TICK002",
      userId: 2,
      userName: "Jane Smith",
      userEmail: "jane@example.com",
      subject: "Password reset not working",
      description:
        "I tried to reset my password multiple times but never received the email.",
      status: "in_progress",
      priority: "medium",
      category: "technical",
      createdAt: "2024-01-19T14:15:00Z",
      updatedAt: "2024-01-20T09:22:00Z",
      assignedTo: "Admin User",
      responses: [
        {
          id: 1,
          author: "Admin User",
          message:
            "Hi Jane, I'm looking into this issue. Can you check your spam folder?",
          createdAt: "2024-01-20T09:22:00Z",
          isAdmin: true,
        },
      ],
    },
    {
      id: "TICK003",
      userId: 3,
      userName: "Bob Johnson",
      userEmail: "bob@example.com",
      subject: "Feature request: Dark mode",
      description: "Would love to see a dark mode option in the application.",
      status: "resolved",
      priority: "low",
      category: "feature_request",
      createdAt: "2024-01-18T16:45:00Z",
      updatedAt: "2024-01-19T11:30:00Z",
      assignedTo: "Admin User",
      responses: [
        {
          id: 1,
          author: "Admin User",
          message:
            "Thanks for the suggestion! Dark mode is planned for our next release.",
          createdAt: "2024-01-19T11:30:00Z",
          isAdmin: true,
        },
      ],
    },
  ]);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    category: "",
  });

  const supportTicketStats = useMemo(
    () => [
      {
        title: "Open Tickets",
        value: formatNumber(14),
        icon: Ticket,
      },
      {
        title: "In Progress",
        value: formatNumber(10),
        icon: Clock,
      },
      {
        title: "Resolved",
        value: formatNumber(4),
        icon: CheckCircle,
      },

      {
        title: "High Priority",
        value: formatNumber(3),
        icon: AlertCircle,
        color: "text-red-600",
        bgColor: "bg-red-600/20"
      },
    ],
    []
  );

  const columns = [
    {
      key: "id",
      label: "Ticket ID",

      render: (value) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: "userName",
      label: "Customer",

      render: (value, ticket) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-medium text-sm">
              {value.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500">{ticket.userEmail}</p>
          </div>
        </div>
      ),
    },
    {
      key: "subject",
      label: "Subject",

      render: (value, ticket) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500 truncate max-w-xs">
            {ticket.description}
          </p>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (value) => (
        <Badge variant="info">{value.replace("_", " ")}</Badge>
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
            value === "open"
              ? "warning"
              : value === "in_progress"
              ? "info"
              : value === "resolved"
              ? "success"
              : value === "closed"
              ? "default"
              : "default"
          }
        >
          {value.replace("_", " ")}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",

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
      render: (_, ticket) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(ticket)}
            icon={<Eye className="w-4 h-4" />}
            title="View Details"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleReply(ticket)}
            icon={<MessageSquare className="w-4 h-4" />}
            title="Reply"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSendEmail(ticket)}
            icon={<Mail className="w-4 h-4" />}
            title="Send Email"
          />
          {ticket.status !== "resolved" && ticket.status !== "closed" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleResolve(ticket)}
              icon={<CheckCircle className="w-4 h-4" />}
              title="Mark as Resolved"
            />
          )}
        </div>
      ),
    },
  ];

  const handleView = (ticket) => {
    setSelectedTicket(ticket);
    setShowDetailModal(true);
  };

  const handleReply = (ticket) => {
    setSelectedTicket(ticket);
    setReplyMessage("");
    setShowReplyModal(true);
  };

  const handleSendEmail = (ticket) => {
    alert(`Opening email composer for ${ticket.userEmail}`);
  };

  const handleResolve = (ticket) => {
    if (confirm(`Mark ticket ${ticket.id} as resolved?`)) {
      setTickets(
        tickets.map((t) =>
          t.id === ticket.id
            ? { ...t, status: "resolved", updatedAt: new Date().toISOString() }
            : t
        )
      );
    }
  };

  const handleStatusChange = (ticketId, newStatus) => {
    setTickets(
      tickets.map((t) =>
        t.id === ticketId
          ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
          : t
      )
    );
  };

  const handleSubmitReply = () => {
    if (!replyMessage.trim()) return;

    const updatedTickets = tickets.map((t) => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          responses: [
            ...t.responses,
            {
              id: t.responses.length + 1,
              author: "Admin User",
              message: replyMessage,
              createdAt: new Date().toISOString(),
              isAdmin: true,
            },
          ],
          status: t.status === "open" ? "in_progress" : t.status,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    setTickets(updatedTickets);
    setShowReplyModal(false);
    setReplyMessage("");
  };

  // Calculate stats
  const openTickets = tickets.filter((t) => t.status === "open").length;
  const inProgressTickets = tickets.filter(
    (t) => t.status === "in_progress"
  ).length;
  const resolvedTickets = tickets.filter((t) => t.status === "resolved").length;
  const highPriorityTickets = tickets.filter(
    (t) => t.priority === "high"
  ).length;

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    if (filters.status && ticket.status !== filters.status) return false;
    if (filters.priority && ticket.priority !== filters.priority) return false;
    if (filters.category && ticket.category !== filters.category) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {supportTicketStats?.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon ? <stat.icon /> : null}
            colored
            color={stat.color}
            bgColor={stat.bgColor}
            index={index}
          />
        ))}
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
                { value: "open", label: "Open" },
                { value: "in_progress", label: "In Progress" },
                { value: "resolved", label: "Resolved" },
                { value: "closed", label: "Closed" },
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
            {
              key: "category",
              label: "Category",
              type: "select",
              value: filters.category,
              onChange: (value) =>
                setFilters((prev) => ({ ...prev, category: value })),
              options: [
                { value: "billing", label: "Billing" },
                { value: "technical", label: "Technical" },
                { value: "feature_request", label: "Feature Request" },
                { value: "general", label: "General" },
              ],
            },
          ]}
          onClear={() => setFilters({ status: "", priority: "", category: "" })}
        />
      </Card>

      {/* Tickets Table */}
      <DataTable
        title="Support Tickets"
        data={filteredTickets}
        columns={columns}
        searchable={true}
        filterable={false}
        exportable={true}
        addButton={false}
      />

      {/* Ticket Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Ticket Details"
        size="xl"
      >
        {selectedTicket && (
          <div className="space-y-6">
            {/* Ticket Header */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedTicket.id} - {selectedTicket.subject}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Created by {selectedTicket.userName} on{" "}
                  {formatDateTime(selectedTicket.createdAt)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant={
                    selectedTicket.priority === "high"
                      ? "danger"
                      : selectedTicket.priority === "medium"
                      ? "warning"
                      : "default"
                  }
                >
                  {selectedTicket.priority} priority
                </Badge>
                <Select
                  value={selectedTicket.status}
                  onChange={(e) =>
                    handleStatusChange(selectedTicket.id, e.target.value)
                  }
                  options={[
                    { value: "open", label: "Open" },
                    { value: "in_progress", label: "In Progress" },
                    { value: "resolved", label: "Resolved" },
                    { value: "closed", label: "Closed" },
                  ]}
                  className="px-2 py-1 text-sm"
                />
              </div>
            </div>

            {/* Original Message */}
            <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedTicket.userName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDateTime(selectedTicket.createdAt)}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                {selectedTicket.description}
              </p>
            </div>

            {/* Responses */}
            {selectedTicket.responses.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Responses
                </h4>
                {selectedTicket.responses.map((response) => (
                  <div
                    key={response.id}
                    className={`p-4 rounded-lg border ${
                      response.isAdmin
                        ? "bg-primary-50 border-primary-200 ml-8"
                        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          response.isAdmin ? "bg-primary-500" : "bg-gray-200"
                        }`}
                      >
                        <User
                          className={`w-4 h-4 ${
                            response.isAdmin ? "text-white" : "text-gray-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {response.author}{" "}
                          {response.isAdmin && (
                            <span className="text-xs text-primary-600">
                              (Admin)
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDateTime(response.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {response.message}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => handleSendEmail(selectedTicket)}
                icon={<Mail className="w-4 h-4" />}
              >
                Send Email
              </Button>
              <Button
                onClick={() => {
                  setShowDetailModal(false);
                  handleReply(selectedTicket);
                }}
                icon={<MessageSquare className="w-4 h-4" />}
              >
                Reply
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reply Modal */}
      <Modal
        isOpen={showReplyModal}
        onClose={() => setShowReplyModal(false)}
        title="Reply to Ticket"
        size="md"
      >
        {selectedTicket && (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Replying to: {selectedTicket.subject}
              </p>
              <p className="text-sm text-gray-500">
                Customer: {selectedTicket.userName}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Response
              </label>

              <TextArea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your response here..."
                rows={8}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowReplyModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReply}
                disabled={!replyMessage.trim()}
              >
                Send Reply
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SupportTickets;
