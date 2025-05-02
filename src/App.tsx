import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Layout from "./components/Layout";
import EzyPartsLayout from "./components/ezyparts/layout";
import TechnicianLayout from "./components/technician/TechnicianLayout";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { BookingProvider } from "./contexts/BookingContext";
import { TechnicianAuthProvider } from "./contexts/TechnicianAuthContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import Dashboard from "./pages/Dashboard";
import BookingDiary from "./pages/BookingDiary";
import Settings from "./pages/Settings";
import Communication from "./pages/Communication";
import Customers from "./pages/Customers";
import Invoicing from "./pages/Invoicing";
import Reports from "./pages/Reports";
import Marketing from "./pages/Marketing";
import EmailMarketing from "./pages/EmailMarketing";
import Reviews from "./pages/Reviews";
import Vehicles from "./pages/Vehicles";
import Timesheets from "./pages/Timesheets";
import EmailIntegration from "./pages/EmailIntegration";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import TechnicianLogin from "./components/technician/TechnicianLogin";
import TechnicianDashboard from "./components/technician/TechnicianDashboard";
import TechnicianJobs from "./components/technician/TechnicianJobs";
import TechJobDetail from "./components/technician/TechJobDetail";
import Jobs from "./pages/Jobs";
import Inventory from "./pages/Inventory";
import Suppliers from "./pages/Suppliers";
import { Toaster } from "./components/ui/toaster";
import CustomerDetailPage from "./pages/CustomerDetailPage";
import EzyPartsDashboard from "./pages/ezyparts/Dashboard";
import EzyPartsVehicleSearch from "./pages/ezyparts/VehicleSearch";
import EzyPartsQuote from "./pages/ezyparts/Quote";
import EzyPartsConfiguration from "./pages/ezyparts/Configuration";
import Invoices from "./pages/Invoices";

const AppContent = () => {
  const { user } = useAuth();
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <BookingProvider>
          <TechnicianAuthProvider>
            <SidebarProvider>
              <NotificationProvider>
                <Router>
                  <Routes>
                    {/* Authentication Routes */}
                    <Route path="/auth/signin" element={<Login />} />
                    <Route path="/auth/signup" element={<Register />} />
                    <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                    <Route path="/auth/reset-password" element={<ResetPassword />} />

                    {/* Technician Routes */}
                    <Route path="/technician" element={<TechnicianLayout />}>
                      <Route index element={<TechnicianLogin />} />
                      <Route path="dashboard" element={<TechnicianDashboard />} />
                      <Route path="jobs" element={<TechnicianJobs />} />
                      <Route path="jobs/:jobId" element={<TechJobDetail />} />
                    </Route>

                    {/* EzyParts Routes */}
                    <Route path="/ezyparts" element={<EzyPartsLayout />}>
                      <Route path="dashboard" element={<EzyPartsDashboard />} />
                      <Route path="search" element={<EzyPartsVehicleSearch />} />
                      <Route path="quote" element={<EzyPartsQuote />} />
                      <Route path="config" element={<EzyPartsConfiguration />} />
                    </Route>

                    {/* App Routes with Layout */}
                    <Route element={<Layout />}>
                      <Route path="/" element={<ProtectedRoute element={<Dashboard />} />} />
                      <Route path="/booking-diary" element={<ProtectedRoute element={<BookingDiary />} />} />
                      <Route path="/jobs" element={<ProtectedRoute element={<Jobs />} />} />
                      <Route path="/communication" element={<ProtectedRoute element={<Communication />} />} />
                      <Route path="/customers" element={<ProtectedRoute element={<Customers />} />} />
                      <Route path="/customers/:id" element={<ProtectedRoute element={<CustomerDetailPage />} />} />
                      <Route path="/inventory" element={<ProtectedRoute element={<Inventory />} />} />
                      <Route path="/suppliers" element={<ProtectedRoute element={<Suppliers />} />} />
                      <Route path="/vehicles" element={<ProtectedRoute element={<Vehicles />} />} />
                      <Route path="/invoicing" element={<ProtectedRoute element={<Invoicing />} />} />
                      <Route path="/invoices" element={<ProtectedRoute element={<Invoices />} />} />
                      <Route path="/timesheets" element={<ProtectedRoute element={<Timesheets />} />} />
                      <Route path="/email-integration" element={<ProtectedRoute element={<EmailIntegration />} />} />
                      <Route path="/reports" element={<ProtectedRoute element={<Reports />} />} />
                      <Route path="/marketing" element={<ProtectedRoute element={<Marketing />} />} />
                      <Route path="/email-marketing" element={<ProtectedRoute element={<EmailMarketing />} />} />
                      <Route path="/reviews" element={<ProtectedRoute element={<Reviews />} />} />
                      <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />
                    </Route>
                  </Routes>
                </Router>
                <Toaster />
              </NotificationProvider>
            </SidebarProvider>
          </TechnicianAuthProvider>
        </BookingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default function App() {
  return <AppContent />;
}
