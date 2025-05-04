import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import React, { useEffect } from "react"; // Import useEffect
import {
  login as loginApi,
  getCurrentUser,
  updateCurrentUser,
  logout as logoutApi,
  signup as signupApi,
  signInWithGoogle,
  createUserProfileIfNeeded, // Import the function
} from "../services/apiAuth";

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: login, isLoading } = useMutation({
    mutationFn: ({ email, password }) => loginApi({ email, password }),
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user.user);
      navigate("/home", { replace: true });
    },
    onError: (err) => {
      console.log("ERROR", err);
      toast.error(
        "El correo electrónico o la contraseña proporcionados son incorrectos"
      );
    },
  });

  return { login, isLoading };
}

export function useUser() {
  const {
    isLoading,
    data: user,
    isSuccess,
  } = useQuery({
    // Add isSuccess
    queryKey: ["user"],
    queryFn: getCurrentUser,
    retry: false, // Optional: prevent retrying if user is null initially
  });

  // Effect to create profile if needed after user data is fetched
  useEffect(() => {
    if (isSuccess && user) {
      // Check if the user object has the structure returned by getCurrentUser
      const authUser = user.user; // Access the nested user object from Supabase auth
      if (authUser) {
        createUserProfileIfNeeded(authUser).catch((error) => {
          console.error("Failed to create profile:", error);
          // Optionally show a toast error
          // toast.error("Failed to initialize user profile.");
        });
      }
    }
  }, [user, isSuccess]); // Depend on user data and success status

  return {
    isLoading,
    // Return the combined profile and auth user object as before
    user,
    isAuthenticated: user?.role === "authenticated", // Check role on the profile part
    isAdmin: user?.role === "admin",
  };
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  const { mutate: updateUser, isLoading: isUpdating } = useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: ({ user }) => {
      toast.success("El usuario ha sido actualizado exitosamente");
      queryClient.setQueryData(["user"], user);
    },
    onError: (err) => toast.error(err.message),
  });

  return {
    updateUser: (data, options = {}) => {
      return updateUser(data, {
        onSuccess: (userData) => {
          if (options.onSuccess) options.onSuccess(userData);
        },
        ...options,
      });
    },
    isUpdating,
  };
}

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: logout, isLoading } = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      queryClient.removeQueries();
      navigate("/login", { replace: true });
    },
  });

  return { logout, isLoading };
}

export function useSignup() {
  const navigate = useNavigate();

  const { mutate: signup, isLoading } = useMutation({
    mutationFn: signupApi,
    onSuccess: (user) => {
      toast.success("¡Cuenta creada con éxito!");
      navigate("/dashboard", { replace: true });
    },
    onError: (error) => {
      if (error.message === "Email already registered") {
        toast.error("¡El correo electrónico ya está registrado!", {
          delay: 4000,
        });
        navigate("/register", { replace: true });
      } else {
        toast.error("¡Ha ocurrido un error al crear la cuenta!");
      }
    },
  });

  return { signup, isLoading };
}

export function useGoogleLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: googleLogin, isLoading } = useMutation({
    mutationFn: signInWithGoogle,
    onSuccess: async (data) => {
      try {
        // 1. First update query cache with basic user data
        queryClient.setQueryData(["user"], data.user);

        // 2. Create profile if needed - wait for this to complete
        if (data.user) {
          console.log("Creating profile for Google user:", data.user);
          await createUserProfileIfNeeded({
            id: data.user.id,
            email: data.user.email,
            user_metadata: {
              full_name:
                data.user.user_metadata?.name ||
                data.user.user_metadata?.full_name ||
                "",
              avatar_url: data.user.user_metadata?.avatar_url || "",
            },
          });

          // 3. Invalidate and refetch to get complete user data with profile
          await queryClient.invalidateQueries(["user"]);

          // 4. Success message and navigation
          toast.success("Successfully signed in with Google!");
          navigate("/home", { replace: true });
        } else {
          console.error("Google user data is missing:", data.user);
        }
      } catch (error) {
        console.error("Profile creation error:", error);
        toast.error(`Error setting up profile: ${error.message}`);
      }
    },
    onError: (err) => {
      console.error("Google login error:", err);
      toast.error("Error authenticating with Google");
    },
  });

  return { googleLogin, isLoading };
}
