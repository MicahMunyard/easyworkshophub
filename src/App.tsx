
import React from "react";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import { useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Jobs from "./pages/Jobs";

const App = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* App Routes with Layout */}
      <Route element={<Layout><React.Fragment /></Layout>}>
        <Route path="/" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
};

export default App;
