
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
