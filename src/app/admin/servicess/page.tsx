/**
 * Admin Services Management Page
 * Manage service offerings and pricing
 */
"use client";

import { useState } from "react";
import { Wrench, Plus, Edit2, Trash2, X, DollarSign, AlignLeft } from "lucide-react";

interface Service {
    id: number;
    name: string;
    description: string;
    price: number;
    estimatedTime: string;
    category: string;
}

export default function AdminServicePage() {
    const [services, setServices] = useState<Service[]>([
        {
            id: 1,
            name: "Oil Change",
            description: "Regular engine oil replacement",
            price: 500000,
            estimatedTime: "30 mins",
            category: "Maintenance"
        },
        {
            id: 2,
            name: "Brake Service",
            description: "Brake pad replacement and inspection",
            price: 1200000,
            estimatedTime: "1 hour",
            category: "Safety"
        },
        {
            id: 3,
            name: "Wheel Alignment",
            description: "Precision wheel alignment service",
            price: 800000,
            estimatedTime: "45 mins",
            category: "Maintenance"
        },
    ]);
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [form, setForm] = useState({
        name: "",
        description: "",
        price: 0,
        estimatedTime: "",
        category: "Maintenance",
    });

    const categories = ["Maintenance", "Repair", "Safety", "Cleaning", "Inspection"];

    const handleDelete = (id: number) => {
        if (!confirm("Delete this service?")) return;
        setServices(prev => prev.filter(s => s.id !== id));
    };

    const handleSubmit = () => {
        if (!form.name || !form.price) {
            alert("Please fill in all required fields!");
            return;
        }

        if (editingService) {
            setServices(prev => prev.map(s =>
                s.id === editingService.id
                    ? { ...s, ...form }
                    : s
            ));
        } else {
            setServices(prev => [...prev, {
                id: Math.max(...prev.map(s => s.id), 0) + 1,
                ...form,
            }]);
        }

        setShowModal(false);
        setEditingService(null);
        setForm({ name: "", description: "", price: 0, estimatedTime: "", category: "Maintenance" });
    };

    const handleEdit = (service: Service) => {
        setEditingService(service);
        setForm({
            name: service.name,
            description: service.description,
            price: service.price,
            estimatedTime: service.estimatedTime,
            category: service.category,
        });
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                            <Wrench className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Services Management
                            </h1>
                            <p className="text-gray-500 mt-1">Manage service offerings and pricing</p>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
                    <button
                        onClick={() => {
                            setEditingService(null);
                            setForm({ name: "", description: "", price: 0, estimatedTime: "", category: "Maintenance" });
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:scale-105 transition-all font-semibold"
                    >
                        <Plus className="w-5 h-5" />
                        Add Service
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Total Services</p>
                                <p className="text-3xl font-bold mt-2">{services.length}</p>
                            </div>
                            <Wrench className="w-8 h-8 opacity-40" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Avg Price</p>
                                <p className="text-3xl font-bold mt-2">${(services.reduce((sum, s) => sum + s.price, 0) / Math.max(services.length, 1) / 1000).toFixed(0)}K</p>
                            </div>
                            <DollarSign className="w-8 h-8 opacity-40" />
                        </div>
                    </div>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.length > 0 ? (
                        services.map((service) => (
                            <div key={service.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(service)}
                                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(service.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full mb-2">
                                            {service.category}
                                        </span>
                                        <p className="text-gray-600 text-sm">{service.description}</p>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                        <div>
                                            <p className="text-sm text-gray-600">Time</p>
                                            <p className="font-medium text-gray-900">{service.estimatedTime}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">Price</p>
                                            <p className="text-2xl font-bold text-green-600">${(service.price / 1000).toFixed(0)}K</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                            <Wrench className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-medium text-gray-500">No services added yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-t-3xl sticky top-0">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-white">
                                    {editingService ? "Edit Service" : "Add Service"}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6 text-white" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Service Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Oil Change"
                                    className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Service description..."
                                    rows={3}
                                    className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Price *</label>
                                <input
                                    type="number"
                                    value={form.price}
                                    onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                                    placeholder="500000"
                                    className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Time</label>
                                <input
                                    type="text"
                                    value={form.estimatedTime}
                                    onChange={(e) => setForm({ ...form, estimatedTime: e.target.value })}
                                    placeholder="30 mins"
                                    className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                                <select
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="px-6 pb-6 flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
                            >
                                {editingService ? "Update" : "Add"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
