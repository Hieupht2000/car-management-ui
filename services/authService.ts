// services/authService.ts
import apiClient from "@/lib/apiClient";

export const authService = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post("/UserLogin/login", {
      Email: email,
      Password: password,
    });
    const data = await response.data;
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    return response.data; // { token: "..." }
  },

   getToken: () => {
    return localStorage.getItem("token");
  },

  logout: () => {
    localStorage.removeItem("token");
  },
  
  
};
