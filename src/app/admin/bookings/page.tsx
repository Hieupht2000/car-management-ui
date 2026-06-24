"use client";

import React, { useEffect, useState } from "react";
import {
    Calendar,
    Clock,
    Car,
    Plus,
    Search,
    Filter,
    Trash2,
    X,
    CheckCircle,
    AlertCircle,
    User,
    Loader2,
    Send,
    Bell,
} from "lucide-react";

import {
    BookingDTO,
    bookingService,
    
} from "@/services/bookingService";

import { technicalService } from "@/services/technicalService";
import TimeSlotSelector from "@/src/components/TimeSlotSelector";

type BookingStatus = "pending" | "confirmed" | "completed";

export default function BookingPage() {
    const [bookings, setBookings] = useState<BookingDTO[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingBooking, setEditingBooking] = useState<BookingDTO | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showDealerEmailModal, setShowDealerEmailModal] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
    const [dealerEmail, setDealerEmail] = useState("");

    const [showAssignTechnicianModal, setShowAssignTechnicianModal] = useState(false);
    const [selectedBookingForAssign, setSelectedBookingForAssign] =
        useState<BookingDTO | null>(null);
    const [technicians, setTechnicians] = useState<any[]>([]);
    const [selectedTechnicianId, setSelectedTechnicianId] = useState<number | null>(null);
    const [assigningTechnician, setAssigningTechnician] = useState(false);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const timeSlots: Record<number, string> = {
        1: "08:00 - 10:00",
        2: "10:00 - 12:00",
        3: "13:00 - 15:00",
        4: "15:00 - 17:00",
    };

    const normalizeStatus = (status?: string): BookingStatus => {
        const value = status?.trim().toLowerCase();

        if (value === "confirmed") return "confirmed";
        if (value === "completed") return "completed";

        return "pending";
    };

    const normalizeBooking = (booking: any): BookingDTO => {
        return {
            ...booking,
            booking_id:
                booking.booking_id ??
                booking.bookingId ??
                booking.booking_Id,
            status: normalizeStatus(booking.status),
            fullName: booking.fullName ?? "",
            licensePlate: booking.licensePlate ?? "",
            note: booking.note ?? "",
        };
    };

    useEffect(() => {
        if (!token) {
            setError("Please login!");
            setLoading(false);
            return;
        }

        loadBookings();
    }, [token]);

    const loadTechnicians = async () => {
        try {
            if (!token) return;

            const data = await technicalService.getTechnicians(token);
            setTechnicians(data || []);
        } catch (err) {
            console.error("Error loading technicians:", err);
        }
    };

    const loadBookings = async () => {
        try {
            if (!token) return;

            setLoading(true);
            setError(null);

            const data = await bookingService.getBookings(token);
            const list = Array.isArray(data)
                ? data
                : (data as any)?.data ?? (data as any)?.$values ?? [];

            const mappedBookings = list.map(normalizeBooking);

            setBookings(mappedBookings);

            await loadTechnicians();
        } catch (err: any) {
            console.error("Error loading bookings:", err);
            setError(err.message || "Can't load booking data");
        } finally {
            setLoading(false);
        }
    };

    const filteredBookings = bookings.filter((booking) => {
        const keyword = searchTerm.toLowerCase();

        const matchesSearch =
            booking.licensePlate?.toLowerCase().includes(keyword) ||
            booking.fullName?.toLowerCase().includes(keyword) ||
            booking.note?.toLowerCase().includes(keyword);

        const matchesFilter =
            filterStatus === "all" ||
            normalizeStatus(booking.status).toLowerCase() === filterStatus.toLowerCase();

        return matchesSearch && matchesFilter;
    });

    const handleDelete = async (bookingId: number) => {
        if (!confirm("Are you sure you want to delete this booking?")) return;

        try {
            if (!token) {
                alert("Token not found!");
                return;
            }

            setLoading(true);

            await bookingService.deleteBooking(bookingId, token);

            setBookings((prev) => prev.filter((b) => b.booking_id !== bookingId));

            alert("Delete booking successfully!");
        } catch (err: any) {
            console.error("Error deleting booking:", err);
            alert(err.message || "Delete failed!");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (bookingData: any) => {
        try {
            if (!token) {
                alert("Token not found!");
                return;
            }

            setLoading(true);

            await bookingService.createBookingAdmin(bookingData, token);

            setShowModal(false);
            setEditingBooking(null);

            alert("Create booking complete!");

            await loadBookings();
        } catch (err: any) {
            console.error("Error adding booking:", err);
            alert(err.message || "Create failed!");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (bookingId: number, newStatus: string) => {
        try {
            if (!token) {
                alert("Token not found!");
                return;
            }

            const status = normalizeStatus(newStatus);

            setLoading(true);

            await bookingService.updateBookingStatus(bookingId, status, token);

            setBookings((prev) =>
                prev.map((b) =>
                    b.booking_id === bookingId
                        ? { ...b, status }
                        : b
                )
            );

            alert("Update status complete!");
        } catch (err: any) {
            console.error("Error updating status:", err);
            alert(err.message || "Update status failed!");
        } finally {
            setLoading(false);
        }
    };

    const handleAssignTechnician = async () => {
        if (!selectedBookingForAssign || !selectedTechnicianId || !token) return;

        try {
            setAssigningTechnician(true);

            await bookingService.assignTechnician(
                selectedBookingForAssign.booking_id!,
                selectedTechnicianId,
                token
            );

            await loadBookings();

            alert("Technician assigned successfully!");

            setShowAssignTechnicianModal(false);
            setSelectedTechnicianId(null);
            setSelectedBookingForAssign(null);
        } catch (err: any) {
            console.error("Error assigning technician:", err);
            alert(err.message || "Failed to assign technician");
        } finally {
            setAssigningTechnician(false);
        }
    };

    const openAssignTechnicianModal = (booking: BookingDTO) => {
        setSelectedBookingForAssign(booking);
        setSelectedTechnicianId(null);
        setShowAssignTechnicianModal(true);
    };

    const handleSendEmailConfirmed = async (bookingId: number) => {
        if (!token) return;
        if (!confirm("Send confirmation email to the customer?")) return;

        try {
            await bookingService.sendEmaiConfrimed(bookingId, token);
            alert(`Email sent for booking #${bookingId}`);
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Send email failed!");
        }
    };

    const handleSendEmailToDealer = async (
        bookingId: number,
        dealerEmailValue: string
    ) => {
        if (!token) return;

        if (!dealerEmailValue) {
            alert("Dealer email is required!");
            return;
        }

        if (!confirm("Send email to dealer?")) return;

        try {
            await bookingService.sendEmailDealer(
                bookingId,
                dealerEmailValue,
                "You have a new booking. Please check the system.",
                token
            );

            alert(`Email sent to dealer for booking #${bookingId}`);
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Send email to dealer failed!");
        }
    };

    const handleSendReminder = async (booking: BookingDTO) => {
        if (!token) return;
        if (!confirm("Send reminder email?")) return;

        try {
            const msg = `Reminder: You have an appointment on ${new Date(
                booking.bookingDate
            ).toLocaleDateString("vi-VN")}`;

            await bookingService.sendEmailReminder(
                booking.booking_id!,
                msg,
                token
            );

            alert(`Reminder email sent for booking #${booking.booking_id}`);
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Send reminder failed!");
        }
    };

    const getStatusConfig = (status?: string) => {
        const statusLower = normalizeStatus(status);

        const configs: Record<
            BookingStatus,
            { label: string; color: string; icon: any }
        > = {
            pending: {
                label: "Pending",
                color: "bg-yellow-100 text-yellow-700",
                icon: AlertCircle,
            },
            confirmed: {
                label: "Confirmed",
                color: "bg-blue-100 text-blue-700",
                icon: CheckCircle,
            },
            completed: {
                label: "Completed",
                color: "bg-green-100 text-green-700",
                icon: CheckCircle,
            },
        };

        return configs[statusLower];
    };

    const stats = [
        {
            label: "Bookings",
            value: bookings.length,
            color: "from-blue-500 to-cyan-500",
        },
        {
            label: "Pending",
            value: bookings.filter((b) => normalizeStatus(b.status) === "pending").length,
            color: "from-yellow-500 to-orange-500",
        },
        {
            label: "Confirmed",
            value: bookings.filter((b) => normalizeStatus(b.status) === "confirmed").length,
            color: "from-green-500 to-emerald-500",
        },
        {
            label: "Completed",
            value: bookings.filter((b) => normalizeStatus(b.status) === "completed").length,
            color: "from-purple-500 to-pink-500",
        },
    ];

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Error
                    </h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => (window.location.href = "/auth/login")}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                        Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                            <Calendar className="w-8 h-8 text-white" />
                        </div>

                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Appointment Management
                            </h1>
                            <p className="text-gray-500 mt-1">
                                Manage maintenance and repair appointments for vehicles
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    {stats.map((stat, idx) => (
                        <div
                            key={idx}
                            className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white shadow-lg hover:scale-105 transition-transform`}
                        >
                            <p className="text-sm opacity-90 mb-1">{stat.label}</p>
                            <p className="text-3xl font-bold">{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="flex gap-3 flex-1 w-full">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by license plate, customer, note..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-200 outline-none transition-all"
                                />
                            </div>

                            <div className="relative">
                                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="pl-12 pr-8 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all appearance-none bg-white cursor-pointer"
                                >
                                    <option value="all">All</option>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setEditingBooking(null);
                                setShowModal(true);
                            }}
                            disabled={loading}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:scale-105 transition-all font-semibold whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Plus className="w-5 h-5" />
                            )}
                            Create Appointment
                        </button>
                    </div>
                </div>

                {loading && bookings.length === 0 && (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Loading data...</p>
                        </div>
                    </div>
                )}

                {!loading && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredBookings.map((booking) => {
                            const statusConfig = getStatusConfig(booking.status);
                            const bookingDate = new Date(booking.bookingDate);

                            return (
                                <div
                                    key={booking.booking_id}
                                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 overflow-hidden"
                                >
                                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white/20 rounded-lg">
                                                    <Car className="w-5 h-5" />
                                                </div>

                                                <div>
                                                    <p className="font-bold text-lg">
                                                        {booking.licensePlate || "N/A"}
                                                    </p>
                                                    <p className="text-sm text-blue-100">
                                                        Car ID: {booking.carId}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleSendEmailConfirmed(booking.booking_id!)
                                                    }
                                                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                                                    title="Send confirmation email"
                                                >
                                                    <Send className="w-4 h-4 text-white" />
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setSelectedBookingId(booking.booking_id!);
                                                        setDealerEmail(booking.dealerEmail || "");
                                                        setShowDealerEmailModal(true);
                                                    }}
                                                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                                                    title="Send email to dealer"
                                                >
                                                    <Send className="w-4 h-4 text-white" />
                                                </button>

                                                <button
                                                    onClick={() => handleSendReminder(booking)}
                                                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
                                                    title="Send reminder email"
                                                >
                                                    <Bell className="w-4 h-4 text-white" />
                                                </button>
                                            </div>

                                            <select
                                                value={normalizeStatus(booking.status)}
                                                onChange={(e) =>
                                                    handleStatusChange(
                                                        booking.booking_id!,
                                                        e.target.value
                                                    )
                                                }
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color} cursor-pointer`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="p-5 space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                            <span className="text-sm text-gray-600">
                                                Booking ID
                                            </span>
                                            <span className="font-bold text-gray-900">
                                                #{booking.booking_id}
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="font-semibold">
                                                    {booking.fullName || "Unknown"}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    (ID: {booking.customerId})
                                                </span>
                                            </div>
                                        </div>

                                        {booking.note && (
                                            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                                                <p className="text-sm text-gray-700">
                                                    {booking.note}
                                                </p>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 bg-gray-50 rounded-xl">
                                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span className="text-xs font-medium">
                                                        Booking Date
                                                    </span>
                                                </div>

                                                <p className="text-sm font-bold text-gray-900">
                                                    {bookingDate.toLocaleDateString("vi-VN")}
                                                </p>
                                            </div>

                                            <div className="p-3 bg-gray-50 rounded-xl">
                                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span className="text-xs font-medium">
                                                        Time Slot
                                                    </span>
                                                </div>

                                                <p className="text-sm font-bold text-gray-900">
                                                    {timeSlots[booking.timeSlot_Id] || "N/A"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 text-sm">
                                            <span className="text-gray-600 font-medium">
                                                Technician:{" "}
                                                <span className="text-gray-900">
                                                    {booking.technicianName ||
                                                        technicians.find(
                                                            (t: any) =>
                                                                t.technicianId ===
                                                                booking.technicianId
                                                        )?.fullName ||
                                                        "Not assigned"}
                                                </span>
                                            </span>

                                            <span className="text-gray-500">•</span>

                                            <span className="text-gray-600 font-medium">
                                                Garage:{" "}
                                                <span className="text-gray-900">
                                                    {booking.garageId}
                                                </span>
                                            </span>
                                        </div>

                                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                                            {!booking.technicianId && (
                                                <button
                                                    onClick={() =>
                                                        openAssignTechnicianModal(booking)
                                                    }
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors font-medium"
                                                >
                                                    <User className="w-4 h-4" />
                                                    Assign Tech
                                                </button>
                                            )}

                                            <button
                                                onClick={() =>
                                                    handleDelete(booking.booking_id!)
                                                }
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
                )}

                {!loading && filteredBookings.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                        <Calendar className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                        <p className="text-xl font-semibold text-gray-600">
                            No appointments found
                        </p>
                        <p className="text-gray-400 mt-2">
                            Try changing the filter or search
                        </p>
                    </div>
                )}
            </div>

            {showModal && (
                <BookingModal
                    close={() => {
                        setShowModal(false);
                        setEditingBooking(null);
                    }}
                    submit={handleAdd}
                    timeSlots={timeSlots}
                />
            )}

            {showDealerEmailModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-gray-700 mb-4">
                            Send Email To Dealer
                        </h3>

                        <input
                            type="email"
                            value={dealerEmail}
                            onChange={(e) => setDealerEmail(e.target.value)}
                            placeholder="dealer@example.com"
                            className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl mb-4"
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDealerEmailModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={async () => {
                                    if (!selectedBookingId || !dealerEmail) {
                                        alert("Dealer email is required!");
                                        return;
                                    }

                                    await handleSendEmailToDealer(
                                        selectedBookingId,
                                        dealerEmail
                                    );

                                    setShowDealerEmailModal(false);
                                }}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAssignTechnicianModal && selectedBookingForAssign && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Assign Technician
                            </h2>

                            <button
                                onClick={() => setShowAssignTechnicianModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-gray-600 mb-4">
                                <strong>Booking:</strong>{" "}
                                {selectedBookingForAssign.licensePlate} -{" "}
                                {selectedBookingForAssign.fullName}
                            </p>

                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Select Technician
                            </label>

                            <select
                                value={selectedTechnicianId || ""}
                                onChange={(e) =>
                                    setSelectedTechnicianId(Number(e.target.value))
                                }
                                className="w-full px-4 py-3 border-2 text-gray-700 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            >
                                <option value="">Choose a technician...</option>

                                {technicians.length > 0 ? (
                                    technicians.map((tech: any, index: number) => (
                                        <option
                                            key={`tech-${tech.technicianId}-${index}`}
                                            value={tech.technicianId}
                                        >
                                            {tech.fullName || tech.name || "Unnamed"}{" "}
                                            (ID: {tech.technicianId || tech.id})
                                        </option>
                                    ))
                                ) : (
                                    <option disabled>No technicians available</option>
                                )}
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowAssignTechnicianModal(false)}
                                className="flex-1 px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleAssignTechnician}
                                disabled={!selectedTechnicianId || assigningTechnician}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {assigningTechnician ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Assigning...
                                    </>
                                ) : (
                                    "Assign"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function BookingModal({
    close,
    submit,
    timeSlots,
}: {
    close: () => void;
    submit: (data: any) => void;
    timeSlots: Record<number, string>;
}) {
    const [form, setForm] = useState({
        customerId: "",
        carId: "",
        garageId: "",
        serviceId: "",
        bookingDate: "",
        timeSlot_Id: "",
        note: "",
    });

    const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : "";

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = () => {
        if (
            !form.customerId ||
            !form.carId ||
            !form.garageId ||
            !form.serviceId ||
            !form.bookingDate ||
            !form.timeSlot_Id
        ) {
            alert("Please fill in all required fields!");
            return;
        }

        const submitData: any = {
            customerId: Number(form.customerId),
            carId: Number(form.carId),
            garageId: Number(form.garageId),
            serviceId: Number(form.serviceId),
            timeSlot_Id: Number(form.timeSlot_Id),
            bookingDate: new Date(form.bookingDate).toISOString(),
            note: form.note,
        };

        submit(submitData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-t-3xl sticky top-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>

                            <h2 className="text-2xl font-bold text-white">
                                Create New Appointment
                            </h2>
                        </div>

                        <button
                            onClick={close}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                            Information Customer & Car
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="number"
                                name="customerId"
                                value={form.customerId}
                                onChange={handleChange}
                                placeholder="Customer ID"
                                className="px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none"
                            />

                            <input
                                type="number"
                                name="carId"
                                value={form.carId}
                                onChange={handleChange}
                                placeholder="Car ID"
                                className="px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                            Booking Details
                        </h3>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="number"
                                    name="garageId"
                                    value={form.garageId}
                                    onChange={handleChange}
                                    placeholder="Garage ID"
                                    className="px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none"
                                />

                                <input
                                    type="number"
                                    name="serviceId"
                                    value={form.serviceId}
                                    onChange={handleChange}
                                    placeholder="Service ID"
                                    className="px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Booking Date
                                </label>

                                <input
                                    type="date"
                                    name="bookingDate"
                                    value={form.bookingDate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none"
                                />
                            </div>

                            {form.bookingDate && form.garageId && (
                                <TimeSlotSelector
                                    date={form.bookingDate}
                                    garageId={Number(form.garageId)}
                                    selectedSlot={Number(form.timeSlot_Id) || 0}
                                    onSelectSlot={(slotId) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            timeSlot_Id: String(slotId),
                                        }))
                                    }
                                    token={token || ""}
                                    timeSlots={timeSlots}
                                />
                            )}

                            {!form.bookingDate || !form.garageId ? (
                                <input
                                    type="number"
                                    name="timeSlot_Id"
                                    value={form.timeSlot_Id}
                                    onChange={handleChange}
                                    placeholder="TimeSlot ID"
                                    className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none"
                                />
                            ) : null}

                            <textarea
                                name="note"
                                value={form.note}
                                onChange={handleChange}
                                placeholder="Notes..."
                                rows={3}
                                className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none resize-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={close}
                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all"
                    >
                        Create Appointment
                    </button>
                </div>
            </div>
        </div>
    );
}