/**
 * Time Slot Management Service
 * Handles availability scheduling and appointment time slot operations
 */
import { authService } from "./authService";

// Base URL for TimeSlot API endpoints
const API_URL = "https://localhost:7249/api/TimeSlot";

/**
 * Time Slot Data Transfer Object
 * Represents an available appointment time window
 */
export interface TimeSlot {
    timeSlot_Id: number;        // Unique time slot identifier
    startTime: string;          // Appointment start time (HH:mm format)
    endTime: string;            // Appointment end time (HH:mm format)
    isActive: boolean;          // Active status
}

/**
 * Time Slot Service - Handles appointment scheduling operations
 */
export const timeSlotService = {
    /**
     * Get all available time slots
     * @param token - JWT authentication token
     * @returns Array of available time slots
     */
    async getTimeSlots(token: string): Promise<TimeSlot[]> {
        const response = await fetch(`${API_URL}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch time slots");
        }

        return response.json();
    },

    /**
     * Create a new time slot
     * @param timeSlotData - Time slot details (start time, end time, availability)
     * @param token - JWT authentication token
     * @returns Created time slot record
     */
    async createTimeSlot(timeSlotData: Omit<TimeSlot, 'timeSlotId'>, token: string): Promise<TimeSlot> {
        const response = await fetch(`${API_URL}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(timeSlotData)
        });

        if (!response.ok) {
            // Parse error details from backend
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.message || "Failed to create time slot";
            throw new Error(errorMsg);
        }

        return response.json();
    },

    /**
     * Update existing time slot
     * @param id - Time slot ID to update
     * @param timeSlotData - Updated time slot details
     * @param token - JWT authentication token
     * @returns Updated time slot record
     */
    async updateTimeSlot(id: number, timeSlotData: Partial<TimeSlot>, token: string): Promise<TimeSlot> {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(timeSlotData)
        });

        if (!response.ok) {
            // Parse error details from backend
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.message || "Failed to update time slot";
            throw new Error(errorMsg);
        }

        return response.json();
    },

    /**
     * Delete a time slot
     * @param timeSlotId - ID of time slot to delete
     * @param token - JWT authentication token
     */
    async deleteTimeSlot(timeSlotId: number, token: string): Promise<void> {
        const response = await fetch(`${API_URL}/${timeSlotId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Failed to delete time slot");
        }
    }
};
