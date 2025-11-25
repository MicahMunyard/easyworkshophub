
import React from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet
} from "react-router-dom";
import { FileText, Mail, MessageSquare, Package, TrendingUp, Megaphone, Clock, Wrench } from "lucide-react";
import Layout from "./components/Layout";
import { useAuth } from "./contexts/AuthContext";
import { TierProvider } from "./contexts/TierContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { TierRoute } from "./components/tier/TierRoute";
import Auth from "./pages/Auth";
import Jobs from "./pages/Jobs";
import Invoicing from "./pages/Invoicing";
import Index from "./pages/Index";
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
import AuthCallback from './pages/AuthCallback';
import AIChatWidget from './components/ai/AIChatWidget';
import OnboardingRoute from './components/OnboardingRoute';
import Onboarding from './pages/Onboarding';
import PendingApproval from './pages/PendingApproval';
import AccountApprovals from './pages/admin/AccountApprovals';
import XeroOAuthCallback from './pages/integrations/xero/oauth';
import ChartOfAccounts from './pages/integrations/xero/ChartOfAccounts';

const App = () => {
  const { user } = useAuth();
  
  return (
    <TierProvider>
      {user && <AIChatWidget chatType="general_help" title="WorkshopBase Help" />}
      <Routes>
        {/* Auth Routes - should be accessible without authentication */}
        <Route path="/auth/signin" element={<Auth />} />
        <Route path="/auth/signup" element={<Auth />} />
        <Route path="/auth/reset-password" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Pending Approval - for users awaiting account approval */}
        <Route path="/pending-approval" element={<ProtectedRoute><PendingApproval /></ProtectedRoute>} />

        {/* Onboarding */}
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route path="/admin/accounts" element={<ProtectedRoute><OnboardingRoute><Layout><AccountApprovals /></Layout></OnboardingRoute></ProtectedRoute>} />

        {/* App Routes with Layout - Protected by Onboarding */}
        <Route element={<OnboardingRoute><Layout><Outlet /></Layout></OnboardingRoute>}>
          {/* Main Pages - Tier 1 features (no tier restriction) */}
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/booking-diary" element={<ProtectedRoute><BookingDiary /></ProtectedRoute>} />
          <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
          
          {/* Tier 2 features - require tier check */}
          <Route path="/invoicing" element={
            <ProtectedRoute>
              <TierRoute 
                featureKey="invoicing"
                pageTitle="Invoicing & Financial Management"
                pageDescription="Create professional invoices, track payments, and manage your workshop's finances all in one place. Integrate with Xero for seamless accounting."
                pageFeatures={[
                  "Create and send professional invoices",
                  "Track payment status and overdue invoices",
                  "Integration with Xero accounting software",
                  "Financial reporting and analytics",
                  "Customer payment history"
                ]}
                pageIcon={<FileText className="h-12 w-12" />}
              >
                <Invoicing />
              </TierRoute>
            </ProtectedRoute>
          } />
          <Route path="/email-integration" element={
            <ProtectedRoute>
              <TierRoute 
                featureKey="email"
                pageTitle="Email Integration"
                pageDescription="Connect your Gmail or Outlook email to automatically create bookings from customer emails and streamline communication."
                pageFeatures={[
                  "Automatic booking creation from emails",
                  "Email inbox management",
                  "Customer communication tracking",
                  "Email automation and templates",
                  "Smart email parsing"
                ]}
                pageIcon={<Mail className="h-12 w-12" />}
              >
                <EmailIntegration />
              </TierRoute>
            </ProtectedRoute>
          } />
          <Route path="/communication" element={
            <ProtectedRoute>
              <TierRoute 
                featureKey="communication"
                pageTitle="Social Media Communication Hub"
                pageDescription="Manage all your customer communications from Facebook Messenger in one centralized location. Never miss a customer message."
                pageFeatures={[
                  "Facebook Messenger integration",
                  "Centralized inbox for all conversations",
                  "Message history and search",
                  "Quick replies and templates",
                  "Customer conversation tracking"
                ]}
                pageIcon={<MessageSquare className="h-12 w-12" />}
              >
                <Communication />
              </TierRoute>
            </ProtectedRoute>
          } />
          <Route path="/inventory" element={
            <ProtectedRoute>
              <TierRoute 
                featureKey="inventory"
                pageTitle="Inventory & Parts Management"
                pageDescription="Keep track of all your parts and supplies with smart inventory management. Know what's in stock, what needs reordering, and manage your suppliers efficiently."
                pageFeatures={[
                  "Real-time stock tracking",
                  "Low stock alerts and notifications",
                  "Supplier management and contacts",
                  "Purchase order creation and tracking",
                  "Parts usage history and analytics"
                ]}
                pageIcon={<Package className="h-12 w-12" />}
              >
                <Inventory />
              </TierRoute>
            </ProtectedRoute>
          } />
          <Route path="/marketing" element={
            <ProtectedRoute>
              <TierRoute 
                featureKey="marketing"
                pageTitle="Marketing & Customer Engagement"
                pageDescription="Engage with your customers through targeted marketing campaigns and email newsletters. Build customer loyalty and grow your business."
                pageFeatures={[
                  "Email marketing campaigns",
                  "Customer segmentation and targeting",
                  "Newsletter creation and scheduling",
                  "Marketing analytics and insights",
                  "Customer retention tools"
                ]}
                pageIcon={<Megaphone className="h-12 w-12" />}
              >
                <Marketing />
              </TierRoute>
            </ProtectedRoute>
          } />
          <Route path="/email-marketing" element={
            <ProtectedRoute>
              <TierRoute 
                featureKey="marketing"
                pageTitle="Email Marketing"
                pageDescription="Create and send professional email campaigns to your customers. Build custom templates and track engagement."
                pageFeatures={[
                  "Professional email templates",
                  "Campaign scheduling",
                  "Customer list management",
                  "Email analytics and tracking",
                  "Automated follow-ups"
                ]}
                pageIcon={<Mail className="h-12 w-12" />}
              >
                <EmailMarketing />
              </TierRoute>
            </ProtectedRoute>
          } />
          <Route path="/reviews" element={
            <ProtectedRoute>
              <TierRoute 
                featureKey="marketing"
                pageTitle="Customer Reviews & Feedback"
                pageDescription="Collect and manage customer reviews and feedback. Build your reputation and improve your services."
                pageFeatures={[
                  "Review collection and management",
                  "Customer feedback tracking",
                  "Reputation monitoring",
                  "Response templates",
                  "Analytics and insights"
                ]}
                pageIcon={<TrendingUp className="h-12 w-12" />}
              >
                <Reviews />
              </TierRoute>
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <TierRoute 
                featureKey="reports"
                pageTitle="Reports & Business Analytics"
                pageDescription="Gain deep insights into your workshop's performance with comprehensive reports and analytics. Make data-driven decisions to grow your business."
                pageFeatures={[
                  "Revenue and profit reports",
                  "Technician performance metrics",
                  "Customer analytics and trends",
                  "Financial dashboards",
                  "Custom report builder"
                ]}
                pageIcon={<TrendingUp className="h-12 w-12" />}
              >
                <Reports />
              </TierRoute>
            </ProtectedRoute>
          } />
          <Route path="/timesheets" element={
            <ProtectedRoute>
              <TierRoute 
                featureKey="timesheets"
                pageTitle="Timesheet & Labor Management"
                pageDescription="Track technician hours, job time, and labor costs with precision. Ensure accurate billing and optimize workforce productivity."
                pageFeatures={[
                  "Time tracking per job and task",
                  "Technician timesheet management",
                  "Labor cost calculations",
                  "Overtime tracking",
                  "Payroll integration ready"
                ]}
                pageIcon={<Clock className="h-12 w-12" />}
              >
                <Timesheets />
              </TierRoute>
            </ProtectedRoute>
          } />
          <Route path="/timesheets/entries" element={
            <ProtectedRoute>
              <TierRoute 
                featureKey="timesheets"
                pageTitle="Time Entries"
                pageDescription="View and manage detailed time entries for all jobs and technicians."
                pageFeatures={[
                  "Detailed time entry logging",
                  "Edit and approve entries",
                  "Filter by technician or job",
                  "Export for payroll",
                  "Time tracking reports"
                ]}
                pageIcon={<Clock className="h-12 w-12" />}
              >
                <Timesheets />
              </TierRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/workshop" element={<ProtectedRoute><Workshop /></ProtectedRoute>} />
          <Route path="/workshop-setup" element={<ProtectedRoute><WorkshopSetup /></ProtectedRoute>} />
          <Route path="/technician-portal" element={<TechnicianPortal />} /> 
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute><div className="container py-8"><h1 className="text-3xl font-bold mb-4">Help & Support</h1><p>This page is under construction.</p></div></ProtectedRoute>} />
          
          {/* EzyParts Routes - Tier 2 */}
          <Route path="/ezyparts" element={
            <ProtectedRoute>
              <TierRoute 
                featureKey="ezyparts"
                pageTitle="EzyParts Integration"
                pageDescription="Access Australia's largest parts network directly from WorkshopBase. Search, quote, and order parts from hundreds of suppliers in seconds."
                pageFeatures={[
                  "Search 1000+ suppliers instantly",
                  "Real-time stock availability",
                  "Instant price quotes",
                  "Direct ordering from suppliers",
                  "Part number lookup and cross-reference"
                ]}
                pageIcon={<Wrench className="h-12 w-12" />}
              >
                <EzyPartsDashboard />
              </TierRoute>
            </ProtectedRoute>
          } />
          <Route path="/ezyparts/search" element={
            <ProtectedRoute>
              <TierRoute 
                featureKey="ezyparts"
                pageTitle="EzyParts Search"
                pageDescription="Search for parts across hundreds of suppliers with instant results."
                pageFeatures={[
                  "Advanced part search",
                  "Vehicle-specific parts lookup",
                  "Compare prices across suppliers",
                  "Save quotes for later",
                  "Quick ordering"
                ]}
                pageIcon={<Wrench className="h-12 w-12" />}
              >
                <VehicleSearch />
              </TierRoute>
            </ProtectedRoute>
          } />
          
          {/* Route for EmailDesignerPage */}
          <Route path="/email-designer/:mode/:id?" element={<EmailDesignerPage />} />
          
          {/* Email OAuth callback route */}
          <Route path="/email/callback" element={<EmailCallback />} />
        </Route>
        
        {/* Integration Routes (outside main layout) */}
        <Route path="/integrations/xero/oauth" element={<ProtectedRoute><XeroOAuthCallback /></ProtectedRoute>} />
        <Route path="/integrations/xero/chart-of-accounts" element={<ProtectedRoute><OnboardingRoute><ChartOfAccounts /></OnboardingRoute></ProtectedRoute>} />
        
        <Route element={<OnboardingRoute><Layout><Outlet /></Layout></OnboardingRoute>}>
          
          {/* Redirect any unmatched routes to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </TierProvider>
  );
};

export default App;
