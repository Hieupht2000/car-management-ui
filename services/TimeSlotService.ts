import { authService } from "./authService";

const API_URL = "https://localhost:7249/api/TimeSlot";

export interface TimeSlot {
    timeSlot_Id: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
}

export const timeSlotService = {
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
            throw new Error("Failed to create time slot");
        }

        return response.json();
    },

    async updateTimeSlot(timeSlotId: number, timeSlotData: Partial<TimeSlot>, token: string): Promise<void> {
        const response = await fetch(`${API_URL}/${timeSlotId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(timeSlotData)
        });

        if (!response.ok) {
            throw new Error("Failed to update time slot");
        }
    },

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