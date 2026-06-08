/**
 * Customer Booking Page
 * Allows customers to:
 * - View their own bookings
 * - Create new bookings
 * - Cancel their bookings
 */
"use client";

import { useState, useEffect } from "react";
import {
    Calendar,
    Clock,
    Car,
    Plus,
    Search,
    Trash2,
    X,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { BookingDTO, bookingService } from "@/services/bookingService";
import { useTranslation } from "@/src/hooks/useTranslation";
import TimeSlotSelector from "@/src/components/TimeSlotSelector";
import React from "react";

export default function CustomerBookingPage() {
    const { t } = useTranslation('booking');
    const [bookings, setBookings] = useState<BookingDTO[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const timeSlots: Record<number, string> = {
        1: "08:00 - 10:00",
        2: "10:00 - 12:00",
        3: "13:00 - 15:00",
        4: "15:00 - 17:00"
    };

    useEffect(() => {
        if (!token) {
            setError("Please Login!");
            setLoading(false);
            return;
        }
        loadBookings();
    }, [token]);

    const loadBookings = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await bookingService.getBookings(token!);
            setBookings(data);
        } catch (err: any) {
            console.error("Error loading bookings:", err);
            setError(err.message || "Can't load bookings");
        } finally {
            setLoading(false);
        }
    };

    const filteredBookings = bookings.filter(booking => {
        return booking.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               booking.note?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleDelete = async (bookingId: number) => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;

        try {
            setLoading(true);
            await bookingService.deleteBooking(bookingId, token!);
            setBookings(prev => prev.filter(b => b.booking_id !== bookingId));
            alert("Booking cancelled successfully!");
        } catch (err: any) {
            console.error("Error cancelling booking:", err);
            alert(err.message || "Failed to cancel booking");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (bookingData: BookingDTO) => {
        try {
            setLoading(true);
            await bookingService.createBooking(bookingData, token!);
            setShowModal(false);
            alert("Booking created successfully!");
            await loadBookings();
        } catch (err: any) {
            console.error("Error creating booking:", err);
            alert(err.message || "Failed to create booking");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const statusLower = status.toLowerCase();
        switch (statusLower) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-700';
            case 'confirmed':
                return 'bg-blue-100 text-blue-700';
            case 'completed':
                return 'bg-green-100 text-green-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.href = "/auth/login"}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                    >
                        Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                            <Calendar className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                My Bookings
                            </h1>
                            <p className="text-gray-500 mt-1">View and manage your service appointments</p>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative flex-1 max-w-md w-full">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name or note..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-600 outline-none"
                            />
                        </div>

                        <button
                            onClick={() => setShowModal(true)}
                            disabled={loading}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all font-semibold whitespace-nowrap"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                            New Booking
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {loading && bookings.length === 0 && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    </div>
                )}

                {/* Bookings List */}
                {!loading && (
                    <div className="space-y-4">
                        {filteredBookings.length > 0 ? (
                            filteredBookings.map((booking) => (
                                <div key={booking.booking_id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-100">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <Car className="w-5 h-5 text-blue-600" />
                                                <span className="font-bold text-lg text-gray-900">{booking.licensePlate}</span>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                            <div className="space-y-2 text-gray-700">
                                                <p><span className="font-semibold">Name:</span> {booking.fullName}</p>
                                                <p><span className="font-semibold">Car ID:</span> {booking.carId}</p>
                                                <p><span className="font-semibold">Booking ID:</span> #{booking.booking_id}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                                                        <Calendar className="w-4 h-4" />
                                                        <span className="text-xs font-medium">Date</span>
                                                    </div>
                                                    <p className="font-bold text-gray-900">
                                                        {new Date(booking.bookingDate).toLocaleDateString('vi-VN')}
                                                    </p>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                                                        <Clock className="w-4 h-4" />
                                                        <span className="text-xs font-medium">Time</span>
                                                    </div>
                                                    <p className="font-bold text-gray-900">
                                                        {timeSlots[booking.timeSlot_Id]}
                                                    </p>
                                                </div>
                                            </div>

                                            {booking.note && (
                                                <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                                                    <span className="font-semibold">Note:</span> {booking.note}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4 flex gap-2 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => handleDelete(booking.booking_id!)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Cancel Booking
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                                <Calendar className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                                <p className="text-xl font-semibold text-gray-600">No bookings found</p>
                                <p className="text-gray-400 mt-2">Create your first booking to get started</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Booking Modal */}
                {showModal && (
                    <CustomerBookingModal
                        close={() => setShowModal(false)}
                        submit={handleAdd}
                        timeSlots={timeSlots}
                        token={token}
                    />
                )}
            </div>
        </div>
    );
}

interface CustomerBookingModalProps {
    close: () => void;
    submit: (data: BookingDTO) => void;
    timeSlots: Record<number, string>;
    token: string | null;
}

function CustomerBookingModal({ close, submit, timeSlots, token }: CustomerBookingModalProps) {
    const [form, setForm] = useState<BookingDTO>({
        booking_id: 0,
        customerId: 0,
        fullName: "",
        email: "",
        carId: 0,
        licensePlate: "",
        technicianId: 1,
        technicianName: "",
        garageId: 1,
        bookingDate: "",
        timeSlot_Id: 1,
        status: "Pending",
        note: "",
        emailBody: "",
        dealerEmail: "",
        serviceName: "",
    });

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]: name.includes('Id') || name === 'timeSlot_Id' ? parseInt(value) || 0 : value
        });
    };

    const handleSubmit = () => {
        if (!form.fullName || !form.licensePlate || !form.bookingDate) {
            alert("Please fill in all required fields!");
            return;
        }

        const submitData: BookingDTO = {
            ...form,
            bookingDate: new Date(form.bookingDate).toISOString()
        };

        submit(submitData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-t-3xl sticky top-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">Create New Booking</h2>
                        <button onClick={close} className="p-2 hover:bg-white/20 rounded-lg">
                            <X className="w-6 h-6 text-white" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Your Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Email *"
                                className="px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none"
                            />
                            <input
                                type="number"
                                name="customerId"
                                value={form.customerId}
                                onChange={handleChange}
                                placeholder="Customer ID"
                                className="px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none"
                            />
                            <input
                                type="text"
                                name="fullName"
                                value={form.fullName}
                                onChange={handleChange}
                                placeholder="Full Name *"
                                className="col-span-2 px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Vehicle Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="number"
                                name="carId"
                                value={form.carId}
                                onChange={handleChange}
                                placeholder="Car ID"
                                className="px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none"
                            />
                            <input
                                type="text"
                                name="licensePlate"
                                value={form.licensePlate}
                                onChange={handleChange}
                                placeholder="License Plate *"
                                className="px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Garage ID</label>
                                <input
                                    type="number"
                                    name="garageId"
                                    value={form.garageId}
                                    onChange={handleChange}
                                    placeholder="Garage ID"
                                    className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Booking Date</label>
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
                                    garageId={form.garageId}
                                    selectedSlot={form.timeSlot_Id}
                                    onSelectSlot={(slotId) => setForm({ ...form, timeSlot_Id: slotId })}
                                    token={token || ""}
                                    timeSlots={timeSlots}
                                />
                            )}

                            <textarea
                                name="note"
                                value={form.note}
                                onChange={handleChange}
                                placeholder="Additional notes or service requests..."
                                rows={3}
                                className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none resize-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={close}
                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-xl"
                    >
                        Create Booking
                    </button>
                </div>
            </div>
        </div>
    );
}
