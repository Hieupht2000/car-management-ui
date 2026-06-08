/**
 * Time Slot Management Page
 * Manages appointment scheduling slots and availability
 * Allows creating, editing, and deleting time slots
 * Controls when appointments can be booked
 */
"use client"

import { useState, useEffect } from "react";
import {
    Clock,
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Loader2,
    AlertCircle,
    Calendar,
    CheckCircle
} from "lucide-react";
import { authService } from "@/services/authService";
import { TimeSlot, timeSlotService } from "@/services/TimeSlotService";



export default function TimeSlotPage() {
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [filteredTimeSlots, setFilteredTimeSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingTimeSlot, setEditingTimeSlot] = useState<TimeSlot | null>(null);
    const [filterAvailable, setFilterAvailable] = useState<string>("all");
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
        if (!token) {
            setError("Please Login");
            setLoading(false);
            return;
        }
        loadTimeSlots();
    }, [token]);

    useEffect(() => {
        filterTimeSlots();
    }, [timeSlots, searchTerm, filterAvailable]);

    const loadTimeSlots = async () => {
        try {
            setLoading(true);
            setError(null);

            // Mock data for demo
            //   const mockData: TimeSlot[] = [
            //     { timeSlot_Id: 1, startTime: "08:00:00", endTime: "09:00:00", isAvailable: true },
            //     { timeSlot_Id: 2, startTime: "09:00:00", endTime: "10:00:00", isAvailable: true },
            //     { timeSlot_Id: 3, startTime: "10:00:00", endTime: "11:00:00", isAvailable: false },
            //     { timeSlot_Id: 4, startTime: "11:00:00", endTime: "12:00:00", isAvailable: true },
            //     { timeSlot_Id: 5, startTime: "13:00:00", endTime: "14:00:00", isAvailable: true },
            //     { timeSlot_Id: 6, startTime: "14:00:00", endTime: "15:00:00", isAvailable: false },
            //     { timeSlot_Id: 7, startTime: "15:00:00", endTime: "16:00:00", isAvailable: true },
            //     { timeSlot_Id: 8, startTime: "16:00:00", endTime: "17:00:00", isAvailable: true }
            //   ];

            //   setTimeSlots(mockData);
            //   setFilteredTimeSlots(mockData);
            const data = await timeSlotService.getTimeSlots(token!);
            setTimeSlots(data);
            setFilteredTimeSlots(data);
        } catch (error: any) {
            console.error("Error loading time slots:", error);
            setError(error.message || "Can't loading data timeslot");
        } finally {
            setLoading(false);
        }
    };

    const filterTimeSlots = () => {
        let filtered = [...timeSlots];

        // Filter by availability
        if (filterAvailable === "available") {
            filtered = filtered.filter(ts => ts.isActive);
        } else if (filterAvailable === "unavailable") {
            filtered = filtered.filter(ts => !ts.isActive);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(ts =>
                ts.startTime.includes(searchTerm) ||
                ts.endTime.includes(searchTerm) ||
                ts.timeSlot_Id.toString().includes(searchTerm)
            );
        }

        setFilteredTimeSlots(filtered);
    };

    const handleAdd = async (timeSlotData: any) => {
        if (!token) {
            setError("Token not found!");
            return;
        }

        try {
            setError(null);
            const newTimeSlot = await timeSlotService.createTimeSlot(timeSlotData, token);
            setTimeSlots(prev => [...prev, newTimeSlot]);
            setShowModal(false);
        } catch (error: any) {
            console.error("Add error:", error);
            setError(error.message || "Failed to add time slot");
        }
    };

    const handleEdit = async (timeSlotData: any) => {
        if (!token || !editingTimeSlot) return;

        try {
            const payload = {
                startTime: timeSlotData.startTime,
                endTime: timeSlotData.endTime,
                isActive: timeSlotData.isActive,
                timeSlot_Id: editingTimeSlot.timeSlot_Id
            };

            console.log("Editing time slot with payload:", JSON.stringify(payload, null, 2));
            const response = await timeSlotService.updateTimeSlot(editingTimeSlot.timeSlot_Id, payload, token);
            console.log("Edit response:", response);

            setTimeSlots(prev =>
                prev.map(ts =>
                    ts.timeSlot_Id === editingTimeSlot.timeSlot_Id
                        ? { ...ts, ...payload }
                        : ts
                )
            );

            setShowModal(false);
            setEditingTimeSlot(null);
        } catch (error: any) {
            console.error("Edit error:", error);
            alert(error.message || "Failed to update time slot");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Bạn có chắc muốn xóa khung giờ này?")) return;
        if (!token) {
            setError("Token not found");
            return;
        }

        try {
            setError(null);
            await timeSlotService.deleteTimeSlot(id, token);
            setTimeSlots(prev => prev.filter(ts => ts.timeSlot_Id !== id));
        } catch (error: any) {
            console.error("Delete error:", error);
            setError(error.message || "Delete Failed!");
        }
    };

    const toggleAvailability = async (timeSlot: TimeSlot) => {
        if (!token) {
            setError("Token not found");
            return;
        }

        const updatedTimeSlot = {
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime,
            isActive: !timeSlot.isActive,
            timeSlot_Id: timeSlot.timeSlot_Id
        };

        console.log("Toggling availability with payload:", JSON.stringify(updatedTimeSlot, null, 2));

        try {
            setError(null);
            const response = await timeSlotService.updateTimeSlot(timeSlot.timeSlot_Id, updatedTimeSlot, token);
            console.log("Toggle response:", response);

            setTimeSlots(prev =>
                prev.map(ts => ts.timeSlot_Id === timeSlot.timeSlot_Id ? updatedTimeSlot : ts)
            );
        } catch (error: any) {
            console.error("Toggle availability error:", error);
            setError(error.message || "Không thể cập nhật trạng thái");
            // Revert UI if error
            setTimeSlots(prev => prev.map(ts => ts.timeSlot_Id === timeSlot.timeSlot_Id ? timeSlot : ts));
        }
    };

    const stats = {
        total: timeSlots.length,
        active: timeSlots.filter(ts => ts.isActive).length,
        inactive: timeSlots.filter(ts => !ts.isActive).length,
        morningSlots: timeSlots.filter(ts => {
            const hour = parseInt(ts.startTime.split(':')[0]);
            return hour < 12;
        }).length
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading data...</p>
                </div>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Login</h2>
                    <p className="text-gray-600 mb-6">Vui lòng đăng nhập để truy cập trang này</p>
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
                            <Clock className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                TimeSlots Managetment
                            </h1>
                            <p className="text-gray-500 mt-1">Manage appointment scheduling slots</p>
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
                                <p className="text-blue-100 text-sm font-medium">Total Time Slots</p>
                                <p className="text-3xl font-bold mt-2">{stats.total}</p>
                            </div>
                            <div className="p-4 bg-white/20 rounded-xl">
                                <Clock className="w-8 h-8" />
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
                                <CheckCircle className="w-8 h-8" />
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
                                <p className="text-purple-100 text-sm font-medium">Morning Slots</p>
                                <p className="text-3xl font-bold mt-2">{stats.morningSlots}</p>
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
                        <div className="flex gap-4 items-center w-full md:w-auto">
                            <div className="relative flex-1 md:flex-initial md:w-64">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                />
                            </div>
                            <select
                                value={filterAvailable}
                                onChange={(e) => setFilterAvailable(e.target.value)}
                                className="px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            >
                                <option value="all">All</option>
                                <option value="available">Available</option>
                                <option value="unavailable">Unavailable</option>
                            </select>
                        </div>
                        <button
                            onClick={() => {
                                setEditingTimeSlot(null);
                                setShowModal(true);
                            }}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:scale-105 transition-all font-semibold"
                        >
                            <Plus className="w-5 h-5" />
                            ADD TIMESLOTS
                        </button>
                    </div>
                </div>

                {/* TimeSlot Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredTimeSlots.map((timeSlot) => (
                        <div
                            key={timeSlot.timeSlot_Id}
                            className={`rounded-2xl shadow-lg overflow-hidden border-2 transition-all hover:shadow-xl ${timeSlot.isActive
                                ? 'bg-white border-green-200 hover:border-green-400'
                                : 'bg-gray-50 border-gray-300'
                                }`}
                        >
                            <div className={`p-4 ${timeSlot.isActive ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-gray-400 to-gray-500'}`}>
                                <div className="flex items-center justify-between">
                                    <Clock className="w-6 h-6 text-white" />
                                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold text-white">
                                        ID: {timeSlot.timeSlot_Id}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5 space-y-4">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-gray-900 mb-1">
                                        {timeSlot.startTime.substring(0, 5)}
                                    </div>
                                    <div className="text-gray-400 text-sm mb-1">to</div>
                                    <div className="text-3xl font-bold text-gray-900">
                                        {timeSlot.endTime.substring(0, 5)}
                                    </div>
                                </div>

                                <div className="flex items-center justify-center">
                                    <button
                                        onClick={() => toggleAvailability(timeSlot)}
                                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${timeSlot.isActive
                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                    >
                                        {timeSlot.isActive ? '✓ Active' : '✕ Inactive'}
                                    </button>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => {
                                            setEditingTimeSlot(timeSlot);
                                            setShowModal(true);
                                        }}
                                        className="flex-1 px-3 py-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors font-medium text-sm"
                                    >
                                        <Edit2 className="w-4 h-4 mx-auto" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(timeSlot.timeSlot_Id)}
                                        className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
                                    >
                                        <Trash2 className="w-4 h-4 mx-auto" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredTimeSlots.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-2xl shadow-lg">
                        <Clock className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">Can't Found TimeSlots</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <TimeSlotModal
                    close={() => {
                        setShowModal(false);
                        setEditingTimeSlot(null);
                    }}
                    submit={editingTimeSlot ? handleEdit : handleAdd}
                    title={editingTimeSlot ? "Edit TimeSlots" : "Add TimeSLots"}
                    initialData={editingTimeSlot}
                />
            )}
        </div>
    );
}

function TimeSlotModal({ close, submit, title, initialData }: any) {
    const [form, setForm] = useState({
        startTime: initialData?.startTime || "08:00:00",
        endTime: initialData?.endTime || "09:00:00",
        isActive: initialData?.isActive ?? true,
        timeSlot_Id: initialData?.timeSlot_Id
    });

    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!form.startTime || !form.endTime) {
            alert("Please fill in all the information!");
            return;
        }

        // Validate time
        if (form.startTime >= form.endTime) {
            alert("The start time must be earlier than the end time!");
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
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-t-3xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Clock className="w-6 h-6 text-white" />
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
                            Start Time <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="time"
                            value={form.startTime.substring(0, 5)}
                            onChange={(e) => setForm({ ...form, startTime: e.target.value + ":00" })}
                            className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            End Time <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="time"
                            value={form.endTime.substring(0, 5)}
                            onChange={(e) => setForm({ ...form, endTime: e.target.value + ":00" })}
                            className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                            <input
                                type="checkbox"
                                checked={form.isActive}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        isActive: e.target.checked,
                                    })
                                }
                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />

                            <div>
                                <span className="text-sm font-semibold text-gray-900">
                                    Active
                                </span>
                                <p className="text-xs text-gray-500">
                                    Customers can book this time slot
                                </p>
                            </div>
                        </label>
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