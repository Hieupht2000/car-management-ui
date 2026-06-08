/**
 * Service Management Service
 * Handles CRUD operations for available maintenance and repair services
 */
import { Timestamp } from "next/dist/server/lib/cache-handlers/types";
import { authService } from "./authService";

// Base URL for Service API endpoints
const API_URL = "https://localhost:7249/api/Service";

/**
 * Service Data Transfer Object
 * Represents an available maintenance or repair service
 */
export interface ServiceDTO {
    serviceId: number;          // Unique service identifier
    name: string;               // Service name (Oil Change, Brake Service, etc.)
    description: string;        // Detailed service description
    price: number;              // Service cost in VND
    estimatedDuration: string;  // Estimated time to complete service
}

/**
 * Service Management Service - Handles all service operations
 */
export const servicesService = {
    /**
     * Get all available services
     * @param token - JWT authentication token
     * @returns Array of service records
     */
    getServices: async (token: string): Promise<ServiceDTO[]> => {
        const res = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!res.ok) {
            throw new Error("Failed to load services");
        }
        return res.json();
    },

    /**
     * Create a new service offering
     * @param serviceData - Service details (name, description, price, duration)
     * @param token - JWT authentication token
     * @returns Created service record
     */
    createService: async (serviceData: any, token: string): Promise<ServiceDTO> => {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(serviceData),
        });
        if (!response.ok) {
            throw new Error("Failed to create service");
        }
        return response.json();
    },

    /**
     * Update existing service information
     * @param id - Service ID to update
     * @param serviceData - Updated service details
     * @param token - JWT authentication token
     * @returns Updated service record
     */
    updateService: async (id: number, serviceData: any, token: string): Promise<ServiceDTO> => {
        const response = await fetch(API_URL + `/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(serviceData),
        });
        if (!response.ok) {
            throw new Error("Failed to update service");
        }
        return response.json();
    },

    /**
     * Delete a service
     * @param serviceId - ID of service to delete
     * @param token - JWT authentication token
     */
    deleteService: async (serviceId: number, token: string): Promise<void> => {
        const response = await fetch(`${API_URL}/${serviceId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error("Failed to delete service");
        }
    },
};
