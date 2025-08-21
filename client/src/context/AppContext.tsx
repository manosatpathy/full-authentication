import Toast from "@/components/Toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useState } from "react";
import * as apiClient from "../api-Client";
import { useLogout } from "@/hooks/useLogout";
import { is401 } from "@/utils/is401";

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
  const showToast = useCallback(
    (toastMessage: ToastMessage) => setToast(toastMessage),
    []
  );
  const logoutMutation = useLogout(showToast);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        return await apiClient.getCurrentUser();
      } catch (err) {
        if (!is401(err)) throw err;
        try {
          await apiClient.refreshToken();
          return await apiClient.getCurrentUser();
        } catch (refreshErr) {
          await logoutMutation.mutateAsync();
          qc.setQueryData(["me"], { user: null });
          throw refreshErr;
        }
      }
    },
    retry: false,
  });

  const logout = useCallback(() => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        qc.setQueryData(["me"], { user: null });
      },
    });
  }, [logoutMutation, qc]);

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
