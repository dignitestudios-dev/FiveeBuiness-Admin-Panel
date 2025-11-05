import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./components/layout/Layout";

// Auth pages
import Login from "./pages/auth/Login";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyOTP from "./pages/auth/VerifyOTP";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Main pages
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Analytics from "./pages/Analytics";
import ChangePassword from "./pages/ChangePassword";
import Documentation from "./pages/Documentation";
import Notifications from "./pages/Notifications";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Reports from "./pages/Reports";
import SendEmail from "./pages/SendEmail";
import SupportTickets from "./pages/SupportTickets";
import Transactions from "./pages/Transactions";
import UserManagement from "./pages/UserManagement";
import ChatSupport from "./pages/ChatSupport";

import "./App.css";
import { Toaster } from "react-hot-toast";
import Categories from "./pages/Categories";
import Videos from "./pages/Videos";
import Chat from "./pages/Chat";

function App() {
  return (
    <>
      <ThemeProvider>
        <AppProvider>
          <Router>
            <AuthProvider>
              <Routes>
                {/* Auth Routes */}
                <Route path="/auth/login" element={<Login />} />
                <Route
                  path="/auth/forgot-password"
                  element={<ForgotPassword />}
                />
                <Route path="/auth/verify-otp" element={<VerifyOTP />} />
                <Route
                  path="/auth/reset-password"
                  element={<ResetPassword />}
                />
                <Route path="/d/docs" element={<Documentation />} />

                {/* Protected Routes */}
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Routes>
                          <Route path="/" element={<Dashboard />} />

                          <Route path="/dashboard" element={<Dashboard />} />

                          <Route path="/users">
                            <Route path="" element={<UserManagement />} />
                            <Route
                              path="blocked"
                              element={
                                <div className="p-6">
                                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Blocked Users - Coming Soon
                                  </h1>
                                </div>
                              }
                            />
                          </Route>

                          <Route path="/products">
                            <Route path="" element={<Products />} />
                            <Route path="categories" element={<Categories />} />
                          </Route>

                                                    <Route path="/videos" element={<Videos />} />


                          <Route path="/orders" element={<Orders />} />

                          <Route path="/transactions">
                            <Route path="" element={<Transactions />} />
                            <Route
                              path="revenue"
                              element={
                                <div className="p-6">
                                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Revenue Breakdown - Coming Soon
                                  </h1>
                                </div>
                              }
                            />
                          </Route>

                          <Route path="/support">
                            <Route
                              path="tickets"
                              element={<SupportTickets />}
                            />
                            <Route path="chat" element={<ChatSupport />} />
                            <Route path="email" element={<SendEmail />} />
                          </Route>

                          <Route
                            path="/notifications"
                            element={<Notifications />}
                          />

                           <Route
                            path="/chat"
                            element={<Chat />}
                          />

                          <Route path="/reports" element={<Reports />} />

                          <Route path="/analytics" element={<Analytics />} />

                          <Route path="/settings">
                            <Route
                              path=""
                              element={
                                <div className="p-6">
                                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Settings - Coming Soon
                                  </h1>
                                </div>
                              }
                            />
                            <Route
                              path="change-password"
                              element={<ChangePassword />}
                            />
                            <Route
                              path="general"
                              element={
                                <div className="p-6">
                                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    General Settings - Coming Soon
                                  </h1>
                                </div>
                              }
                            />
                          </Route>

                          <Route path="/docs" element={<Documentation />} />
                        </Routes>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </AuthProvider>
          </Router>
        </AppProvider>
      </ThemeProvider>

      <Toaster position="bottom-right" reverseOrder={false} />
    </>
  );
}

export default App;
