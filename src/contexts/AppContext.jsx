import React, { createContext, useContext, useState, useEffect } from "react";
import { MENU_ITEMS } from "../config/constants";

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appConfigs, setAppConfigs] = useState(null);
  const [dashboardAnalytics, setDashboardAnalytics] = useState(null);

  // Filter menu items based on feature flags and configurations
  const getFilteredMenuItems = () => {
    return MENU_ITEMS;
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(false);
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call once on mount

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const value = {
    // Sidebar state
    sidebarCollapsed,
    setSidebarCollapsed,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    toggleMobileSidebar,

    // Loading state
    loading,
    setLoading,

    // Menu items
    menuItems: getFilteredMenuItems(),

    // App configurations
    appConfigs,
    setAppConfigs,

    // Dashboard analytics
    dashboardAnalytics,
    setDashboardAnalytics,

    // Utility functions
    isMobile: () => window.innerWidth < 1024,
    isTablet: () => window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: () => window.innerWidth >= 1024,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
