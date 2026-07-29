import { useAuth } from "@/context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Wraps a route and redirects to /login if the user is not authenticated.
 * Preserves the intended path so we can redirect back after login.
 */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // While checking auth, show nothing (prevents flash of redirect)
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-dosis">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;

