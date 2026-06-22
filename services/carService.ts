/**
 * Car Management Service
 * Handles CRUD operations for vehicle records
 */
import { authService } from "@/services/authService";

// Base URL for Car Management API endpoints
const API_URL = "https://localhost:7249/api/CarMangetment";

/**
 * Car Data Transfer Object
 * Represents a vehicle record with owner and technical information
 */
export interface CarDTO {
    carId: number;              // Unique vehicle identifier
    customerId: number;         // Owner customer ID
    fullName: string;           // Owner's full name
    licensePlate: string;       // Vehicle license plate
    brand: string;              // Vehicle manufacturer (Toyota, Honda, etc.)
    model: string;              // Vehicle model name
    year: number;               // Manufacturing year
    odometer: number;           // Current mileage
}

/**
 * Car Service - Handles all vehicle management operations
 */
export const carService = {
    /**
     * Get all cars for authenticated user
     * @param token - JWT authentication token
     * @returns Array of car records
     */
    getCars: async (token : string) : Promise<CarDTO[]> => {
        const res = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!res.ok) {
            throw new Error("Failed to load cars");
        }
        return res.json();
    },

    getMyCars: async (token : string) : Promise<CarDTO[]> => {
        const res = await fetch(API_URL + "/mycar", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!res.ok) {
            throw new Error("Failed to load cars");
        }
        return res.json();
    },

    /**
     * Add a new car to user's garage
     * @param carData - Car details (brand, model, plate, year, etc.)
     * @param token - JWT authentication token
     * @returns Updated list of cars
     */
    addCar: async (carData: any, token: string) : Promise<CarDTO[]> => {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(carData),
        });
        if (!response.ok) {
            throw new Error("Failed to add car");
        }
        return response.json();
    },

    /**
     * Update existing car information
     * @param CarId - ID of car to update
     * @param carData - Updated car details
     * @param token - JWT authentication token
     * @returns Updated list of cars
     */
    updateCar: async (CarId: number, carData: any, token: string) :Promise<CarDTO[]> => {
        const response = await fetch(API_URL + `/${CarId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(carData),
        });
        if (!response.ok) {
            throw new Error("Failed to update car");
        }
        return response.json();
    }, 
    
    /**
     * Delete a car record
     * @param carId - ID of car to delete
     * @param token - JWT authentication token
     */
    deleteCar: async (carId: number, token: string) : Promise<void> => {
        const response = await fetch(API_URL + `/${carId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error("Failed to delete car");
        }
    },
};
