
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
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
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/auth/signin" element={<Auth />} />
            <Route path="/auth/signup" element={<Auth />} />
            <Route path="/auth" element={<Navigate to="/auth/signin" replace />} />
            
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
            <Route 
              path="/workshop" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Workshop />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/booking-diary" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <BookingDiary />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/jobs" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Jobs />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/workshop-setup" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <WorkshopSetup />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/technician-portal" 
              element={
                <ProtectedRoute>
                  <TechnicianPortal />
                </ProtectedRoute>
              } 
            />
            
            <Route path="/inventory" element={<ProtectedRoute><Layout><Inventory /></Layout></ProtectedRoute>} />
            <Route path="/customers" element={<ProtectedRoute><Layout><Customers /></Layout></ProtectedRoute>} />
            <Route path="/invoicing" element={<ProtectedRoute><Layout><Invoicing /></Layout></ProtectedRoute>} />
            <Route path="/invoices" element={<Navigate to="/invoicing" replace />} /> {/* Redirect to combined page */}
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
            
            {/* Catch all routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
