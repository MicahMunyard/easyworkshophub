import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import EzyPartsRoutes from "./routes/EzyPartsRoutes";
import Index from "./pages/Index";
import BookingDiary from "./pages/BookingDiary";
import Jobs from "./pages/Jobs";
import WorkshopSetup from "./pages/WorkshopSetup";
import Workshop from "./pages/Workshop";
import Inventory from "./pages/Inventory";
import Customers from "./pages/Customers";
import Invoicing from "./pages/Invoicing"; 
import PointOfSale from "./pages/PointOfSale";
import Suppliers from "./pages/Suppliers";
import Reports from "./pages/Reports";
import Marketing from "./pages/Marketing";
import EmailMarketing from "./pages/EmailMarketing";
import EmailIntegration from "./pages/EmailIntegration";
import Communication from "./pages/Communication";
import Reviews from "./pages/Reviews";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import TechnicianPortal from "./pages/TechnicianPortal";
import Timesheets from "./pages/Timesheets";
import { useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import EmailCallback from "./pages/email/callback";
import FacebookCallback from "./pages/facebook/callback";

const App: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/auth/signin" element={<Auth />} />
      <Route path="/auth/signup" element={<Auth />} />
      <Route path="/auth" element={<Navigate to="/auth/signin" replace />} />
      
      {/* Facebook OAuth callback route */}
      <Route path="/facebook/callback" element={<FacebookCallback />} />
      
      {/* Protected routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Layout>
              <Index />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      {/* EzyParts routes */}
      <Route
        path="/ezyparts/*"
        element={
          <ProtectedRoute>
            <Layout>
              <EzyPartsRoutes />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      {/* Other protected routes */}
      <Route path="/workshop" element={<ProtectedRoute><Layout><Workshop /></Layout></ProtectedRoute>} />
      <Route path="/booking-diary" element={<ProtectedRoute><Layout><BookingDiary /></Layout></ProtectedRoute>} />
      <Route path="/jobs" element={<ProtectedRoute><Layout><Jobs /></Layout></ProtectedRoute>} />
      <Route path="/workshop-setup" element={<ProtectedRoute><Layout><WorkshopSetup /></Layout></ProtectedRoute>} />
      <Route path="/technician-portal" element={<ProtectedRoute><TechnicianPortal /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute><Layout><Inventory /></Layout></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><Layout><Customers /></Layout></ProtectedRoute>} />
      <Route path="/invoicing" element={<ProtectedRoute><Layout><Invoicing /></Layout></ProtectedRoute>} />
      <Route path="/invoices" element={<Navigate to="/invoicing" replace />} />
      <Route path="/pos" element={<ProtectedRoute><Layout><PointOfSale /></Layout></ProtectedRoute>} />
      <Route path="/suppliers" element={<ProtectedRoute><Layout><Suppliers /></Layout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
      <Route path="/marketing" element={<ProtectedRoute><Layout><Marketing /></Layout></ProtectedRoute>} />
      <Route path="/email-marketing" element={<ProtectedRoute><Layout><EmailMarketing /></Layout></ProtectedRoute>} />
      <Route path="/email-integration" element={<ProtectedRoute><Layout><EmailIntegration /></Layout></ProtectedRoute>} />
      <Route path="/communication" element={<ProtectedRoute><Layout><Communication /></Layout></ProtectedRoute>} />
      <Route path="/reviews" element={<ProtectedRoute><Layout><Reviews /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
      
      {/* Email OAuth callback route */}
      <Route path="/email/callback" element={<EmailCallback />} />
      
      {/* Timesheets route */}
      <Route path="/timesheets" element={
        <ProtectedRoute>
          <Layout>
            <Timesheets />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Catch all routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
