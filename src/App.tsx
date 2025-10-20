
import React from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet
} from "react-router-dom";
import Layout from "./components/Layout";
import { useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
import Jobs from "./pages/Jobs";
import Invoicing from "./pages/Invoicing";
import Index from "./pages/Index";
import { NotificationProvider } from "./contexts/NotificationContext";
import Workshop from "./pages/Workshop";
import BookingDiary from "./pages/BookingDiary";
import EmailIntegration from "./pages/EmailIntegration";
import Communication from "./pages/Communication";
import Inventory from "./pages/Inventory";
import Customers from "./pages/Customers";
import Marketing from "./pages/Marketing";
import Reports from "./pages/Reports";
import Timesheets from "./pages/Timesheets";
import EmailMarketing from "./pages/EmailMarketing";
import Reviews from "./pages/Reviews";
import WorkshopSetup from "./pages/WorkshopSetup";
import TechnicianPortal from "./pages/TechnicianPortal";
import Settings from "./pages/Settings";
import EmailDesignerPage from './pages/EmailDesignerPage';
import EzyPartsDashboard from './pages/EzyPartsDashboard';
import VehicleSearch from './components/ezyparts/vehicle-search/VehicleSearch';
import EmailCallback from './pages/email/callback';

const App = () => {
  const { user } = useAuth();
  
  return (
    <NotificationProvider>
      <Routes>
        {/* Auth Routes - should be accessible without authentication */}
        <Route path="/auth/signin" element={<Auth />} />
        <Route path="/auth/signup" element={<Auth />} />
        <Route path="/auth/reset-password" element={<Auth />} />

        {/* App Routes with Layout */}
        <Route element={<Layout><Outlet /></Layout>}>
          {/* Main Pages */}
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/booking-diary" element={<ProtectedRoute><BookingDiary /></ProtectedRoute>} />
          <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
          <Route path="/invoicing" element={<ProtectedRoute><Invoicing /></ProtectedRoute>} />
          <Route path="/email-integration" element={<ProtectedRoute><EmailIntegration /></ProtectedRoute>} />
          <Route path="/communication" element={<ProtectedRoute><Communication /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
          <Route path="/marketing" element={<ProtectedRoute><Marketing /></ProtectedRoute>} />
          <Route path="/email-marketing" element={<ProtectedRoute><EmailMarketing /></ProtectedRoute>} />
          <Route path="/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/timesheets" element={<ProtectedRoute><Timesheets /></ProtectedRoute>} />
          <Route path="/timesheets/entries" element={<ProtectedRoute><Timesheets /></ProtectedRoute>} />
          <Route path="/workshop" element={<ProtectedRoute><Workshop /></ProtectedRoute>} />
          <Route path="/workshop-setup" element={<ProtectedRoute><WorkshopSetup /></ProtectedRoute>} />
          <Route path="/technician-portal" element={<TechnicianPortal />} /> 
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute><div className="container py-8"><h1 className="text-3xl font-bold mb-4">Help & Support</h1><p>This page is under construction.</p></div></ProtectedRoute>} />
          
          {/* EzyParts Routes */}
          <Route path="/ezyparts" element={<ProtectedRoute><EzyPartsDashboard /></ProtectedRoute>} />
          <Route path="/ezyparts/search" element={<ProtectedRoute><VehicleSearch /></ProtectedRoute>} />
          
          {/* Route for EmailDesignerPage */}
          <Route path="/email-designer/:mode/:id?" element={<EmailDesignerPage />} />
          
          {/* Email OAuth callback route */}
          <Route path="/email/callback" element={<EmailCallback />} />
          
          {/* Redirect any unmatched routes to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </NotificationProvider>
  );
};

export default App;
