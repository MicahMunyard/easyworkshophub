
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
import Jobs from "./pages/Jobs";
import Invoicing from "./pages/Invoicing";
import Index from "./pages/Index";
import { NotificationProvider } from "./contexts/NotificationContext";
import EzyPartsRoutes from "./routes/EzyPartsRoutes";
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
import Suppliers from "./pages/Suppliers";
import WorkshopSetup from "./pages/WorkshopSetup";

const App = () => {
  const { user } = useAuth();
  
  return (
    <NotificationProvider>
      <Routes>
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
          <Route path="/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
          <Route path="/workshop-setup" element={<ProtectedRoute><WorkshopSetup /></ProtectedRoute>} />
          
          {/* EzyParts Routes */}
          <Route path="/ezyparts/*" element={<ProtectedRoute><EzyPartsRoutes /></ProtectedRoute>} />
        </Route>
      </Routes>
    </NotificationProvider>
  );
};

export default App;
