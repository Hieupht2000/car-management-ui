import { Timestamp } from "next/dist/server/lib/cache-handlers/types";
import { authService } from "./authService";

const API_URL = "https://localhost:7249/api/Service";

export interface ServiceDTO {
    serviceId: number;
    name: string;
    description: string;
    price: number;
    estimatedDuration: string;
}

export const servicesService = {
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
    updateService: async (id: number, serviceData: any, token: string): Promise<ServiceDTO> => {
        const updatedService = { ...serviceData, serviceId: id };
        const response = await fetch(API_URL + `/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(updatedService),
        });
        if (!response.ok) {
            throw new Error("Failed to update service");
        }
        return response.json();
    },

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