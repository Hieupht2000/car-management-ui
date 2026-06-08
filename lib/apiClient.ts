/**
 * API Client Configuration
 * Centralized axios instance for all API requests with automatic token injection
 */
import axios from "axios";

/**
 * Axios instance with:
 * - Base URL from environment or fallback to localhost
 * - Default JSON content type
 * - Automatic Bearer token injection on all requests
 */
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://localhost:7249/api",
  headers: { "Content-Type": "application/json" },
});

/**
 * Request interceptor - automatically adds JWT token to Authorization header
 * Runs before every API request
 */
apiClient.interceptors.request.use(config => {
  // Get token from localStorage
  const token = localStorage.getItem("token");
  // Add Bearer token if it exists
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Response interceptor - debug response data
 */
apiClient.interceptors.response.use(
  response => {
    console.log("Interceptor response:", response.data); // Debug
    return response;
  },
  error => {
    console.error("Interceptor error:", error);
    return Promise.reject(error);
  }
);

export default apiClient;
