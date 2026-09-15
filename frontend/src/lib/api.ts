import axios from "axios";
import { getToken } from "@/lib/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (process.env.NODE_ENV === "development") {
      console.log("OMNIMIND API REQUEST");
      console.log(
        "URL:",
        `${API_BASE_URL}${config.url ?? ""}`,
      );
      console.log(
        "TOKEN EXISTS:",
        Boolean(token),
      );
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401
    ) {
      console.warn(
        "OmniMind API returned 401 Unauthorized.",
      );
    }

    return Promise.reject(error);
  },
);

export default api;

