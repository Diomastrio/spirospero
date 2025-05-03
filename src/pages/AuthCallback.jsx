import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { handleAuthCallback } from "../services/apiAuth";

function AuthCallback() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    async function processCallback() {
      try {
        // Process the auth callback and create profile
        const userData = await handleAuthCallback();

        // Update the user data in React Query
        queryClient.setQueryData(["user"], userData.user);

        // Invalidate to ensure we get fresh data
        await queryClient.invalidateQueries(["user"]);

        navigate("/home", { replace: true });
      } catch (error) {
        console.error("Authentication callback error:", error);
        toast.error(`Authentication failed: ${error.message}`);
        navigate("/login", { replace: true });
      }
    }

    processCallback();
  }, [navigate, queryClient]);

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
