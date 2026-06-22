import { get } from "http";
import { authService } from "./authService";

const API_URL = "https://localhost:7249/api/Booking";

export interface BookingDTO {
    bookingId: number;
    customerId: number;
    email: string;
    fullName: string;
    carId: number;
    licensePlate: string;
    technicianId: number;
    technicianName: string;
    garageId: number;
    bookingDate: string;
    timeSlot_Id: number;
    status: string;
    note: string;
    emailBody: string;
    dealerEmail: string;
    serviceName: string;

}

export const bookingService = {
    async getBookings(token: string) {
        const res = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!res.ok) {
            throw new Error("Failed to load bookings");
        }
        return res.json();
    },

    async getMyBookings(token: string) {
        const res = await fetch(API_URL + "/my-bookings", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!res.ok) {
            throw new Error("Failed to load bookings");
        }
        return res.json();
    },

    async createBooking(bookingData: any, token: string): Promise<BookingDTO> {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(bookingData),
        });
        if (!response.ok) {
            throw new Error("Failed to create booking");
        }
        return response.json();
    },



    async updateBookingStatus(id: number, newStatus: string, token: string, operatorTechnicianId: number): Promise<BookingDTO> {
        const response = await fetch(`${API_URL}/${id}/status`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(API_URL),
        });
        if (!response.ok) {
            throw new Error("Failed to update booking status");
        }
        return response.json();
    },

    async deleteBooking(bookingId: number, token: string): Promise<void> {
        const response = await fetch(API_URL + `/${bookingId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error("Failed to delete booking");
        }
        return response.json();
    },

    async sendEmaiConfrimed(bookingId: number, token: string): Promise<void> {
        const response = await fetch(`${API_URL}/sendemailComfrimed?bookingId=${bookingId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error("Failed send email");
        }
        return response.json();
    },

    async sendEmailDealer(
        bookingId: number,
        dealerEmail: string,
        message: string,
        token: string
    ) {
        return fetch(
            `${API_URL}/sendemailDealer/${bookingId}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    emailDealer: dealerEmail,
                    message: message,
                }),
            }
        ).then(res => {
            if (!res.ok) throw new Error("Send email dealer failed");
            return res.json();
        });
    },

    async sendEmailReminder(
        bookingId: number,
        message: string,
        token: string
    ) {
        return fetch(
            `${API_URL}/sendemailReminder/${bookingId}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: message,
                }),
            }
        ).then(res => {
            if (!res.ok) throw new Error("Send reminder email failed");
            return res.json();
        });
    },

    async assignTechnician(bookingId: number, technicianId: number, token: string): Promise<any> {
        const response = await fetch(`${API_URL}/${bookingId}/assign-technician/${technicianId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error("Failed to assign technician");
        }
        return response.json();
    },

    async getAvailableSlots(date: string, garageId: number, token: string): Promise<any> {
        const response = await fetch(`${API_URL}/available-slots?date=${date}&garageId=${garageId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error("Failed to fetch available slots");
        }
        return response.json();
    }

};
