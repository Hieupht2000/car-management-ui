/**
 * Technician Management Service
 * Handles CRUD operations for technician/mechanic staff records
 */
import { authService } from "./authService";

// Base URL for Technician API endpoints
const API_URL = "https://localhost:7249/api/Technical";

/**
 * Technician Data Transfer Object
 * Represents a mechanic or service technician
 */
export interface TechnicalDTO {
      technicianId: number;      // Unique technician identifier
      fullName: string;          // Technician's full name
      phoneNumber: string;       // Contact phone number
      email: string;             // Work email address
      status: string;            // Current status: "Available", "Busy", "On Leave"
}

/**
 * Technician Service - Handles technician management operations
 */
export const technicalService = {
    /**
     * Get all technicians
     * @param token - JWT authentication token
     * @returns Array of technician records
     */
    getTechnicians: async (token : string) : Promise<TechnicalDTO[]> =>{
        const res = await fetch(API_URL, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!res.ok) {
            throw new Error("Failed to fetch technicians");
        }
        return res.json();
    },

    /**
     * Add a new technician
     * @param technicianData - Technician details (name, phone, email, status)
     * @param token - JWT authentication token
     * @returns Created technician record
     */
    addTechnician: async (technicianData: any, token: string) : Promise<TechnicalDTO> => {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(technicianData),
        });
        if (!response.ok) {
            throw new Error("Failed to add technician");
        }   
        return response.json();
    },

    /**
     * Update existing technician information
     * @param technicianId - ID of technician to update
     * @param technicianData - Updated technician details
     * @param token - JWT authentication token
     * @returns Updated technician record
     */
    updateTechnician: async (technicianId: number, technicianData: any, token: string) : Promise<TechnicalDTO> => {
        const updatedTechnician = { ...technicianData, technicianId: technicianId };
        const response = await fetch(API_URL + `/${technicianId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(updatedTechnician),
        });
        if (!response.ok) {
            throw new Error("Failed to update technician");
        }
        return response.json();
    },

    /**
     * Delete a technician record
     * @param technicianId - ID of technician to delete
     * @param token - JWT authentication token
     */
    deleteTechnician: async (technicianId: number, token: string) : Promise<void> => {
        const response = await fetch(`${API_URL}/${technicianId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error("Failed to delete technician");
        }
    }
};
