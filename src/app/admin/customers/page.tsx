/**
 * Admin Customers Management Page
 * Admin-only view for managing all customer records
 */
"use client";

import { useEffect, useState } from "react";
import { Customer, customerService } from "@/services/customerService";
import { Users, User, Plus, Search, Edit2, Trash2, X, Loader2, AlertCircle, Mail, Phone, Calendar } from "lucide-react";
import { useTranslation } from "@/src/hooks/useTranslation";

export default function AdminCustomerPage() {
    const { t } = useTranslation('customers');
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [customerEdited, setCustomerEdited] = useState<Customer | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        createdAt: "",
    });

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const token = localStorage.getItem("token") || "";
                const data = await customerService.getCustomers(token);
                setCustomers(data);
            } catch (error) {
                console.error("Error fetching customers:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    const filterCustomers = () => {
        if (searchTerm.trim() === "") {
            setFilteredCustomers(customers);
            return;
        }
        const filtered = customers.filter(customer =>
            customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCustomers(filtered);
    };

    useEffect(() => {
        filterCustomers();
    }, [searchTerm, customers]);

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem("token") || "";
            if (customerEdited) {
                await customerService.updateCustomer(customerEdited.customerId, form, token);
                setCustomers((prev) => prev.map((c) => (c.customerId === customerEdited.customerId ? { ...c, ...form } : c)));
                setCustomerEdited(null);
            } else {
                const newCustomer = await customerService.addCustomer(form, token);
                setCustomers((prev) => [...prev, newCustomer]);
            }
            setShowModal(false);
            setForm({ fullName: "", email: "", phoneNumber: "", createdAt: "" });
        } catch (error) {
            console.log("Error adding customer:", error);
        }
    };

    const handleEdit = (customer: any) => {
        setCustomerEdited(customer);
        setForm({
            fullName: customer.fullName,
            email: customer.email,
            phoneNumber: customer.phoneNumber,
            createdAt: customer.createdAt,
        });
        setShowModal(true);
    };

    const handleDelete = async (customerId: number) => {
        if (!confirm("Are you sure you want to delete this customer?")) return;
        
        try {
            const token = localStorage.getItem("token") || "";
            await customerService.deleteCustomer(customerId, token);
            setCustomers((prev) => prev.filter((c) => c.customerId !== customerId));
        } catch (error) {
            console.log("Error deleting customer:", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">{t('messages.loading')}</p>
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
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                All Customers
                            </h1>
                            <p className="text-gray-500 mt-1">Manage all customer accounts</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Total Customers</p>
                                <p className="text-3xl font-bold mt-2">{customers.length}</p>
                            </div>
                            <div className="p-4 bg-white/20 rounded-xl">
                                <Users className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Active Customers</p>
                                <p className="text-3xl font-bold mt-2">{filteredCustomers.length}</p>
                            </div>
                            <div className="p-4 bg-white/20 rounded-xl">
                                <Search className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium">New (30 days)</p>
                                <p className="text-3xl font-bold mt-2">
                                    {customers.filter(c => {
                                        const created = new Date(c.createdAt);
                                        const now = new Date();
                                        const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
                                        return diffDays <= 30;
                                    }).length}
                                </p>
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
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-700 w-5 h-5" />
                            <input
                                type="text"
                                placeholder={t('searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-700 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>
                        <button
                            onClick={() => {
                                setCustomerEdited(null);
                                setForm({ fullName: "", email: "", phoneNumber: "", createdAt: "" });
                                setShowModal(true);
                            }}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:scale-105 transition-all font-semibold"
                        >
                            <Plus className="w-5 h-5" />
                            Add Customer
                        </button>
                    </div>
                </div>

                {/* Customers Table */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">ID</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Email</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Phone</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Joined</th>
                                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredCustomers.map((customer) => (
                                    <tr key={customer.customerId} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-gray-600">#{customer.customerId}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                                                    {customer.fullName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{customer.fullName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Mail className="w-4 h-4 text-gray-600" />
                                                {customer.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                {customer.phoneNumber}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">
                                            {new Date(customer.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(customer)}
                                                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(customer.customerId)}
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
                        {filteredCustomers.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p className="text-lg font-medium">{t('messages.noCustomers')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl transform transition-all">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-t-3xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-xl">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">
                                        {customerEdited ? "Edit Customer" : "Add Customer"}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setCustomerEdited(null);
                                    }}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6 text-white" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter full name"
                                    value={form.fullName}
                                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                    className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    placeholder="example@email.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Phone <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    placeholder="0901234567"
                                    value={form.phoneNumber}
                                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                                    className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="px-6 pb-6 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setCustomerEdited(null);
                                }}
                                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all"
                            >
                                {customerEdited ? "Update" : "Add"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
