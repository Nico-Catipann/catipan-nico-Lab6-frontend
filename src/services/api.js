import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3000";

const api = axios.create({
  baseURL: API_URL,
});

const refreshApi = axios.create({
  baseURL: API_URL,
});

// ======================================
// ADD ACCESS TOKEN
// ======================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => Promise.reject(error),
);

// ======================================
// AUTOMATIC TOKEN REFRESH
// ======================================

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (originalRequest?.url === "/api/login") {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        return Promise.reject(error);
      }

      try {
        const response = await refreshApi.post("/api/refresh", {
          refresh_token: refreshToken,
        });

        const tokens = response.data.tokens;

        localStorage.setItem("access_token", tokens.access_token);

        localStorage.setItem("refresh_token", tokens.refresh_token);

        originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("access_token");

        localStorage.removeItem("refresh_token");

        localStorage.removeItem("username");

        localStorage.removeItem("role");

        window.location.reload();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
