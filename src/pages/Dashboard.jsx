import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users, ShoppingCart, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Activity, CreditCard, MessageSquare, Bell, Eye, UserCheck, UserX, Calendar, Clock } from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { CHART_COLORS, API_CONFIG } from "../config/constants";
import { useApp } from "../contexts/AppContext";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import StatsCard from "../components/common/StatsCard";

const Dashboard = () => {
  const { addNotification } = useApp();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const authToken = localStorage.getItem("authToken"); // Retrieve token from localStorage
        if (!authToken) {
          setError("Authorization token missing");
          return;
        }

        const response = await axios.get(`${API_CONFIG.baseURL}/dashboard/overview`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`, // Include the token in the header
          },
        });

        if (response.data.status) {
          setDashboardData(response.data.data); // Store the data in state
        } else {
          setError("Failed to load data");
        }
      } catch (error) {
        setError("An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  // Handle potential undefined fields for graphs and analytics
  const userSignupGraph = dashboardData?.userSignupGraph || [];
  const revenueGraph = dashboardData?.revenueGraph || [];
  const recentActivities = dashboardData?.recentActivities || [];

  // Main Stats
  const mainStats = [
    {
      title: "Total Users",
      value: formatNumber(dashboardData.totalUsers),
      trend: "up",
      icon: Users,
    },
    // {
    //   title: "Active Sessions",
    //   value: formatNumber(dashboardData.activeUserCount),
    //   change: "+8.2%",
    //   trend: "up",
    //   icon: Activity,
    // },
    // {
    //   title: "Monthly Revenue",
    //   value: formatCurrency(dashboardData.totalRevenue),
    //   change: "+15.3%",
    //   trend: "up",
    //   icon: DollarSign,
    // },
    {
      title: "Total Revenue",
      value: formatCurrency(dashboardData.totalRevenue),
      trend: "up",
      icon: TrendingUp,
    },
    // {
    //   title: "Support Tickets",
    //   value: "N/A", // Placeholder until you integrate support tickets.
    //   change: "-5.1%",
    //   trend: "down",
    //   icon: MessageSquare,
    // },
      {
      title: "Active Users",
      value: formatNumber(dashboardData.activeUserCount),
      trend: "up",
      icon: UserCheck,
    },
     {
      title: "Blocked Users",
      value: dashboardData.blockedUserCount,
      trend: "up",
      icon: UserX,
    },
  ];

  // Secondary Stats
  const secondaryStats = [
  
   
    // {
    //   title: "Total Transactions",
    //   value: "N/A", // Placeholder for transaction data.
    //   change: "+18.7%",
    //   trend: "up",
    //   icon: CreditCard,
    // },
    
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back! Here's what's happening with your platform today.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.trend === "up" ? "positive" : "negative"}
            icon={stat.icon ? <stat.icon /> : null}
            index={index}
          />
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {secondaryStats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.trend === "up" ? "positive" : "negative"}
            icon={stat.icon ? <stat.icon /> : null}
            index={index + 2}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1  gap-6">
        {/* Revenue Chart */}
        <Card>
          <Card.Header className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Revenue Growth</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
            </div>
          </Card.Header>
          <Card.Content className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueGraph}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), "Revenue"]}
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F9FAFB",
                  }}
                />
                <Area type="monotone" dataKey="total" stroke={CHART_COLORS.primary} strokeWidth={2} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card.Content>
        </Card>

        {/* User Signup Graph */}
        <Card>
          <Card.Header>
            <Card.Title>User Signups Over Time</Card.Title>
          </Card.Header>
          <Card.Content className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userSignupGraph}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", color: "#F9FAFB" }} />
                <Line type="monotone" dataKey="count" stroke={CHART_COLORS.primary} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card.Content>
        </Card>
      </div>

      {/* Recent Activities */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <Card.Title>Recent Activities</Card.Title>
          </Card.Header>
          <Card.Content>
            <ul className="space-y-4">
              {recentActivities.length ? (
                recentActivities.map((activity, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <div className={`text-lg ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{activity.message}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <div>No recent activities</div>
              )}
            </ul>
          </Card.Content>
        </Card>
      </div> */}
    </div>
  );
};

export default Dashboard;
