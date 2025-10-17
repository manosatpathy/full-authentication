import { axiosInstance, refreshAxiosInstance } from "./axiosInstance";
import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

interface FailedQueueItem {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}

let clientCleanup: (() => void) | null = null;
let isLoggingOut = false;

export const setClientCleanup = (cleanupFn: () => void) => {
  clientCleanup = cleanupFn;
};

const performClientCleanup = () => {
  if (isLoggingOut) return;
  isLoggingOut = true;

  if (clientCleanup) {
    clientCleanup();
  } else {
    console.warn("Logout function not available");
    window.location.href = "/";
  }
};

const getCookie = (name: string) => {
  const cookies = `; ${document.cookie}`;
  const cookieArray = cookies.split(`; ${name}=`);
  if (cookieArray.length === 2) return cookieArray.pop()?.split(";").shift();
};

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (
      config.method === "post" ||
      config.method === "patch" ||
      config.method === "put" ||
      config.method === "delete"
    ) {
      const csrfToken = getCookie("csrfToken");
      if (csrfToken) {
        config.headers["x-csrf-token"] = csrfToken;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

let isRefreshing = false;
const failedQueue: Array<FailedQueueItem> = [];

let isRefreshingCsrf = false;
const failedCsrfQueue: Array<FailedQueueItem> = [];

const processQueue = (error: unknown): void => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(null);
    }
  });
  failedQueue.length = 0;
};

const processCsrfQueue = (error: unknown): void => {
  failedCsrfQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(null);
    }
  });
  failedCsrfQueue.length = 0;
};

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const errorCode = (error.response?.data as { code?: string })?.code || "";

    if (isLoggingOut) {
      return Promise.reject(error);
    }

    if (originalRequest.url === "/auth/refresh-token") {
      performClientCleanup();
      return Promise.reject(error);
    }

    if (error.response?.status === 403 && !originalRequest._retry) {
      if (errorCode.startsWith("CSRF_")) {
        if (isRefreshingCsrf) {
          return new Promise((resolve, reject) => {
            failedCsrfQueue.push({ resolve, reject });
          }).then(() => axiosInstance(originalRequest));
        }

        originalRequest._retry = true;
        isRefreshingCsrf = true;

        try {
          await axiosInstance.post("/auth/refresh-csrf");
          processCsrfQueue(null);
          return axiosInstance(originalRequest);
        } catch (error) {
          processCsrfQueue(error);
          console.error("Failed to refresh csrf token", error);
          return Promise.reject(error);
        } finally {
          isRefreshingCsrf = false;
        }
      }
    }

    if (error.response?.status === 401) {
      if (originalRequest._retry) {
        performClientCleanup();
        return Promise.reject(error);
      }

      if (errorCode.startsWith("REFRESH_")) {
        performClientCleanup();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await refreshAxiosInstance.post("/auth/refresh-token");
        processQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.log("Token refresh failed:", refreshError);
        performClientCleanup();
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
