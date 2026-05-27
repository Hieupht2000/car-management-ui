"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Car,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  User,
  Loader2,
  Send,
  Bell
} from "lucide-react";
import { authService } from "@/services/authService";
// Import service (uncomment khi sử dụng thật)
import { BookingDTO, bookingService } from "@/services/bookingService";
import React from "react";



export default function BookingPage() {
  const [bookings, setBookings] = useState<BookingDTO[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingDTO | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingDTO | null>(null);
  const [sendingEmail, setSendingEmail] = useState<number | null>(null);
  const [sendingEmailDealer, setSendingEmailDealer] = useState<number | null>(null);
  const [showDealerEmailModal, setShowDealerEmailModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [dealerEmail, setDealerEmail] = useState("");
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Thời gian slots mapping
  const timeSlots: Record<number, string> = {
    1: "08:00 - 10:00",
    2: "10:00 - 12:00",
    3: "13:00 - 15:00",
    4: "15:00 - 17:00"
  };

  // Load bookings khi component mount
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

      // Uncomment khi sử dụng API thật
      const data = await bookingService.getBookings(token!);

      // Mock data để demo
      //   const data: BookingDTO[] = [
      //     {
      //       booking_id: 1003,
      //       customerId: 1,
      //       fullName: "Nguyen Van A",
      //       carId: 1,
      //       licensePlate: "51H-0000",
      //       technicianId: 1,
      //       garageId: 1,
      //       bookingDate: "2025-08-11T06:33:51.163",
      //       timeSlot_Id: 1,
      //       status: "Confirmed",
      //       note: "thay nhớt"
      //     },
      //     {
      //       booking_id: 1004,
      //       customerId: 2,
      //       fullName: "Tran Thi B",
      //       carId: 2,
      //       licensePlate: "30A-12345",
      //       technicianId: 2,
      //       garageId: 1,
      //       bookingDate: "2025-08-12T08:00:00",
      //       timeSlot_Id: 2,
      //       status: "Pending",
      //       note: "Bảo dưỡng định kỳ"
      //     },
      //     {
      //       booking_id: 1005,
      //       customerId: 3,
      //       fullName: "Le Van C",
      //       carId: 3,
      //       licensePlate: "29B-67890",
      //       technicianId: 1,
      //       garageId: 1,
      //       bookingDate: "2025-08-10T14:30:00",
      //       timeSlot_Id: 3,
      //       status: "Completed",
      //       note: "Sửa chữa điều hòa"
      //     }
      //   ];

      setBookings(data);

    } catch (err: any) {
      console.error("Error loading bookings:", err);
      setError(err.message || "Can't load data booking");
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      //booking.LiensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.note.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === "all" || booking.status.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (bookingId: number) => {
    if (!confirm("Are sure you want delete booking?")) return;

    try {
      setLoading(true);

      // Uncomment khi sử dụng API thật
      await bookingService.deleteBooking(bookingId, token!);

      // Mock delete
      setBookings(prev => prev.filter(b => b.booking_id !== bookingId));
      alert("Xóa lịch hẹn thành công!");
    } catch (err: any) {
      console.error("Error deleting booking:", err);
      alert(err.message || "Delete failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (bookingData: BookingDTO) => {
    try {
      setLoading(true);

      // Uncomment khi sử dụng API thật
      const newBooking = await bookingService.createBooking(bookingData, token!);

      //Mock add
      const newBookings: BookingDTO = {
        ...bookingData,
        booking_id: Date.now(),
        status: "Pending"
      };

      setBookings(prev => [...prev, newBookings]);
      setShowModal(false);
      setEditingBooking(null);
      alert("Create Bookings Complete!");

      // Reload lại danh sách
      await loadBookings();
    } catch (err: any) {
      console.error("Error adding booking:", err);
      alert(err.message || "Create Failed!");
    } finally {
      setLoading(false);
    }
  };

  // const handleEdit = (booking: BookingDTO) => {
  //   setEditingBooking(booking);
  //   setShowModal(true);
  // };


  const handleStatusChange = async (bookingId: number, Newstatus: string, operatorTechnicianId: number) => {
    try {
      setLoading(true);

      // Uncomment khi sử dụng API thật
      await bookingService.updateBookingStatus(bookingId, Newstatus, token!, operatorTechnicianId);

      // Mock status update
      setBookings(prev => prev.map(b =>
        b.booking_id === bookingId ? { ...b, status: Newstatus, operatorTechnicianId: operatorTechnicianId } : b
      ));

      alert("Update Status Complete!");
    } catch (err: any) {
      console.error("Error updating status:", err);
      alert(err.message || "Update Status Failed!");
    } finally {
      setLoading(false);
      //setShowModal(true);
      //setStatusUpdate({status: Newstatus, note:"" });
    }
  };

  const handleSendEmailConfrimed = async (bookingId: number) => {
    if (!token) return;
    if (!confirm("Send confirmation email to the customer?")) return;

    try {
      await bookingService.sendEmaiConfrimed(bookingId, token);
      alert(`✅ Email sent for booking confrimed #${bookingId}`);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Send email failed!");
    }
  };

  const handleSendEmailToDealer = async (
    bookingId: number,
    dealerEmail: string
  ) => {
    if (!token) return;
    if (!dealerEmail) {
      alert("Dealer email is missing!");
      return;
    }

    if (!confirm("Send email to dealer?")) return;

    try {
      await bookingService.sendEmailDealer(
        bookingId,
        dealerEmail,
        "You have a new booking. Please check the system.",
        token
      );

      alert(`✅ Email sent to dealer for booking #${bookingId}`);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Send email to dealer failed!");
    }
  };



  const getStatusConfig = (status: string) => {
    const statusLower = status.toLowerCase();
    const configs: Record<string, any> = {
      pending: { label: "Pedding", color: "bg-yellow-100 text-yellow-700", icon: AlertCircle },
      confirmed: { label: "Comfrimed", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
      completed: { label: "Compeleted", color: "bg-green-100 text-green-700", icon: CheckCircle },

    };
    return configs[statusLower] || configs.pending;
  };

  const stats = [
    { label: "Bookings", value: bookings.length, color: "from-blue-500 to-cyan-500" },
    { label: "Pending", value: bookings.filter(b => b.status.toLowerCase() === "pending").length, color: "from-yellow-500 to-orange-500" },
    { label: "Confirmed", value: bookings.filter(b => b.status.toLowerCase() === "confirmed").length, color: "from-green-500 to-emerald-500" },
    { label: "Completed", value: bookings.filter(b => b.status.toLowerCase() === "completed").length, color: "from-purple-500 to-pink-500" }
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = "/auth/login"}
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Appointment Management
              </h1>
              <p className="text-gray-500 mt-1">Manage maintenance and repair appointments for vehicles</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {stats.map((stat, idx) => (
            <div key={idx} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white shadow-lg hover:scale-105 transition-transform`}>
              <p className="text-sm opacity-90 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Action Bar */}
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
                //setEditingBooking(null);
                setShowModal(true);
              }}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:scale-105 transition-all font-semibold whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              Create Appointment
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && bookings.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading data...</p>
            </div>
          </div>
        )}

        {/* Bookings Grid */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredBookings.map((booking) => {
              const statusConfig = getStatusConfig(booking.status);
              const StatusIcon = statusConfig.icon;
              const bookingDate = new Date(booking.bookingDate);

              return (
                <div key={booking.booking_id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 overflow-hidden">
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <Car className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-lg">{booking.licensePlate}</p>
                          <p className="text-sm text-blue-600">Car ID: {booking.carId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSendEmailConfrimed(booking.booking_id!)}
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                          title="Send confirmation email"
                        >
                          <Send className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => {
                            <button
                              onClick={() => {
                                const msg = `Reminder: You have an appointment on ${new Date(booking.bookingDate).toLocaleDateString("vi-VN")}`;
                                bookingService.sendEmailReminder(
                                  booking.booking_id!,
                                  msg,
                                  token!
                                );
                              }}
                              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
                              title="Send reminder email"
                            >
                            <Bell className="w-4 h-4 text-white" />
                          </button>

                            setSelectedBookingId(booking.booking_id!);
                            setDealerEmail(booking.dealerEmail || "");
                            setShowDealerEmailModal(true);
                          }}
                          className="p-2 bg-white/700 hover:bg-white/30 rounded-lg transition"
                          title="Send email to dealer"
                        >
                          <Send className="w-4 h-4 text-gray-700" />
                        </button>

                        <button
                          onClick={() => {
                            const msg = `Reminder: You have an appointment on ${new Date(booking.bookingDate).toLocaleDateString("vi-VN")}`;
                            bookingService.sendEmailReminder(
                              booking.booking_id!,
                              msg,
                              token!
                            );
                          }}
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
                          title="Send reminder email"
                        >
                          <Bell className="w-4 h-4 text-white" />
                        </button>

                      </div>
                      <select
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking.booking_id!, e.target.value, booking.technicianId)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color} bg-white cursor-pointer`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>

                      </select>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-600">Booking ID</span>
                      <span className="font-bold text-gray-900">#{booking.booking_id}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-700">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold">{booking.fullName}</span>
                        <span className="text-sm text-gray-500">(ID: {booking.customerId})</span>
                      </div>
                    </div>

                    {booking.note && (
                      <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-sm text-gray-700">{booking.note}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <Calendar className="w-4 h-4" />
                          <span className="text-xs font-medium">Booking Date</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          {bookingDate.toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs font-medium">Time Slot</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          {timeSlots[booking.timeSlot_Id] || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 text-xs text-gray-500">
                      <span>Technician: {booking.technicianId}</span>
                      <span>•</span>
                      <span>Garage: {booking.garageId}</span>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      {/* <button
                        onClick={() => handleEdit(booking)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors font-medium"
                      > */}
                      {/* <Edit2 className="w-4 h-4" />
                        Edit
                      </button> */}
                      <button
                        onClick={() => handleDelete(booking.booking_id!)}
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
        )
        }

        {!loading && filteredBookings.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <Calendar className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <p className="text-xl font-semibold text-gray-600">No appointments found</p>
            <p className="text-gray-400 mt-2">Try changing the filter or search</p>
          </div>
        )}
      </div>

      {/* Add/Edit Booking Modal */}
      {
        showModal && (
          <BookingModal
            close={() => {
              setShowModal(false);
              setEditingBooking(null);
            }}
            submit={handleAdd}
            booking={editingBooking}
            timeSlots={timeSlots}
            onSendEmail={handleSendEmailConfrimed}
            sendingEmail={sendingEmail}

          />

        )
      }
      {showDealerEmailModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-700">Send Email To Dealer</h3>

            <input
              type="email"
              value={dealerEmail}
              onChange={(e) => setDealerEmail(e.target.value)}
              placeholder="dealer@example.com"
              className="w-full px-4 py-3 text-gray-700 rounded-xl mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowDealerEmailModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 rounded-xl"
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
                className="flex-1 px-4 py-2 bg-blue-600 text-gray-700 rounded-xl"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

    </div >
  );
}

function BookingModal({
  close,
  submit,
  booking,
  timeSlots,
  onSendEmail,
  sendingEmail,
}: {
  close: () => void;
  submit: (data: BookingDTO) => void;
  booking?: BookingDTO | null;
  timeSlots: Record<number, string>;
  onSendEmail: (bookingId: number) => Promise<void>;
  sendingEmail: number | null;

}) {

  const [form, setForm] = useState<BookingDTO>({
    booking_id: booking?.booking_id || 0,
    customerId: booking?.customerId || 0,
    fullName: booking?.fullName || "",
    email: booking?.email || "",
    carId: booking?.carId || 0,
    licensePlate: booking?.licensePlate || "",
    technicianId: booking?.technicianId || 1,
    technicianName: booking?.technicianName || "",
    garageId: booking?.garageId || 1,
    bookingDate: booking?.bookingDate ? booking.bookingDate.split('T')[0] : "",
    timeSlot_Id: booking?.timeSlot_Id || 1,
    status: booking?.status || "Pending",
    note: booking?.note || "",
    emailBody: booking?.emailBody || "",
    dealerEmail: booking?.email || "",
    serviceName: booking?.serviceName || "",


  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name.includes('Id') || name === 'timeSlot_Id' ? parseInt(value) || 0 : value });
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
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {booking ? "Edit Appointment" : "Create New Appointment"}
              </h2>
            </div>
            <button onClick={close} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Information Customer & Car</h3>
            <div className="grid grid-cols-2 gap-4">
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="User@example.com" className="px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none" />
              <input type="number" name="customerId" value={form.customerId} onChange={handleChange} placeholder="Customer ID" className="px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none" />
              <input type="text" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Full Name *" className="px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none" />
              <input type="number" name="carId" value={form.carId} onChange={handleChange} placeholder="Car ID" className="px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none" />
              <input type="text" name="LiensePlate" value={form.licensePlate} onChange={handleChange} placeholder="License Plate *" className="px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="number" name="technicianId" value={form.technicianId} onChange={handleChange} placeholder="Technician ID" className="px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none" />
                <input type="text" name="technicianName" value={form.technicianName} onChange={handleChange} placeholder="Technicianname" className="px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none" />
                <input type="number" name="garageId" value={form.garageId} onChange={handleChange} placeholder="Garage ID" className="px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="date" name="bookingDate" value={form.bookingDate} onChange={handleChange} className="px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none" />
                <select name="timeSlot_Id" value={form.timeSlot_Id} onChange={handleChange} className="px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none">
                  {Object.entries(timeSlots).map(([id, time]) => (
                    <option key={id} value={id}>{time}</option>
                  ))}
                </select>
              </div>
              <select name="status" value={form.status} onChange={handleChange} className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none">
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
              </select>
              <textarea name="note" value={form.note} onChange={handleChange} placeholder="Notes..." rows={3} className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none resize-none" />
              <textarea name="emailBody" value={form.emailBody} onChange={handleChange} placeholder="email body.." rows={3} className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none resize-none" />
              <input type="dealeremail" name="dealeremail" value={form.dealerEmail} onChange={handleChange} placeholder="User@example.com" className="px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none" />
              <input type="text" name="serviceName" value={form.serviceName} onChange={handleChange} placeholder="Please choose your service" className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 outline-none resize-none" />
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={close} className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all">
            {booking ? "Update" : "Create Appointment"}
          </button>
        </div>
      </div>
    </div >
  );
}


