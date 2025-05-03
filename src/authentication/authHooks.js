import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import React, { useEffect, useState } from "react"; // Import useEffect and useState
import {
  login as loginApi,
  updateCurrentUser,
  logout as logoutApi,
  signup as signupApi,
  signInWithGoogle,
  createUserProfileIfNeeded,
} from "../services/apiAuth";
import { supabase } from "../services/supabaseClient"; // Import supabase client

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: login, isLoading } = useMutation({
    mutationFn: ({ email, password }) => loginApi({ email, password }),
    onSuccess: async (data) => {
      // First set the basic user data we have
      queryClient.setQueryData(["user"], data.user);

      // Then invalidate the query to force a refetch with complete profile data
      await queryClient.invalidateQueries(["user"]);

      // Only navigate after we have the complete data
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
  const [userState, setUserState] = useState({
    user: null,
    isAdmin: false,
    isLoading: true,
  });

  useEffect(() => {
    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUserState((prev) => ({ ...prev, isLoading: true }));

        if (session) {
          try {
            // Fetch the complete user profile
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            setUserState({
              user: { ...session.user, ...profile },
              isAdmin: profile?.role === "admin",
              isLoading: false,
            });
          } catch (error) {
            console.error("Error fetching profile:", error);
            setUserState({
              user: session.user,
              isAdmin: false,
              isLoading: false,
            });
          }
        } else {
          setUserState({
            user: null,
            isAdmin: false,
            isLoading: false,
          });
        }
      }
    );

    // Initial fetch of user data
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setUserState({ user: null, isAdmin: false, isLoading: false });
        return;
      }

      // We already have the listener set up to handle this
    });

    // Clean up subscription
    return () => {
      if (authListener?.subscription) authListener.subscription.unsubscribe();
    };
  }, []);

  return userState;
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
