import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useConvexAuth } from "convex/react";

function AuthCallback() {
  const navigate = useNavigate();
  const { isAuthenticated } = useConvexAuth();

  useEffect(() => {
    // With Convex Auth Password provider, auth is handled via Login/Register pages
    // This route is kept for compatibility but simply redirects authenticated users
    if (isAuthenticated) {
      navigate("/home", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate, isAuthenticated]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-medium mb-2">Completing your sign in</h2>
        <p>Please wait while we finish setting up your account...</p>
      </div>
    </div>
  );
}

export default AuthCallback;
