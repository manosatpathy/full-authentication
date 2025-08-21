import Toast from "@/components/Toast";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";
import * as apiClient from "../api-Client";
import { useLogout } from "@/hooks/useLogout";

export type ToastMessage = {
  message: string;
  type: "SUCCESS" | "ERROR";
};

export interface User {
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
  const [user, setUser] = useState<User | null>(null);
  const [hasTriedRefresh, setHasTriedRefresh] = useState(false);

  const showToast = (toastMessage: ToastMessage) => setToast(toastMessage);
  const logoutMutation = useLogout(showToast);

  const { data, refetch, isError, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: apiClient.getCurrentUser,
  });

  useEffect(() => {
    const handleRefresh = async () => {
      try {
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
  }, [isError, hasTriedRefresh, refetch, logoutMutation]);

  useEffect(() => {
    if (data) {
      setUser(data.user);
      setHasTriedRefresh(false);
    }
  }, [data]);

  const logout = () => {
    logoutMutation.mutate();
  };

  const isAuthenticated = !isLoading && !isError && !!data.user;

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
