/**
 * Garage Management Service
 * Handles CRUD operations for garage/workshop records
 */
import { get } from "http";
import { authService } from "./authService";

// Base URL for Garages API endpoints
const API_URL = "https://localhost:7249/api/Garages";

/**
 * Garage Data Transfer Object
 * Represents a repair shop/garage facility
 */
export interface GarageDTO {
    garageId: number;           // Unique garage identifier
    name: string;               // Garage/workshop name
    address: string;            // Physical location address
    phoneNumber: string;        // Contact phone number
}

/**
 * Generic API fetch helper with error handling
 * @param url - Endpoint URL
 * @param options - Fetch options (method, headers, body, etc.)
 * @returns Parsed JSON response or null
 */
export async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options);

  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }

  // Handle empty responses
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/**
 * Garages Service - Handles garage management operations
 */
export const garagesService = {
    /**
     * Get all garages
     * @param token - JWT authentication token
     * @returns Array of garage records
     */
    getGarages: async (token : string) : Promise<GarageDTO[]> =>{
        const res = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        }); 
        if (!res.ok) {
            throw new Error("Failed to load garages");
        }
        return res.json();
    },
    
    /**
     * Create a new garage
     * @param garageData - Garage details (name, address, phone)
     * @param token - JWT authentication token
     * @returns Created garage record
     */
    createGarage: async (garageData: any, token: string) : Promise<GarageDTO> => {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${token}`, 
            },
            body: JSON.stringify(garageData),
        });
        if (!response.ok) {
            throw new Error("Failed to create garage");
        }
        return response.json();
    },
    
    /**
     * Update existing garage information
     * @param garageId - ID of garage to update
     * @param garageData - Updated garage details
     * @param token - JWT authentication token
     * @returns Updated garage record
     */
    updateGarage: async (garageId: number, garageData: any, token: string) : Promise<GarageDTO> => {
        const updatedGarage = { ...garageData, garageId: garageId };
        const response = await fetch(API_URL + `/${garageId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json", 
                //"Authorization": `Bearer ${token}`, 
            },
            body: JSON.stringify(updatedGarage),
        });
        if (!response.ok) {
            throw new Error("Failed to update garage");
        }
        return response.json();
    },

    /**
     * Delete a garage record
     * @param garageId - ID of garage to delete
     * @param token - JWT authentication token
     */
    deleteGarage: async (garageId: number, token: string) : Promise<void> => {
        const response = await fetch(`${API_URL}/${garageId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        }); 
        if (!response.ok) {
            throw new Error("Failed to delete garage");
        }
    },
};
