import { authService } from "@/services/authService";

const API_URL = "https://localhost:7249/api/CarMangetment";

export interface CarDTO {
    carId: number;
    customerId: number;
    fullName: string;
    licensePlate: string;
    brand: string;
    model: string;
    year: number;
    odometer: number;
}


export const carService = {
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
