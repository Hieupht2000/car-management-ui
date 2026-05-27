import { get } from "http";
import { authService } from "./authService";

const API_URL = "https://localhost:7249/api/Garages";

export interface GarageDTO {
    garageId: number;
    name: string;
    address: string;
    phoneNumber: string;
    
}

export async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options);

  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const garagesService = {
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