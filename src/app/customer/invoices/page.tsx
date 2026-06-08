/**
 * Customer Invoices Page
 * Allows customers to view their own invoices
 */
"use client";

import { useState, useEffect } from "react";
import {
    FileText,
    Search,
    X,
    Loader2,
    AlertCircle,
    DollarSign,
    Download,
    Mail
} from "lucide-react";
import { InvoiceDTO, invoiceService } from "@/services/invoiceService";

export default function CustomerInvoicePage() {
    const [invoices, setInvoices] = useState<InvoiceDTO[]>([]);
    const [filteredInvoices, setFilteredInvoices] = useState<InvoiceDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDTO | null>(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
        if (!token) {
            setError("Please log in to access invoices");
            setLoading(false);
            return;
        }
        loadInvoices();
    }, [token]);

    useEffect(() => {
        filterInvoices();
    }, [invoices, searchTerm]);

    const loadInvoices = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await invoiceService.getInvoices(token!);
            setInvoices(data);
            setFilteredInvoices(data);
        } catch (error: any) {
            console.error("Error loading invoices:", error);
            setError(error.message || "Cannot load invoice data");
        } finally {
            setLoading(false);
        }
    };

    const filterInvoices = () => {
        if (!searchTerm) {
            setFilteredInvoices(invoices);
            return;
        }
        const filtered = invoices.filter(inv =>
            inv.invoiceId.toString().includes(searchTerm)
        );
        setFilteredInvoices(filtered);
    };

    const handleDownloadPdf = async (invoiceId: number) => {
        if (!token) return;
        try {
            const blob = await invoiceService.DownloadInvoicePDF(invoiceId, token);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Invoice_${invoiceId}.pdf`;
            a.click();
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Download PDF failed!");
        }
    };

    const stats = {
        total: invoices.length,
        totalAmount: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading invoices...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                            <FileText className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                My Invoices
                            </h1>
                            <p className="text-gray-500 mt-1">View and manage your invoices and payments</p>
                        </div>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800 font-medium flex-1">{error}</p>
                        <button onClick={() => setError(null)} className="text-red-600 hover:text-red-700">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Search Bar */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by invoice ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Total Invoices</p>
                                <p className="text-3xl font-bold mt-2">{stats.total}</p>
                            </div>
                            <FileText className="w-8 h-8 opacity-40" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Total Amount Spent</p>
                                <p className="text-3xl font-bold mt-2">${(stats.totalAmount / 1000000).toFixed(2)}M</p>
                            </div>
                            <DollarSign className="w-8 h-8 opacity-40" />
                        </div>
                    </div>
                </div>

                {/* Invoices List */}
                <div className="space-y-4">
                    {filteredInvoices.length > 0 ? (
                        filteredInvoices.map((invoice) => (
                            <div key={invoice.invoiceId} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Invoice #{invoice.invoiceId}</h3>
                                        <p className="text-sm text-gray-600">{new Date(invoice.dateIssued).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Amount</p>
                                        <p className="text-2xl font-bold text-green-600">${(invoice.totalAmount / 1000).toFixed(0)}K</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-4">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <p className="text-sm text-gray-600">{invoice.email}</p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setSelectedInvoice(invoice);
                                            setShowDetailModal(true);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => handleDownloadPdf(invoice.invoiceId)}
                                        className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors font-medium"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download PDF
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                            <FileText className="w-16 h-16 mx-auto mb-4 opacity-20 text-gray-400" />
                            <p className="text-lg font-medium text-gray-500">No invoices yet</p>
                            <p className="text-sm text-gray-400 mt-2">Your invoices will appear here after you complete services</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedInvoice && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 sticky top-0">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-white">Invoice #{selectedInvoice.invoiceId}</h2>
                                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-white/20 rounded-lg">
                                    <X className="w-6 h-6 text-white" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <p className="text-sm text-gray-600">Date Issued</p>
                                <p className="text-lg font-semibold text-gray-900">{new Date(selectedInvoice.dateIssued).toLocaleDateString('vi-VN')}</p>
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-900 mb-3">Services</h3>
                                <div className="space-y-2">
                                    {selectedInvoice.invoiceDetails.map((detail: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-900">{detail.serviceName}</span>
                                            <span className="font-semibold text-gray-900">${(detail.unitPrice / 1000).toFixed(0)}K</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4 space-y-3">
                                <div className="flex items-center justify-between text-gray-700">
                                    <span>VAT (10%)</span>
                                    <span className="font-semibold">${(selectedInvoice.vat / 1000).toFixed(0)}K</span>
                                </div>
                                <div className="flex items-center justify-between text-lg font-bold text-gray-900 bg-green-50 p-4 rounded-lg">
                                    <span>Total Amount</span>
                                    <span className="text-green-600">${(selectedInvoice.totalAmount / 1000).toFixed(0)}K</span>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 pb-6 flex gap-3">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    handleDownloadPdf(selectedInvoice!.invoiceId);
                                    setShowDetailModal(false);
                                }}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const Eye = ({ className }: { className: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);
