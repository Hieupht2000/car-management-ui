import { authService } from "@/services/authService";

const API_URL = "https://localhost:7249/api/Customer";

export interface Customer {
    customerId: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    createdAt: string;
}
export const customerService = {
    getCustomers: async (token : string) => {
        const res = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!res.ok) {
            throw new Error("Failed to load customers");
        }
        return res.json();
    },
    addCustomer: async (customerData: any, token: string) : Promise<Customer> => {
        const response = await fetch( API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(customerData),
        });
        if (!response.ok) {
            throw new Error("Failed to add customer");
        }
        return response.json();
    },
    updateCustomer: async (customerId: number, customerData: any, token: string) : Promise<Customer> => {
        const updatedCustomer = { ...customerData, customerId: customerId };
        const response = await fetch(API_URL +`/${customerId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(updatedCustomer),
        });
        if (!response.ok) {
            throw new Error("Failed to update customer");
        }
        return response.json();
    },
    deleteCustomer: async (customerId: number, token: string) : Promise<void> => {
        const response = await fetch(`${API_URL}/Customer/${customerId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error("Failed to delete customer");
        }
    },
};    


