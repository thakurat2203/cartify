import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

let refreshRequest = null;

export const SESSION_EXPIRED_EVENT = "cartify:session-expired";

const notifySessionExpired = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }
};

const shouldClearSession = (error) => {
  const status = error.response?.status;
  const code = error.response?.data?.error?.code;
  const url = error.config?.url || "";

  if (status !== 401) {
    return false;
  }

  const isCredentialRoute =
    url.includes("/api/auth/login") || url.includes("/api/auth/register");

  if (isCredentialRoute) {
    return false;
  }

  return (
    url.includes("/api/auth/refresh") ||
    code === "AUTH_TOKEN_MISSING" ||
    code === "AUTH_TOKEN_EXPIRED" ||
    code === "AUTH_TOKEN_INVALID"
  );
};

const shouldAttemptRefresh = (error) => {
  const status = error.response?.status;
  const code = error.response?.data?.error?.code;
  const url = error.config?.url || "";

  const skippedRoutes = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/refresh",
    "/api/auth/logout",
  ];

  const isSkippedRoute = skippedRoutes.some((route) => url.includes(route));

  const accessTokenCanBeRefreshed =
    code === "AUTH_TOKEN_MISSING" || code === "AUTH_TOKEN_EXPIRED";

  return status === 401 && accessTokenCanBeRefreshed && !isSkippedRoute;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      !originalRequest ||
      originalRequest._retry ||
      !shouldAttemptRefresh(error)
    ) {
      if (shouldClearSession(error)) {
        notifySessionExpired();
      }

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshRequest) {
        refreshRequest = api.post("/api/auth/refresh").finally(() => {
          refreshRequest = null;
        });
      }

      await refreshRequest;

      return api(originalRequest);
    } catch {
      return Promise.reject(error);
    }
  },
);

export default api;
