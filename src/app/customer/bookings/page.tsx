/**
 * Customer Bookings Page
 * Allows customers to manage their own service appointments
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

export default function CustomerBookingPage() {
    const { t } = useTranslation('booking');
    const [bookings, setBookings] = useState<BookingDTO[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<BookingDTO | null>(null);
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
            setError(err.message || "Failed to load bookings");
        } finally {
            setLoading(false);
        }
    };

    const filteredBookings = bookings.filter(booking =>
        booking.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.note.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (bookingId: number) => {
        if (!confirm("Cancel this booking?")) return;

        try {
            setLoading(true);
            await bookingService.deleteBooking(bookingId, token!);
            setBookings(prev => prev.filter(b => b.booking_id !== bookingId));
            alert("Booking cancelled successfully!");
        } catch (err: any) {
            console.error("Error cancelling booking:", err);
            alert(err.message || "Cancel failed!");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (bookingData: BookingDTO) => {
        try {
            setLoading(true);
            const newBooking = await bookingService.createBooking(bookingData, token!);
            setBookings(prev => [...prev, newBooking]);
            setShowModal(false);
            alert("Booking created successfully!");
            await loadBookings();
        } catch (err: any) {
            console.error("Error creating booking:", err);
            alert(err.message || "Creation failed!");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading bookings...</p>
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
                            <Calendar className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                My Appointments
                            </h1>
                            <p className="text-gray-500 mt-1">Schedule and manage your service bookings</p>
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

                {/* Action Bar */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative flex-1 w-full md:max-w-md">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by car or service..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:scale-105 transition-all font-semibold"
                        >
                            <Plus className="w-5 h-5" />
                            Book Service
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Total Bookings</p>
                                <p className="text-3xl font-bold mt-2">{bookings.length}</p>
                            </div>
                            <Calendar className="w-8 h-8 opacity-40" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-100 text-sm font-medium">Upcoming</p>
                                <p className="text-3xl font-bold mt-2">{bookings.filter(b => b.status !== "Completed").length}</p>
                            </div>
                            <Clock className="w-8 h-8 opacity-40" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Completed</p>
                                <p className="text-3xl font-bold mt-2">{bookings.filter(b => b.status === "Completed").length}</p>
                            </div>
                            <Car className="w-8 h-8 opacity-40" />
                        </div>
                    </div>
                </div>

                {/* Bookings List */}
                <div className="space-y-4">
                    {filteredBookings.length > 0 ? (
                        filteredBookings.map((booking) => (
                            <div key={booking.booking_id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{booking.licensePlate}</h3>
                                        <p className="text-sm text-gray-600">{new Date(booking.bookingDate).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        booking.status === "Completed" ? "bg-green-100 text-green-700" :
                                        booking.status === "Confirmed" ? "bg-blue-100 text-blue-700" :
                                        "bg-yellow-100 text-yellow-700"
                                    }`}>
                                        {booking.status}
                                    </span>
                                </div>

                                <p className="text-gray-700 mb-4">{booking.note}</p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setSelectedBooking(booking);
                                            setShowDetailModal(true);
                                        }}
                                        className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                                    >
                                        View Details
                                    </button>
                                    {booking.status !== "Completed" && (
                                        <button
                                            onClick={() => handleDelete(booking.booking_id!)}
                                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20 text-gray-400" />
                            <p className="text-lg font-medium text-gray-500">No bookings yet</p>
                            <p className="text-sm text-gray-400 mt-2">Click "Book Service" to schedule an appointment</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Booking Modal */}
            {showModal && (
                <BookingModal
                    close={() => setShowModal(false)}
                    submit={handleAdd}
                    timeSlots={timeSlots}
                />
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedBooking && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">License Plate</p>
                                    <p className="text-lg font-semibold text-gray-900">{selectedBooking.licensePlate}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Date</p>
                                    <p className="text-lg font-semibold text-gray-900">{new Date(selectedBooking.bookingDate).toLocaleDateString('vi-VN')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Time Slot</p>
                                    <p className="text-lg font-semibold text-gray-900">{timeSlots[selectedBooking.timeSlot_Id] || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    <p className="text-lg font-semibold text-gray-900">{selectedBooking.status}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600">Service Description</p>
                                <p className="text-gray-900">{selectedBooking.note}</p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                            >
                                Close
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
    submit: (data: BookingDTO) => void;
    timeSlots: Record<number, string>;
}) {
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
        setForm({ ...form, [name]: name.includes('Id') || name === 'timeSlot_Id' ? parseInt(value) || 0 : value });
    };

    const handleSubmit = () => {
        if (!form.licensePlate || !form.bookingDate) {
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
                        <h2 className="text-2xl font-bold text-white">Book Service</h2>
                        <button onClick={close} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                            <X className="w-6 h-6 text-white" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Vehicle Information</h3>
                        <div className="space-y-4">
                            <input type="text" name="licensePlate" value={form.licensePlate} onChange={handleChange} placeholder="License Plate *" className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none" />
                            <input type="date" name="bookingDate" value={form.bookingDate} onChange={handleChange} className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none" />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Service Details</h3>
                        <textarea name="note" value={form.note} onChange={handleChange} placeholder="Describe the service you need..." rows={4} className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none resize-none" />
                    </div>
                </div>

                <div className="px-6 pb-6 flex gap-3">
                    <button onClick={close} className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all">
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    );
}
