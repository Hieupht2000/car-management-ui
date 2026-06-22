/**
 * Authentication Service
 * Handles user login, token management, and logout operations
 */
import apiClient from "@/lib/apiClient";
import { register } from "module";

/**
 * Authentication service methods
 */
export const authService = {
  /**
   * Login user with email and password
   * @param email - User email address
   * @param password - User password
   * @returns Response containing auth token
   */
  login: async (email: string, password: string) => {
    try {
      // Send login credentials to backend
      const response = await apiClient.post("/Auth/login", {
        Email: email,
        Password: password,
      });
      
      // Try extracting token from different locations
      let token = null;
      
      // 1. Check response.data
      if (response.data?.token) {
        token = response.data.token;
      } else if (response.data?.accessToken) {
        token = response.data.accessToken;
      }
      
      // 2. Check response headers (backend might return token in header)
      if (!token && response.headers?.authorization) {
        token = response.headers.authorization.replace('Bearer ', '');
      }
      if (!token && response.headers?.['x-auth-token']) {
        token = response.headers['x-auth-token'];
      }
      if (!token && response.headers?.['x-access-token']) {
        token = response.headers['x-access-token'];
      }
      
      console.log("Extracted token:", token ? token.substring(0, 20) + "..." : "NOT FOUND");
      console.log("Response data:", response.data);
      console.log("Response headers:", response.headers);
      
      if (token) {
        // Save to localStorage for client-side use
        localStorage.setItem("token", token);
        
        // Also save to cookie so middleware can read it
        // Calculate expiration (7 days from now)
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7);
        
        document.cookie = `token=${token}; path=/; expires=${expirationDate.toUTCString()}`;
        
        console.log("Token saved to localStorage and cookie");
      } else {
        console.warn("No token found in response data or headers");
      }
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Retrieve stored JWT token
   * @returns Token string from localStorage or null
   */
  getToken: () => {
    return localStorage.getItem("token");
  },

  /**
   * Logout user by removing token
   */
  logout: () => {
    // Remove from localStorage
    localStorage.removeItem("token");
    
    // Remove from cookie
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    
    console.log("Token cleared from localStorage and cookie");
  },

  register: async (username: string, email: string, password: string, phoneNumber: string) => {
    try {
      const response = await apiClient.post("/Auth/register", {
        Username: username,
        Email: email,
        Password: password,
        PhoneNumber: phoneNumber,
        //Role: role,
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
};
