/**
 * Technician Management Page
 * Manages mechanic and technician staff records
 * Allows creating, editing, and deleting technician profiles
 * Tracks technician availability and contact information
 */
"use client";
import React, { useState, useEffect } from "react";
import {
    Users,
    Wrench,
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Loader2,
    AlertCircle,
    Mail,
    Phone,
    User,
    CheckCircle,
    Clock,
    XCircle
} from "lucide-react";
import { TechnicalDTO, technicalService } from "@/services/technicalService";

export default function TechnicianPage() {
    const [technicians, setTechnicians] = useState<TechnicalDTO[]>([]);
    const [filteredTechnicians, setFilteredTechnicians] = useState<TechnicalDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [showModal, setShowModal] = useState(false);
    const [editingTechnician, setEditingTechnician] = useState<TechnicalDTO | null>(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;


    useEffect(() => {
        if (!token) {
            setError("Please login to access this page.");
            setLoading(false);
            return;
        }
        loadTechnicians();
    }, [token]);

    useEffect(() => {
        filterTechnicians();
    }, [technicians, searchTerm, statusFilter]);

    const loadTechnicians = async () => {
        try {
            setLoading(true);
            setError(null);

            //   // Mock data for demo
            //   const mockData: TechnicalDTO[] = [
            //     {
            //       technicianId: 1,
            //       fullName: "Nguyễn Văn An",
            //       phoneNumber: "0901234567",
            //       email: "nguyenvanan@garage.com",
            //       status: "Available"
            //     },
            //     {
            //       technicianId: 2,
            //       fullName: "Trần Minh Tuấn",
            //       phoneNumber: "0912345678",
            //       email: "tranminhtuan@garage.com",
            //       status: "Busy"
            //     },
            //     {
            //       technicianId: 3,
            //       fullName: "Lê Hoàng Nam",
            //       phoneNumber: "0923456789",
            //       email: "lehoangnam@garage.com",
            //       status: "Available"
            //     },
            //     {
            //       technicianId: 4,
            //       fullName: "Phạm Đức Anh",
            //       phoneNumber: "0934567890",
            //       email: "phamducanh@garage.com",
            //       status: "On Leave"
            //     },
            //     {
            //       technicianId: 5,
            //       fullName: "Võ Quốc Huy",
            //       phoneNumber: "0945678901",
            //       email: "voquochuy@garage.com",
            //       status: "Available"
            //     },
            //     {
            //       technicianId: 6,
            //       fullName: "Đặng Thành Long",
            //       phoneNumber: "0956789012",
            //       email: "dangthanhlong@garage.com",
            //       status: "Busy"
            //     }
            //   ];

            //   setTechnicians(mockData);
            //   setFilteredTechnicians(mockData);
            const data = await technicalService.getTechnicians(token!);
            setTechnicians(data);
            setFilteredTechnicians(data);
        } catch (error: any) {
            console.error("Error loading technicians:", error);
            setError(error.message || "Can't load technician data");
        } finally {
            setLoading(false);
        }
    };

    const filterTechnicians = () => {
        let filtered = [...technicians];

        // Filter by status
        if (statusFilter !== "all") {
            filtered = filtered.filter(t => t.status === statusFilter);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(t =>
                t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.phoneNumber.includes(searchTerm)
            );
        }

        setFilteredTechnicians(filtered);
    };

    const handleAdd = async (technicianData: any) => {
        if (!token) {
            alert("Token not found!");
            return;
        }

        try {
            const newTechnician = await technicalService.addTechnician(technicianData, token);
            setTechnicians(prev => [...prev, newTechnician]);
            setFilteredTechnicians(prev => [...prev, newTechnician]);
            setShowModal(false);
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Failed to add technician");
        }
    };

    const handleEdit = async (technicianData: any) => {
        if (!token || !editingTechnician) return;

        try {
            const updated = await technicalService.updateTechnician(editingTechnician.technicianId, technicianData, token);
            setTechnicians(prev =>
                prev.map(t => t.technicianId === editingTechnician.technicianId
                    ? { ...t, ...technicianData }
                    : t
                )
            );
            setFilteredTechnicians(prev =>
                prev.map(t => t.technicianId === editingTechnician.technicianId
                    ? { ...t, ...technicianData }
                    : t
                )
            );
            setShowModal(false);
            setEditingTechnician(null);
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Failed to update technician");
        }
    };

    const handleDelete = async (technicianId: number) => {
        if (!confirm("Are you sure you want to delete this technician?")) return;
        if (!token) return;

        try {
            await technicalService.deleteTechnician(technicianId, token);
            setTechnicians(prev => prev.filter(t => t.technicianId !== technicianId));
            setFilteredTechnicians(prev => prev.filter(t => t.technicianId !== technicianId));
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Failed to delete technician");
        }
    };

    const openEditModal = (technician: TechnicalDTO) => {
        setEditingTechnician(technician);
        setShowModal(true);
    };

    const getStatusConfig = (status: string) => {
        const configs: any = {
            "Available": {
                label: "Avauilable",
                color: "bg-green-100 text-green-700 border-green-200",
                icon: CheckCircle,
                dotColor: "bg-green-500"
            },
            "Busy": {
                label: "Busy",
                color: "bg-orange-100 text-orange-700 border-orange-200",
                icon: Clock,
                dotColor: "bg-orange-500"
            },
            "On Leave": {
                label: "On Leave",
                color: "bg-red-100 text-red-700 border-red-200",
                icon: XCircle,
                dotColor: "bg-red-500"
            }
        };
        return configs[status] || configs["Available"];
    };

    const stats = {
        total: technicians.length,
        available: technicians.filter(t => t.status === "Available").length,
        busy: technicians.filter(t => t.status === "Busy").length,
        onLeave: technicians.filter(t => t.status === "On Leave").length
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading technician data...</p>
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
                            <Wrench className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Teachnical Management
                            </h1>
                            <p className="text-gray-500 mt-1">Manage technician information and status</p>
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
                                <p className="text-blue-100 text-sm font-medium">Total Technical</p>
                                <p className="text-3xl font-bold mt-2">{stats.total}</p>
                            </div>
                            <div className="p-4 bg-white/20 rounded-xl">
                                <Users className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Available</p>
                                <p className="text-3xl font-bold mt-2">{stats.available}</p>
                            </div>
                            <div className="p-4 bg-white/20 rounded-xl">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm font-medium">Busy</p>
                                <p className="text-3xl font-bold mt-2">{stats.busy}</p>
                            </div>
                            <div className="p-4 bg-white/20 rounded-xl">
                                <Clock className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium">On Leave</p>
                                <p className="text-3xl font-bold mt-2">{stats.onLeave}</p>
                            </div>
                            <div className="p-4 bg-white/20 rounded-xl">
                                <XCircle className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search Name, email, phone number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                        >
                            <option value="all">All Status</option>
                            <option value="Available">Available</option>
                            <option value="Busy">Busy</option>
                            <option value="On Leave">On Leave</option>
                        </select>
                        <button
                            onClick={() => {
                                setEditingTechnician(null);
                                setShowModal(true);
                            }}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:scale-105 transition-all font-semibold whitespace-nowrap"
                        >
                            <Plus className="w-5 h-5" />
                            Add Technician
                        </button>
                    </div>
                </div>

                {/* Technician Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTechnicians.map((tech) => {
                        const statusConfig = getStatusConfig(tech.status);
                        const StatusIcon = statusConfig.icon;

                        return (
                            <div
                                key={tech.technicianId}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all"
                            >
                                <div className="p-6">
                                    {/* Avatar & Name */}
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                                            {tech.fullName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold text-gray-900 truncate">{tech.fullName}</h3>
                                            <p className="text-sm text-gray-500">ID: {tech.technicianId}</p>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="mb-4">
                                        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border-2 ${statusConfig.color}`}>
                                            <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor} animate-pulse`}></div>
                                            <StatusIcon className="w-4 h-4" />
                                            <span className="text-sm font-semibold">{statusConfig.label}</span>
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm">{tech.phoneNumber}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm truncate">{tech.email}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => openEditModal(tech)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-colors font-medium"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(tech.technicianId)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredTechnicians.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-2xl shadow-lg">
                        <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">No technicians found</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <TechnicianModal
                    close={() => {
                        setShowModal(false);
                        setEditingTechnician(null);
                    }}
                    submit={editingTechnician ? handleEdit : handleAdd}
                    title={editingTechnician ? "Edit Technician" : "Add New Technician"}
                    initialData={editingTechnician}
                />
            )}
        </div>
    );
}

function TechnicianModal({ close, submit, title, initialData }: any) {
    const [form, setForm] = useState({
        fullName: initialData?.fullName || "",
        phoneNumber: initialData?.phoneNumber || "",
        email: initialData?.email || "",
        status: initialData?.status || "Available"
    });

    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!form.fullName || !form.phoneNumber || !form.email) {
            alert("Please fill in all required information!");
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
                                <User className="w-6 h-6 text-white" />
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
                           FullName <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.fullName}
                            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                            placeholder="Nguyễn Văn A"
                            className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                PhoneNumber <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                value={form.phoneNumber}
                                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                                placeholder="0901234567"
                                className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                               Status
                            </label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            >
                                <option value="Available">Available</option>
                                <option value="Busy">Busy</option>
                                <option value="On Leave">On Leave</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="technician@garage.com"
                            className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={close}
                        disabled={submitting}
                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                        {submitting ? <><Loader2 className="w-5 h-5 animate-spin" />Saving...</> : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}