import axios from "axios";

export const server = import.meta.env.VITE_SERVER_URL ?? "http://localhost:4000/api/v1";

export const api = axios.create({
  baseURL: server,
  withCredentials: true,
});

const getCookie = (name) => {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
};

let isRefreshing = false;
let isRefreshingCSRFToken = false;
let failedQueue = [];
let csrfFailedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(undefined);
    }
  });
  failedQueue = [];
};

const processCSRFQueue = (error) => {
  csrfFailedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(undefined);
    }
  });
  csrfFailedQueue = [];
};

api.interceptors.request.use(
  async (config) => {
    if (
      ["post", "put", "delete", "patch"].includes(config.method?.toLowerCase())
    ) {
      const csrfToken = getCookie("csrfToken");
      if (csrfToken) {
        config.headers["x-csrf-token"] = csrfToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      !error.response ||
      (error.response.status !== 401 && error.response.status !== 403)
    ) {
      return Promise.reject(error);
    }

    const url = originalRequest.url || "";
    const errorCode = error.response?.data?.code || "";

    const isLogin = url.includes("/login");
    const isRegister = url.includes("/register");
    const isLogout = url.includes("/logout");
    const isRefreshCSRF = url.includes("/refresh/csrf");
    const isRefreshToken = url.includes("/refresh/token");

    if (
      isLogin ||
      isRegister ||
      (isLogout && !errorCode.startsWith("CSRF_")) ||
      (isRefreshCSRF && errorCode.startsWith("CSRF_")) ||
      (isRefreshToken && !errorCode.startsWith("CSRF_"))
    ) {
      return Promise.reject(error);
    }

    if (errorCode.startsWith("CSRF_") && !originalRequest._csrfRetry) {
      if (isRefreshingCSRFToken) {
        return new Promise((resolve, reject) => {
          csrfFailedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._csrfRetry = true;
      isRefreshingCSRFToken = true;

      try {
        await api.post("/auth/refresh/csrf");
        processCSRFQueue(null);
        return api(originalRequest);
      } catch (csrfError) {
        processCSRFQueue(csrfError);
        return Promise.reject(csrfError);
      } finally {
        isRefreshingCSRFToken = false;
      }
    }

    // JWT / Access Token Refresh Logic
    if (!originalRequest._jwtRetry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._jwtRetry = true;
      isRefreshing = true;

      try {
        await api.post("/auth/refresh/token");
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);