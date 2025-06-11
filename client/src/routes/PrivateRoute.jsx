import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { Fade } from "react-awesome-reveal";
import { useEffect, useState } from "react";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [cachedUser, setCachedUser] = useState(null);

  // Check localStorage for user data on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCachedUser(JSON.parse(storedUser));
    }
  }, []);

  // Show loading spinner while checking authentication status
  // but only if we don't have cached user data
  if (loading && !cachedUser) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  // If user is authenticated (either from context or localStorage), render the protected component
  if (user || cachedUser) {
    return <Fade>{children}</Fade>;
  }

  // If not authenticated, redirect to login page with return URL
  // Using Navigate component with replace to avoid adding to history stack
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute;