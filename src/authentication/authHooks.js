import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  login as loginApi,
  getCurrentUser,
  updateCurrentUser,
  logout as logoutApi,
  signup as signupApi,
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
  const { isLoading, data: user } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
  });

  return {
    isLoading,
    user,
    isAuthenticated: user?.role === "authenticated",
    isAdmin: user?.role === "admin", // Fix: user.role instead of user.user_metadata.rol
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
