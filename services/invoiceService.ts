import { Download, Send } from "lucide-react";
import { authService } from "./authService";
const API_URL = "https://localhost:7249/api/Invoices";


interface InvoiceDetail {
    InvoiceDetailId :number
    InvoiceId : number
    ServiceId : number
    Quantity : number
    UnitPrice : number   // Computed property (chỉ đọc, không map DB nếu dùng EF Core < 7)
    
}

export interface InvoiceDTO {
    invoiceId: number;
    fullName: string;
    email: string;
    dateIssued: string;
    totalAmount: number;
    vat: number;
    invoiceDetails: InvoiceDetail[];
}

export const invoiceService = {
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
            throw new Error("Failed to create invoice");
        }
        return response.json();

    },

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