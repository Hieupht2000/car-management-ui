"use client";

import React from "react";
import {
    Building2,
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Loader2,
    AlertCircle,
    MapPin,
    Phone,
    Mail,
    Clock,
    Users,
    Wrench,
    Eye
} from "lucide-react";
import { GarageDTO, garagesService } from "@/services/garagesService";
import { useEffect, useState } from "react";

export default function GaragePage() {
    const [garages, setGarages] = useState<GarageDTO[]>([]);
    const [filteredGarages, setFilteredGarages] = useState<GarageDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [editingGarage, setEditingGarage] = useState<GarageDTO | null>(null);
    const [selectedGarage, setSelectedGarage] = useState<GarageDTO | null>(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;


    useEffect(() => {
        if (!token) {
            setError("Please log in to access garages.");
            setLoading(false);
            return;
        }
        loadGarages();
    }, [token]);

    useEffect(() => {
        filterGarages();
    }, [garages, searchTerm]);

    const loadGarages = async () => {
        try {
            setLoading(true);
            setError(null);

            //   // Mock data for demo
            //   const mockData: GarageDTO[] = [
            //     {
            //       garageId: 1,
            //       name: "Auto Pro Garage",
            //       address: "123 Đường Nguyễn Văn Linh, Q7, TP.HCM",
            //       phoneNumber: "028-12345678"
            //     },
            //     {
            //       garageId: 2,
            //       name: "Speed Motor Center",
            //       address: "456 Đường Lê Văn Việt, Q9, TP.HCM",
            //       phoneNumber: "028-87654321"
            //     },
            //     {
            //       garageId: 3,
            //       name: "Excellence Auto Care",
            //       address: "789 Đường Võ Văn Ngân, Thủ Đức, TP.HCM",
            //       phoneNumber: "028-11223344"
            //     },
            //     {
            //       garageId: 4,
            //       name: "Quick Fix Workshop",
            //       address: "321 Đường Phan Văn Trị, Bình Thạnh, TP.HCM",
            //       phoneNumber: "028-55667788"
            //     }
            //   ];

            //   setGarages(mockData);
            //   setFilteredGarages(mockData);
            const data = await garagesService.getGarages(token!);
            setGarages(data);
            setFilteredGarages(data);
        } catch (error: any) {
            console.error("Error loading garages:", error);
            setError(error.message || "Can't load garages data.");
        } finally {
            setLoading(false);
        }
    };

    const filterGarages = () => {
        if (!searchTerm) {
            setFilteredGarages(garages);
            return;
        }
        const filtered = garages.filter(g =>
            g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.phoneNumber.includes(searchTerm)
        );
        setFilteredGarages(filtered);
    };

    const handleAdd = async (garageData: any) => {
        if (!token) {
            alert("Token not found!");
            return;
        }

        try {
            const newGarage = await garagesService.createGarage(garageData, token);
            setGarages(prev => [...prev, newGarage]);
            setFilteredGarages(prev => [...prev, newGarage]);
            setShowModal(false);
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Failed to add garage");
        }
    };

    const handleEdit = async (garageData: any) => {
        if (!token || !editingGarage) return;

        try {
            const updated = await garagesService.updateGarage(editingGarage.garageId, garageData, token);
            setGarages(prev =>
                prev.map(g => g.garageId === editingGarage.garageId
                    ? { ...g, ...garageData }
                    : g
                )
            );
            setFilteredGarages(prev =>
                prev.map(g => g.garageId === editingGarage.garageId
                    ? { ...g, ...garageData }
                    : g
                )
            );
            setShowModal(false);
            setEditingGarage(null);
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Failed to update garage");
        }
    };

    const handleDelete = async (garageId: number) => {
        if (!confirm("Are you sure do you want garage?")) return;
        if (!token) return;

        try {
            await garagesService.deleteGarage(garageId, token);
            setGarages(prev => prev.filter(g => g.garageId !== garageId));
            setFilteredGarages(prev => prev.filter(g => g.garageId !== garageId));
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Failed to delete garage!");
        }
    };

    const openEditModal = (garage: GarageDTO) => {
        setEditingGarage(garage);
        setShowModal(true);
    };

    const stats = {
        total: garages.length,
        active: garages.length,
        inactive: 0,
        avgRating: "N/A"
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading data garage...</p>
                </div>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Logged In</h2>
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
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Garages
                            </h1>
                            <p className="text-gray-500 mt-1">Manage garage information</p>
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
                                <p className="text-blue-100 text-sm font-medium">Total Garage</p>
                                <p className="text-3xl font-bold mt-2">{stats.total}</p>
                            </div>
                            <div className="p-4 bg-white/20 rounded-xl">
                                <Building2 className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Active</p>
                                <p className="text-3xl font-bold mt-2">{stats.active}</p>
                            </div>
                            <div className="p-4 bg-white/20 rounded-xl">
                                <Wrench className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm font-medium">Inactive</p>
                                <p className="text-3xl font-bold mt-2">{stats.inactive}</p>
                            </div>
                            <div className="p-4 bg-white/20 rounded-xl">
                                <AlertCircle className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium">Average Rating</p>
                                <p className="text-3xl font-bold mt-2">{stats.avgRating} ⭐</p>
                            </div>
                            <div className="p-4 bg-white/20 rounded-xl">
                                <Users className="w-8 h-8" />
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
                                placeholder="Search name, address, phone number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>
                        <button
                            onClick={() => {
                                setEditingGarage(null);
                                setShowModal(true);
                            }}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:scale-105 transition-all font-semibold"
                        >
                            <Plus className="w-5 h-5" />
                            Add Garage
                        </button>
                    </div>
                </div>

                {/* Garage Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGarages.map((garage) => (
                        <div
                            key={garage.garageId}
                            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all group"
                        >
                            {/* Card Header */}
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                                <div className="flex items-start justify-between">
                                    <h3 className="text-xl font-bold text-white">{garage.name}</h3>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                        ID: {garage.garageId}
                                    </span>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-5 space-y-3">
                                <div className="flex items-start gap-2 text-gray-700">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                    <span className="text-sm">{garage.address}</span>
                                </div>

                                <div className="flex items-center gap-2 text-gray-700">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm">{garage.phoneNumber}</span>
                                </div>
                            </div>

                            {/* Card Actions */}
                            <div className="px-5 pb-5 flex gap-2">
                                <button
                                    onClick={() => {
                                        setSelectedGarage(garage);
                                        setShowDetailModal(true);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors font-medium"
                                >
                                    <Eye className="w-4 h-4" />
                                    Details
                                </button>
                                <button
                                    onClick={() => openEditModal(garage)}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(garage.garageId)}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredGarages.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-2xl shadow-lg">
                        <Building2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">Not Found Garage</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <GarageModal
                    close={() => {
                        setShowModal(false);
                        setEditingGarage(null);
                    }}
                    submit={editingGarage ? handleEdit : handleAdd}
                    title={editingGarage ? "Edit Garage" : "Add New Garage"}
                    initialData={editingGarage}
                />
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedGarage && (
                <DetailModal
                    garage={selectedGarage}
                    close={() => {
                        setShowDetailModal(false);
                        setSelectedGarage(null);
                    }}
                />
            )}
        </div>
    );
}

// Simple DetailModal implementation
function DetailModal({ garage, close }: { garage: GarageDTO, close: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-t-3xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Garage Details</h2>
                    </div>
                    <button
                        onClick={close}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <span className="font-semibold">Address:</span>
                        <span>{garage.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span className="font-semibold">Phone Number:</span>
                        <span>{garage.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                        <span className="font-semibold">ID:</span>
                        <span>{garage.garageId}</span>
                    </div>
                </div>
                <div className="px-6 pb-6">
                    <button
                        onClick={close}
                        className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}

function GarageModal({ close, submit, title, initialData }: any) {
    const [form, setForm] = useState({
        name: initialData?.name || "",
        address: initialData?.address || "",
        phoneNumber: initialData?.phoneNumber || ""
    });

    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!form.name || !form.address || !form.phoneNumber) {
            alert("Please fill in all required fields!");
            return;
        }

        setSubmitting(true);
        try {
            await submit(form);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-t-3xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">{title}</h2>
                        </div>
                        <button
                            onClick={close}
                            disabled={submitting}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Name Garage <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Auto Pro Garage"
                            className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            placeholder="123 Đường ABC, Quận 1, TP.HCM"
                            className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            PhoneNumber <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            value={form.phoneNumber}
                            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                            placeholder="028-12345678"
                            className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                        />
                    </div>
                </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
                <button
                    onClick={close}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                >   Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                    {submitting ? <><Loader2 className="w-5 h-5 animate-spin" />Loading...</> : "Save Changes"}
                </button>
            </div>
        </div>
    );
}

