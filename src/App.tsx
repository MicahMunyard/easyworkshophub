
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

const App = () => {
  const { user } = useAuth();
  
  return (
    <NotificationProvider>
      <Routes>
        {/* App Routes with Layout */}
        <Route element={<Layout><Outlet /></Layout>}>
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
          <Route path="/invoicing" element={<ProtectedRoute><Invoicing /></ProtectedRoute>} />
          <Route path="/workshop" element={<ProtectedRoute><Workshop /></ProtectedRoute>} />
          
          {/* EzyParts Routes */}
          <Route path="/ezyparts/*" element={<ProtectedRoute><EzyPartsRoutes /></ProtectedRoute>} />
        </Route>
      </Routes>
    </NotificationProvider>
  );
};

export default App;
