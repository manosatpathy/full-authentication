import Toast from "@/components/Toast";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";
import * as apiClient from "../api-Client";
import { useLogout } from "@/hooks/useLogout";

type ToastMessage = {
  message: string;
  type: "SUCCESS" | "ERROR";
};

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  email_verified: boolean;
}

type AppContext = {
  showToast: (toastMessage: ToastMessage) => void;
  user: User | null;
  isAuthenticated: boolean;
  logout: () => void;
};

const AppContext = createContext<AppContext | undefined>(undefined);

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [toast, setToast] = useState<ToastMessage | undefined>(undefined);
  const [user, setUser] = useState<User | null>(null);
  const [hasTriedRefresh, setHasTriedRefresh] = useState(false);

  const showToast = (toastMessage: ToastMessage) => setToast(toastMessage);
  const logoutMutation = useLogout(showToast);

  const { data, refetch, isError } = useQuery({
    queryKey: ["me"],
    queryFn: apiClient.getCurrentUser,
  });

  const hasRefreshToken = document.cookie.includes("refreshToken");

  useEffect(() => {
    const handleRefresh = async () => {
      try {
        if (!hasRefreshToken) return;
        await apiClient.refreshToken();
        setHasTriedRefresh(false);
        refetch();
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);
        logoutMutation.mutate();
      }
    };

    if (isError && !hasTriedRefresh) {
      setHasTriedRefresh(true);
      handleRefresh();
    }
  }, [isError, hasTriedRefresh, refetch, logoutMutation, hasRefreshToken]);

  useEffect(() => {
    if (data) {
      setUser(data.data);
      setHasTriedRefresh(false);
    }
  }, [data]);

  const logout = () => {
    logoutMutation.mutate();
  };

  return (
    <AppContext.Provider
      value={{
        showToast,
        user,
        isAuthenticated: !isError && !!user,
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
