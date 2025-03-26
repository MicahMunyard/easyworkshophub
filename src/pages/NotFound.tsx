
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
        <p className="text-gray-500 mb-8">
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <Button 
              onClick={() => navigate("/")} 
              className="inline-flex items-center"
            >
              <Home className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Button>
          ) : (
            <>
              <Button 
                onClick={() => navigate("/auth/signin")} 
                className="inline-flex items-center"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate("/auth/signup")} 
                className="inline-flex items-center"
              >
                Create Account
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
