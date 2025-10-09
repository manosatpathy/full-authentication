import axios from "axios";
import axiosInstance from "./axiosInstance";

interface FailedQueueItem {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}

let clientCleanup: (() => void) | null = null;

export const setClientCleanup = (cleanupFn: () => void) => {
  clientCleanup = cleanupFn;
};

const performClientCleanup = () => {
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
  (config) => {
    if (
      config.method === "post" ||
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
  (error) => Promise.reject(error)
);

let isRefreshing = false;
const failedQueue: Array<FailedQueueItem> = [];

let isRefreshingCsrf = false;
const failedCsrfQueue: Array<FailedQueueItem> = [];

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      console.log("hitting promise reject block", error);
      reject(error);
    } else {
      resolve(null);
    }
  });
  failedQueue.length = 0;
};

const processCsrfQueue = (
  error: unknown,
  token: string | null = null
): void => {
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
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const errorCode = error.response?.data?.code || "";

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

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("hitting refresh logic");

      if (errorCode.startsWith("REFRESH_")) {
        console.log("Refresh token not found or invalid - logging out user");
        performClientCleanup();
        return Promise.reject(
          new Error("Refresh token not found. Please login again.")
        );
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => axiosInstance(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axiosInstance.post("/auth/refresh-token");
        processQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        if (axios.isAxiosError(refreshError)) {
          if (refreshError.response?.status === 401) {
            const refreshErrorCode = refreshError.response?.data?.code || "";

            if (refreshErrorCode.startsWith("REFRESH_")) {
              console.log("Refresh token API failed - logging out");
              performClientCleanup();
            }
          }
        }

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
