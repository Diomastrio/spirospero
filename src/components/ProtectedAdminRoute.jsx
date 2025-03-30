import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../authentication/authHooks";
import { Loader } from "lucide-react";

function ProtectedAdminRoute() {
  const { user, isLoading, isAdmin } = useUser();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin mr-2" />
        <span>Checking permissions...</span>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If not an admin, redirect to home
  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  // If user is admin, render the protected content
  return <Outlet />;
}

export default ProtectedAdminRoute;
