
import React from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet
} from "react-router-dom";
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
          <Route path="/invoicing" element={<ProtectedRoute><TierRoute featureKey="invoicing"><Invoicing /></TierRoute></ProtectedRoute>} />
          <Route path="/email-integration" element={<ProtectedRoute><TierRoute featureKey="email"><EmailIntegration /></TierRoute></ProtectedRoute>} />
          <Route path="/communication" element={<ProtectedRoute><TierRoute featureKey="communication"><Communication /></TierRoute></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><TierRoute featureKey="inventory"><Inventory /></TierRoute></ProtectedRoute>} />
          <Route path="/marketing" element={<ProtectedRoute><TierRoute featureKey="marketing"><Marketing /></TierRoute></ProtectedRoute>} />
          <Route path="/email-marketing" element={<ProtectedRoute><TierRoute featureKey="marketing"><EmailMarketing /></TierRoute></ProtectedRoute>} />
          <Route path="/reviews" element={<ProtectedRoute><TierRoute featureKey="marketing"><Reviews /></TierRoute></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><TierRoute featureKey="reports"><Reports /></TierRoute></ProtectedRoute>} />
          <Route path="/timesheets" element={<ProtectedRoute><TierRoute featureKey="timesheets"><Timesheets /></TierRoute></ProtectedRoute>} />
          <Route path="/timesheets/entries" element={<ProtectedRoute><TierRoute featureKey="timesheets"><Timesheets /></TierRoute></ProtectedRoute>} />
          
          <Route path="/workshop" element={<ProtectedRoute><Workshop /></ProtectedRoute>} />
          <Route path="/workshop-setup" element={<ProtectedRoute><WorkshopSetup /></ProtectedRoute>} />
          <Route path="/technician-portal" element={<TechnicianPortal />} /> 
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute><div className="container py-8"><h1 className="text-3xl font-bold mb-4">Help & Support</h1><p>This page is under construction.</p></div></ProtectedRoute>} />
          
          {/* EzyParts Routes - Tier 2 */}
          <Route path="/ezyparts" element={<ProtectedRoute><TierRoute featureKey="ezyparts"><EzyPartsDashboard /></TierRoute></ProtectedRoute>} />
          <Route path="/ezyparts/search" element={<ProtectedRoute><TierRoute featureKey="ezyparts"><VehicleSearch /></TierRoute></ProtectedRoute>} />
          
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
