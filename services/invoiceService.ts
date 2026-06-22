/**
 * Invoice Management Service
 * Handles invoicing, payment tracking, and document generation
 */
import { Download, Send } from "lucide-react";
import { authService } from "./authService";

// Base URL for Invoice API endpoints
const API_URL = "https://localhost:7249/api/Invoices";
const Api_url = "https://localhost:7249/api/CustomerInvoice";

/**
 * Invoice Line Item Detail
 * Represents individual service charges on an invoice
 */
interface InvoiceDetail {
    InvoiceDetailId: number;    // Unique detail line ID
    InvoiceId: number;          // Parent invoice ID
    ServiceId: number;          // Service performed
    Quantity: number;           // Quantity of service
    UnitPrice: number;          // Price per unit (read-only computed property)
}

/**
 * Invoice Data Transfer Object
 * Represents a complete invoice with payment details and line items
 */
export interface InvoiceDTO {
    invoiceId: number;          // Unique invoice identifier
    fullName: string;           // Customer name
    email: string;              // Customer email
    BookingId: number;          // Associated booking
    bookingId?: number;         // Alternate booking ID field
    dateIssued: string;         // Invoice creation date
    totalAmount: number;        // Total before VAT
    vat: number;                // Value-added tax amount
    paymentStatus?: string;     // Payment status (Pending, Paid, etc.)
    invoiceDetails: InvoiceDetail[]; // Array of service line items
}

/**
 * Invoice Service - Handles all invoicing operations
 */
export const invoiceService = {
    /**
     * Get all invoices for authenticated user
     * @param token - JWT authentication token
     * @returns Array of invoice records
     */
    getInvoices: async (token: string): Promise<InvoiceDTO[]> => {
        const res = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!res.ok) {
            throw new Error("Failed to load invoices");
        }
        return res.json();
    },

    getMyInvoices: async (token: string): Promise<InvoiceDTO[]> => {
        const res = await fetch(Api_url + "/my-invoices", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!res.ok) {
            throw new Error("Failed to load invoices");
        }
        return res.json();
    },
    /**
     * Create a new invoice
     * @param invoiceData - Invoice details (booking, amount, services, etc.)
     * @param token - JWT authentication token
     * @returns Created invoice record
     */
    createInvoice: async (invoiceData: any, token: string): Promise<InvoiceDTO> => {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(invoiceData),
        });
        if (!response.ok) {
            // Parse error details from backend validation
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.errors 
                ? Object.values(errorData.errors).flat().join(", ") 
                : errorData.message || "Failed to create invoice";
            throw new Error(errorMsg);
        }
        return response.json();
    },

    /**
     * Update existing invoice
     * @param invoiceId - ID of invoice to update
     * @param invoiceData - Updated invoice details
     * @param token - JWT authentication token
     * @returns Updated invoice record
     */
    updateInvoice: async (invoiceId: number, invoiceData: any, token: string): Promise<InvoiceDTO> => {
        const updatedInvoice = { ...invoiceData, invoiceId: invoiceId };
        const response = await fetch(`${API_URL}/invoices`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(updatedInvoice),
        });
        if (!response.ok) {
            throw new Error("Failed to update invoice");
        }
        return response.json();
    },

    /**
     * Delete an invoice record
     * @param id - Invoice ID to delete
     * @param token - JWT authentication token
     */
    deleteInvoice: async (id : number, token: string): Promise<void> => {
        const response = await fetch(`${API_URL}/invoices/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error("Failed to delete invoice");
        }
    },

    /**
     * Send invoice email to customer
     * @param invoiceId - Invoice ID to send
     * @param token - JWT authentication token
     */
    SendInvoiceEmail: async (invoiceId: number, token: string): Promise<void> => {
        const response = await fetch(`${API_URL}/SendEmailComfrimed?InvoiceId=${invoiceId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error("Failed to send invoice email");
        }
    },

    /**
     * Download invoice as PDF file
     * @param id - Invoice ID to download
     * @param token - JWT authentication token
     * @returns PDF blob file
     */
    DownloadInvoicePDF: async (id: number, token: string): Promise<Blob> => {
        const response = await fetch(`${API_URL}/${id}/pdf`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error("Failed to download invoice PDF");
        }
        return response.blob();
    },

    /**
     * Send Telegram notification about invoice
     * @param invoiceId - Invoice ID
     * @param token - JWT authentication token
     */
    SendTelegramNotification: async (invoiceId: number, token: string): Promise<void> => {
        const response = await fetch(`${API_URL}/SendTelegram/invoiceId?InvoiceId=${invoiceId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error("Failed to send Telegram notification");
        }
    },
};
