import Toast from "@/components/Toast";
import { useQuery } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import * as apiClient from "../api-Client";
import { useLogout } from "@/hooks/useLogout";
import { useNavigate } from "react-router-dom";
import { setLogoutFunction } from "@/utils/AxiosInstance";

export type ToastMessage = {
  message: string;
  type: "SUCCESS" | "ERROR";
};

export interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
}

type AppContext = {
  showToast: (toastMessage: ToastMessage) => void;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
};

const AppContext = createContext<AppContext | undefined>(undefined);

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [toast, setToast] = useState<ToastMessage | undefined>(undefined);
  const showToast = useCallback(
    (toastMessage: ToastMessage) => setToast(toastMessage),
    []
  );
  const navigate = useNavigate();

  const logoutMutation = useLogout(showToast, navigate);

  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: apiClient.getCurrentUser,
    retry: false,
  });

  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  useEffect(() => {
    setLogoutFunction(logout);
  }, [logout]);

  const user = data?.user ?? null;
  const isAuthenticated = !!user;

  return (
    <AppContext.Provider
      value={{
        showToast,
        user,
        isAuthenticated,
        isLoading,
        logout,
      }}
    >
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(undefined)}
        />
      )}
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  return context as AppContext;
};
