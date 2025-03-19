
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import BookingDiary from "./pages/BookingDiary";
import Jobs from "./pages/Jobs";
import Inventory from "./pages/Inventory";
import Customers from "./pages/Customers";
import Invoices from "./pages/Invoices";
import PointOfSale from "./pages/PointOfSale";
import Suppliers from "./pages/Suppliers";
import Reports from "./pages/Reports";
import Marketing from "./pages/Marketing";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth/signin" element={<Auth />} />
            <Route path="/auth/signup" element={<Auth />} />
            
            <Route 
              path="/" 
              element={
                <Layout>
                  <Index />
                </Layout>
              } 
            />
            <Route 
              path="/booking-diary" 
              element={
                <Layout>
                  <BookingDiary />
                </Layout>
              } 
            />
            <Route 
              path="/jobs" 
              element={
                <Layout>
                  <Jobs />
                </Layout>
              } 
            />
            <Route 
              path="/inventory" 
              element={
                <Layout>
                  <Inventory />
                </Layout>
              } 
            />
            <Route 
              path="/customers" 
              element={
                <Layout>
                  <Customers />
                </Layout>
              } 
            />
            <Route 
              path="/invoices" 
              element={
                <Layout>
                  <Invoices />
                </Layout>
              } 
            />
            <Route 
              path="/pos" 
              element={
                <Layout>
                  <PointOfSale />
                </Layout>
              } 
            />
            <Route 
              path="/suppliers" 
              element={
                <Layout>
                  <Suppliers />
                </Layout>
              } 
            />
            <Route 
              path="/reports" 
              element={
                <Layout>
                  <Reports />
                </Layout>
              } 
            />
            <Route 
              path="/marketing" 
              element={
                <Layout>
                  <Marketing />
                </Layout>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <Layout>
                  <Profile />
                </Layout>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <Layout>
                  <Settings />
                </Layout>
              } 
            />
            
            <Route path="/auth" element={<Navigate to="/auth/signin" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
