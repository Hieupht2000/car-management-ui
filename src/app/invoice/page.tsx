"use client";
import React from "react";
import { useState, useEffect } from "react";
import { InvoiceDTO, invoiceService } from "@/services/invoiceService";
import {
    FileText,
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Loader2,
    AlertCircle,
    DollarSign,
    Calendar,
    User,
    Mail,
    Download,
    Send,
    MessageSquare,
    Eye,
    CheckCircle
} from "lucide-react";

import { authService } from "@/services/authService";

export default function InvoicePage() {
    const [invoices, setInvoices] = useState<InvoiceDTO[]>([]);
    const [filteredInvoices, setFilteredInvoices] = useState<InvoiceDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
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

            // Mock data for demo
            //   const mockData: Invoice[] = [
            //     {
            //       invoiceId: 1,
            //       fullName: "Nguyễn Văn A",
            //       email: "nguyenvana@email.com",
            //       dateIssued: "2024-12-15T10:30:00",
            //       totalAmount: 2500000,
            //       vat: 250000,
            //       invoiceDetails: [
            //         { serviceName: "Thay dầu động cơ", unitPrice: 500000 },
            //         { serviceName: "Bảo dưỡng định kỳ", unitPrice: 2000000 }
            //       ]
            //     },
            //     {
            //       invoiceId: 2,
            //       fullName: "Trần Thị B",
            //       email: "tranthib@email.com",
            //       dateIssued: "2024-12-14T14:20:00",
            //       totalAmount: 1800000,
            //       vat: 180000,
            //       invoiceDetails: [
            //         { serviceName: "Thay phanh", unitPrice: 1200000 },
            //         { serviceName: "Kiểm tra tổng quát", unitPrice: 600000 }
            //       ]
            //     },
            //     {
            //       invoiceId: 3,
            //       fullName: "Lê Văn C",
            //       email: "levanc@email.com",
            //       dateIssued: "2024-12-13T09:15:00",
            //       totalAmount: 3200000,
            //       vat: 320000,
            //       invoiceDetails: [
            //         { serviceName: "Bảo dưỡng định kỳ", unitPrice: 1500000 },
            //         { serviceName: "Thay lốp xe", unitPrice: 1700000 }
            //       ]
            //     }
            //   ];

            //   setInvoices(mockData);    
            //   setFilteredInvoices(mockData);
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
            //inv.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            //inv.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.invoiceId.toString().includes(searchTerm)
        );
        setFilteredInvoices(filtered);
    };

    const handleCreateInvoice = async (invoiceData: any,invoiceDetail: any) => {
        // const newInvoice: InvoiceDTO = {
        //     invoiceId: Date.now(),
        //     fullName: invoiceData.fullName,
        //     email: invoiceData.email,
        //     dateIssued: new Date().toISOString(),
        //     totalAmount: invoiceData.totalAmount,
        //     vat: invoiceData.vat,
        //     invoiceDetails: invoiceData.invoiceDetails
        // };
        if(!token){
            alert("Token not found")
            return;
        }
        const newInvoices = await invoiceService.createInvoice(invoiceData,token!);

        setInvoices(prev => [newInvoices, ...prev]);
        setShowCreateModal(false);
        alert("✅ Create Invoice Complete!");
    };


    const handleDelete = async (invoiceId: number) => {
        if (!confirm("Are you sure you want to delete this invoice?")) return;
        if (!token) return;

        try {
            await invoiceService.deleteInvoice(invoiceId, token);
            setInvoices(prev => prev.filter(inv => inv.invoiceId !== invoiceId));
            setFilteredInvoices(prev => prev.filter(inv => inv.invoiceId !== invoiceId));
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Delete failed!");
        }
    };

    const handleDownloadPdf = async (invoiceId: number) => {
        if (!token) return;
        try {
            //For real API:
            const blob = await invoiceService.DownloadInvoicePDF(invoiceId, token);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Invoice_${invoiceId}.pdf`;
            a.click();
            alert(`Loading PDF for invoice #${invoiceId}...`);
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Download PDF failed!");
        }
    };

    const handleSendEmail = async (invoiceId: number) => {
        if (!token) return;
        if (!confirm("Send confirmation email to the customer?")) return;

        try {
            await invoiceService.SendInvoiceEmail(invoiceId, token);
            alert(`✅ Email sent for invoice #${invoiceId}`);
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Send email failed!");
        }
    };


    const handleSendTelegram = async (invoiceId: number) => {
        if (!token) return;
        if (!confirm("Send Telegram notification for this invoice?")) return;

        try {
            await invoiceService.SendTelegramNotification(invoiceId, token);
            alert(`✅ Telegram notification sent for invoice #${invoiceId}`);
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Send Telegram failed!");
        }
    };

    const stats = {
        total: invoices.length,
        totalRevenue: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
        totalVat: invoices.reduce((sum, inv) => sum + inv.vat, 0),
        avgAmount: invoices.length > 0 ? Math.round(invoices.reduce((sum, inv) => sum + inv.totalAmount, 0) / invoices.length / 1000) : 0
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

    if (!token) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Not logged in</h2>
                    <p className="text-gray-600 mb-6">Please log in to access this page</p>
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
                                Invoice Management
                            </h1>
                            <p className="text-gray-500 mt-1">Invoice and Payment Management</p>
                        </div>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800 font-medium flex-1">{error}</p>
                        <button onClick={() => setError(null)}><X className="w-5 h-5" /></button>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Invoice Total</p>
                                <p className="text-3xl font-bold mt-2">{stats.total}</p>
                            </div>
                            <div className="p-4 bg-white/20 rounded-xl">
                                <FileText className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Total Revenue</p>
                                <p className="text-2xl font-bold mt-2">{(stats.totalRevenue / 1000000).toFixed(1)}M</p>
                            </div>
                            <div className="p-4 bg-white/20 rounded-xl">
                                <DollarSign className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm font-medium">Total VAT</p>
                                <p className="text-2xl font-bold mt-2">{(stats.totalVat / 1000000).toFixed(1)}M</p>
                            </div>
                            <div className="p-4 bg-white/20 rounded-xl">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium">Average</p>
                                <p className="text-2xl font-bold mt-2">{stats.avgAmount}K</p>
                            </div>
                            <div className="p-4 bg-white/20 rounded-xl">
                                <Calendar className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative flex-1 w-full md:max-w-md">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by ID, name, email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            />

                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:scale-105 transition-all font-semibold"
                        >
                            <Plus className="w-5 h-5" />Add Invoice
                        </button>
                    </div>
                </div>


                {/* Invoice Table */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">ID</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Customer</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Date Created</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Total Amount</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">VAT</th>
                                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredInvoices.map((invoice) => (
                                    <tr key={invoice.invoiceId} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-blue-600">#{invoice.invoiceId}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">{invoice.fullName}</p>
                                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {invoice.email}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">
                                            {new Date(invoice.dateIssued).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-green-600">
                                                {(invoice.totalAmount / 1000).toFixed(0)}K
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-orange-600">
                                                {(invoice.vat / 1000).toFixed(0)}K
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2 flex-wrap">
                                                <button
                                                    onClick={() => {
                                                        setSelectedInvoice(invoice);
                                                        setShowDetailModal(true);
                                                    }}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadPdf(invoice.invoiceId)}
                                                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                    title="Download PDF"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleSendEmail(invoice.invoiceId)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Send Email"
                                                >
                                                    <Send className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => handleSendTelegram(invoice.invoiceId)}
                                                    className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                                                    title="Send Telegram"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(invoice.invoiceId)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredInvoices.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p className="text-lg font-medium">Can't find any invoices</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>


            {/* Detail Modal */}

            {showCreateModal && (
                <CreateModal close={() => setShowCreateModal(false)} submit={handleCreateInvoice} />

            )}
            {showDetailModal && selectedInvoice && (
                <InvoiceDetailModal
                    invoice={selectedInvoice}
                    close={() => {
                        setShowDetailModal(false);
                        setSelectedInvoice(null);
                    }}
                    onDownloadPdf={handleDownloadPdf}
                    onSendEmail={handleSendEmail}
                    onSendTelegram={handleSendTelegram}
                />
            )}
        </div>
    );
}

function DetailModal({ invoice, close }: any) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-t-3xl">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">Invoice #{invoice.invoiceId}</h2>
                        <button onClick={close} className="p-2 hover:bg-white/20 rounded-lg"><X className="w-6 h-6 text-white" /></button>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div className="bg-blue-50 rounded-xl p-4">
                        <h3 className="font-bold mb-2">Customer</h3>
                        <p className="font-semibold">{invoice.fullName}</p>
                        <p className="text-sm text-gray-600">{invoice.email}</p>
                    </div>
                    <div>
                        <h3 className="font-bold mb-2">Service</h3>
                        {invoice.invoiceDetails.map((d: any, i: number) => (
                            <div key={i} className="flex justify-between p-3 bg-gray-50 rounded-lg mb-2">
                                <span>{d.serviceName}</span><span className="font-semibold">{(d.unitPrice / 1000).toFixed(0)}K</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t pt-4">
                        <div className="flex justify-between mb-2"><span>VAT:</span><span className="font-semibold">{(invoice.vat / 1000).toFixed(0)}K</span></div>
                        <div className="flex justify-between text-lg font-bold bg-green-50 p-4 rounded-lg"><span>Tổng:</span><span className="text-green-600">{(invoice.totalAmount / 1000).toFixed(0)}K</span></div>
                    </div>
                </div>
                <div className="px-6 pb-6">
                    <button onClick={close} className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold">Đóng</button>
                </div>
            </div>
        </div>
    );
}

function CreateModal({ close, submit }: any) {
    const [form, setForm] = useState({ fullName: "", email: "", services: [{ serviceName: "", unitPrice: 0 }] });
    const [submitting, setSubmitting] = useState(false);

    const addService = () => setForm({ ...form, services: [...form.services, { serviceName: "", unitPrice: 0 }] });
    const removeService = (i: number) => setForm({ ...form, services: form.services.filter((_, idx) => idx !== i) });
    const updateService = (i: number, field: string, value: any) => {
        const newServices = [...form.services];
        newServices[i] = { ...newServices[i], [field]: value };
        setForm({ ...form, services: newServices });
    };

    const subtotal = form.services.reduce((sum, s) => sum + Number(s.unitPrice), 0);
    const vat = subtotal * 0.1;
    const total = subtotal + vat;

    const handleSubmit = async () => {
        if (!form.fullName || !form.email) { alert("Please fill in completely!"); return; }
        if (form.services.some(s => !s.serviceName || s.unitPrice <= 0)) { alert("Invalid service!"); return; }
        setSubmitting(true);
        try {
            await submit({ fullName: form.fullName, email: form.email, totalAmount: total, vat, invoiceDetails: form.services });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-t-3xl">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">Create Invoices</h2>
                        <button onClick={close}><X className="w-6 h-6 text-white" /></button>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid text-gray-700 gap-4">
                        <div><label className="block text-sm font-semibold mb-2">FullName *</label><input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full px-4 py-3 border-2 rounded-xl focus:border-blue-500 outline-none" /></div>
                        <div><label className="block text-sm font-semibold mb-2">Email *</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 border-2 rounded-xl focus:border-blue-500 outline-none" /></div>
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <h3 className="font-bold text-gray-700">Service</h3>
                            <button onClick={addService} className="flex items-center gap-2 px-4 py-2 text-gray-700 text-blue-600 rounded-lg"><Plus className="w-4 h-4" />Add</button>
                        </div>
                        {form.services.map((s, i) => (
                            <div key={i} className="flex gap-3 mb-3 text-gray-700 p-3 rounded-xl">
                                <div className="flex-1 text-gray-700">
                                    <input type="text" value={s.serviceName} onChange={(e) => updateService(i, 'serviceName', e.target.value)} placeholder="Name Service" className="w-full px-4 py-2 border-2 rounded-lg outline-none" />
                                    <input type="number" value={s.unitPrice} onChange={(e) => updateService(i, 'unitPrice', Number(e.target.value))} placeholder="Price" className="w-full px-4 py-2 border-2 rounded-lg outline-none" />
                                </div>
                                {form.services.length > 1 && <button onClick={() => removeService(i)} className="p-2 text-red-600"><X className="w-5 h-5" /></button>}
                            </div>
                        ))}
                    </div>
                    <div className="text-gray-700 pt-4 space-y-2">
                        <div className="flex justify-between"><span>ToTal Service:</span><span className="font-semibold">{(subtotal / 1000).toFixed(0)}K</span></div>
                        <div className="flex justify-between"><span>VAT (10%):</span><span className="font-semibold">{(vat / 1000).toFixed(0)}K</span></div>
                        <div className="flex justify-between text-lg font-bold bg-green-50 p-4 rounded-lg"><span>Total:</span><span className="text-green-600">{(total / 1000).toFixed(0)}K</span></div>
                    </div>
                </div>
                <div className="px-6 pb-6 flex gap-3">
                    <button onClick={close} className="flex-1 px-6 py-3 text-gray-700 rounded-xl font-semibold">Cancel</button>
                    <button onClick={handleSubmit} disabled={submitting} className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2">
                        {submitting ? <><Loader2 className="w-5 h-5 animate-spin" />Saving Invoice...</> : "Create Invoice"}
                    </button>
                </div>
            </div>
        </div>
    );
}
function InvoiceDetailModal({ invoice, close, onDownloadPdf, onSendEmail, onSendTelegram }: any) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-t-3xl sticky top-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Invoice #{invoice.invoiceId}</h2>
                                <p className="text-blue-100 text-sm">{new Date(invoice.dateIssued).toLocaleString('vi-VN')}</p>
                            </div>
                        </div>
                        <button onClick={close} className="p-2 hover:bg-white/20 rounded-lg">
                            <X className="w-6 h-6 text-white" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Customer Info */}
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-600" />
                            Information Customers
                        </h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-700">FullName:</span>
                                <span className="font-semibold text-gray-900">{invoice.fullName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700">{invoice.email}</span>
                            </div>
                        </div>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-3">Services Used</h3>
                        <div className="space-y-2">
                            {invoice.invoiceDetails.map((detail: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-900">{detail.serviceName}</span>
                                    <span className="font-semibold text-gray-900">
                                        {(detail.unitPrice / 1000).toFixed(0)}K
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="border-t border-gray-200 pt-4 space-y-3">
                        <div className="flex items-center justify-between text-gray-700">
                            <span>VAT (10%)</span>
                            <span className="font-semibold">{(invoice.vat / 1000).toFixed(0)}K VNĐ</span>
                        </div>
                        <div className="flex items-center justify-between text-lg font-bold text-gray-900 bg-green-50 p-4 rounded-lg">
                            <span>Total</span>
                            <span className="text-green-600">{(invoice.totalAmount / 1000).toFixed(0)}K VNĐ</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => { onDownloadPdf(invoice.invoiceId); close(); }}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors font-medium"
                        >
                            <Download className="w-4 h-4" />
                            PDF
                        </button>
                        <button
                            onClick={() => { onSendEmail(invoice.invoiceId); close(); }}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors font-medium"
                        >
                            <Send className="w-4 h-4" />
                            Email
                        </button>
                        <button
                            onClick={() => { onSendTelegram(invoice.invoiceId); close(); }}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-cyan-50 text-cyan-600 rounded-xl hover:bg-cyan-100 transition-colors font-medium"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Telegram
                        </button>
                    </div>
                </div>

                <div className="px-6 pb-6">
                    <button
                        onClick={close}
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}