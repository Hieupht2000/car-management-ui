import { authService } from "./authService";

const API_URL = "https://localhost:7249/api/Technical";

export interface TechnicalDTO {
     technicianId: number;
  fullName: string;
  phoneNumber: string;
  email: string;
  status: string; // "Available", "Busy", "On Leave"
}
export const technicalService = {
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