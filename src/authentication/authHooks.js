import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export function useLogin() {
  const { signIn } = useAuthActions();
  const navigate = useNavigate();

  const login = async ({ email, password }) => {
    try {
      await signIn("password", { email, password, flow: "signIn" });
      navigate("/home", { replace: true });
    } catch (error) {
      toast.error("Invalid credentials");
    }
  };

  return { login, isLoading: false };
}

export function useUser() {
  const user = useQuery(api.users?.current); // Optional chaining to prevent crash if not generated

  return {
    isLoading: user === undefined,
    user,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || user?.role === "admin",
  };
}

export function useUpdateUser() {
  const updateUser = async () => {
    toast.error("Update user not yet implemented");
  };

  return { updateUser, isUpdating: false };
}

export function useLogout() {
  const { signOut } = useAuthActions();
  const navigate = useNavigate();

  const logout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return { logout, isLoading: false };
}

export function useSignup() {
  const { signIn } = useAuthActions();
  const navigate = useNavigate();

  const signup = async ({ email, password, nickname, role }) => {
    try {
      await signIn("password", {
        email,
        password,
        name: nickname,
        role,
        isAdmin: role === "admin",
        flow: "signUp",
      });
      toast.success("Account created successfully!");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error("Error creating account!");
    }
  };

  return { signup, isLoading: false };
}

export function useGoogleLogin() {
  const { signIn } = useAuthActions();

  const googleLogin = async () => {
    toast.error("Google Auth is temporarily disabled");
  };

  return { googleLogin, isLoading: false };
}
