/**
 * User Service
 * Handles all user-related API calls
 */

const API_BASE_URL = "https://localhost:7249/api";

export interface UserDTO {
  userId: string;
  email: string;
  fullName: string;
  //phoneNumber: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
}

export interface CreateUserRequest {
  email: string;
  fullName: string;
  //phoneNumber: string;
  password: string;
  role: string;
}

export interface UpdateUserRequest {
  email: string;
  fullName: string;
  //phoneNumber: string;
  role: string;
}

class UserService {
  /**
    * Transform API response to UserDTO
    */
  private transformUserResponse(data: any): UserDTO {
    return {
      userId: data.user_id || data.userId,
      email: data.email,
      fullName: data.user_name || data.fullName,
      //phoneNumber: data.phone_number || data.phoneNumber,
      role: data.role,
      createdAt: data.created_at || data.createdAt,
      lastLogin: data.last_login || data.lastLogin,
    };
  }

  /**
    * Get all users
    */
  async getUsers(token: string): Promise<UserDTO[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/Users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data.map(user => this.transformUserResponse(user)) : [];
    } catch (error) {
      console.error("Error in getUsers:", error);
      throw error;
    }
  }

  /**
    * Get user by ID
    */
  async getUserById(userId: string, token: string): Promise<UserDTO> {
    try {
      const response = await fetch(`${API_BASE_URL}/Users/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.status}`);
      }

      const data = await response.json();
      return this.transformUserResponse(data);
    } catch (error) {
      console.error("Error in getUserById:", error);
      throw error;
    }
  }

  /**
    * Create new user
    */
  async createUser(userData: CreateUserRequest, token: string): Promise<UserDTO> {
    try {
      // Transform field names to match API expectations
      const apiPayload = {
        user_name: userData.fullName,
        email: userData.email,
        //phone_number: userData.phoneNumber,
        Password_hash: userData.password,
        role: userData.role,
      };

      const response = await fetch(`${API_BASE_URL}/Users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create user: ${error || response.status}`);
      }

      const data = await response.json();
      return this.transformUserResponse(data);
    } catch (error) {
      console.error("Error in createUser:", error);
      throw error;
    }
  }

  /**
    * Update user
    */
  async updateUser(userId: string, userData: UpdateUserRequest, token: string): Promise<UserDTO> {
    try {
      // Transform field names to match API expectations
      const apiPayload = {
        user_name: userData.fullName,
        email: userData.email,
        //phone_number: userData.phoneNumber,
        role: userData.role,
      };

      const response = await fetch(`${API_BASE_URL}/Users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to update user: ${error || response.status}`);
      }

      const data = await response.json();
      return this.transformUserResponse(data);
    } catch (error) {
      console.error("Error in updateUser:", error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string, token: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/Users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.status}`);
      }
    } catch (error) {
      console.error("Error in deleteUser:", error);
      throw error;
    }
  }

  /**
    * Change user role
    */
  async changeUserRole(userId: string, role: string, token: string): Promise<UserDTO> {
    try {
      const response = await fetch(`${API_BASE_URL}/Users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        throw new Error(`Failed to change user role: ${response.status}`);
      }

      const data = await response.json();
      return this.transformUserResponse(data);
    } catch (error) {
      console.error("Error in changeUserRole:", error);
      throw error;
    }
  }

  /**
    * Get users by role
    */
  async getUsersByRole(role: string, token: string): Promise<UserDTO[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/Users/role/${role}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users by role: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data.map(user => this.transformUserResponse(user)) : [];
    } catch (error) {
      console.error("Error in getUsersByRole:", error);
      throw error;
    }
  }
}

export const userService = new UserService();
