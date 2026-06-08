/**
 * Customer Management Service
 * Handles CRUD operations for customer records
 */
import { authService } from "@/services/authService";

// Base URL for Customer API endpoints
const API_URL = "https://localhost:7249/api/Customer";

/**
 * Customer Data Transfer Object
 * Represents a customer/user account
 */
export interface Customer {
    customerId: number;         // Unique customer identifier
    fullName: string;           // Customer's full name
    email: string;              // Customer email address
    phoneNumber: string;        // Customer phone number
    createdAt: string;          // Account creation date
}

/**
 * Customer Service - Handles customer management operations
 */
export const customerService = {
    /**
     * Get all customers
     * @param token - JWT authentication token
     * @returns Array of customer records
     */
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

    /**
     * Add a new customer
     * @param customerData - Customer details (name, email, phone)
     * @param token - JWT authentication token
     * @returns Created customer record
     */
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

    /**
     * Update existing customer information
     * @param customerId - ID of customer to update
     * @param customerData - Updated customer details
     * @param token - JWT authentication token
     * @returns Updated customer record
     */
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

    /**
     * Delete a customer record
     * @param customerId - ID of customer to delete
     * @param token - JWT authentication token
     */
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
