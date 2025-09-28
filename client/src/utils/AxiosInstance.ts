import axios from "axios";

interface FailedQueueItem {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}

let globalLogout: (() => void) | null = null;

export const setLogoutFunction = (logoutFn: () => void) => {
  globalLogout = logoutFn;
};

const handleAuthFailure = () => {
  if (globalLogout) {
    globalLogout();
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

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (
      config.method === "POST" ||
      config.method === "PUT" ||
      config.method === "DELETE"
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

    if (error.response?.status === 403 && !originalRequest._retry) {
      const errorCode = error.response.data.code || "";

      if (errorCode.startsWith("CSRF_")) {
        if (isRefreshingCsrf) {
          return new Promise((resolve, reject) => {
            failedCsrfQueue.push({ resolve, reject });
          }).then(() => axiosInstance(originalRequest));
        }

        originalRequest._retry = true;
        isRefreshingCsrf = true;

        try {
          console.log("entering to the csrf token refresh call");
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
      } catch (refreshError: unknown) {
        console.error("Refresh failed", refreshError);

        if (
          axios.isAxiosError(refreshError) &&
          refreshError.response?.status === 401
        ) {
          console.log("Session expired - logging out user");
          processQueue(refreshError);
          handleAuthFailure();
          return Promise.reject(
            new Error("Session expired. Please login again.")
          );
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
