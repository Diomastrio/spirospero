import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../authentication/authHooks";
import { Loader } from "lucide-react";

function ProtectedRoute() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin mr-2" />
        <span>Checking authentication...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
