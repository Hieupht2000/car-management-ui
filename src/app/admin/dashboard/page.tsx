/**
 * Admin Dashboard Page Component
 * Displays admin-specific metrics and management options
 * Requires admin role authentication
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { bookingService } from "@/services/bookingService";
import { carService } from "@/services/carService";
import { jwtDecode } from "jwt-decode";
import { Activity, Bell, User, LogOut, TrendingUp, Car, ChevronRight, Calendar, FileText, Clock, CardSim, Globe, BarChart3, Users, DollarSign,Wrench } from "lucide-react";
import { useTranslation } from "@/src/hooks/useTranslation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7249/api";

export interface TokenData {
  userId: string;
  sub: string; // email
  jti: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
  exp: number; // UNIX timestamp
  iss: string;
  aud: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { t, language, changeLanguage, availableLanguages } = useTranslation('dashboard');
  
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<TokenData | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [recentCars, setRecentCars] = useState<any[]>([]);
  const [loadingCars, setLoadingCars] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const savedToken = authService.getToken();
      if (!savedToken) {
        router.push("/auth/login");
        return;
      }

      try {
         const decoded = jwtDecode<TokenData>(savedToken);
         const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
         console.log("Token decoded:", decoded);
         console.log("User role:", role);
         
         // Check if user is admin (case-insensitive)
         if (role?.trim().toLowerCase() !== "admin") {
           console.warn("Non-admin user attempted to access admin dashboard. Role:", role, "Redirecting...");
           router.push("/admin/dashboard");
           return;
         }

         // User is admin, proceed
         setToken(savedToken);
         setUser(decoded);
       } catch (error) {
         console.error("Error validating token:", error);
         router.push("/auth/login");
       }
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

const getTotalBookingsFromStats = (stats: any): number => {
  if (!stats) return 0;
  if (Array.isArray(stats)) {
    return stats.reduce(
      (sum: number, item: any) =>
        sum + (Number(item.count ?? item.total ?? item.bookings ?? 0) || 0),
      0
    );
  }
  if (typeof stats === "object") {
    return Number(stats.count ?? stats.total ?? stats.bookings ?? 0) || 0;
  }
  return 0;
};

const sumBookings = (data: any[]) => {
  return (data || []).reduce((sum, item) => {
    return sum + Number(item.totalBookings ?? item.TotalBookings ?? 0);
  }, 0);
};

 const fetchSummary = async (token: string): Promise<void> => {
  try {
    const [bookings, cars, dailyRes, weeklyRes, monthlyRes] = await Promise.all([
      bookingService.getBookings(token),
      carService.getCars(token),
      fetch(`${API_URL}/Statistics/daily`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }),
      fetch(`${API_URL}/Statistics/weekly`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }),
      fetch(`${API_URL}/Statistics/monthly`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }),
    ]);

    const dailyData = dailyRes.ok ? await dailyRes.json() : [];
    const weeklyData = weeklyRes.ok ? await weeklyRes.json() : [];
    const monthlyData = monthlyRes.ok ? await monthlyRes.json() : [];

    const totalCustomers = new Set(
      (bookings || [])
        .map((b: any) => b.customerId ?? b.customer_id)
        .filter(Boolean)
    ).size;

    setDashboardData({
      totalCars: cars?.length || 0,
      totalBookings: bookings?.length || 0,
      totalCustomers,
      todayBookings: sumBookings(dailyData),
      weeklyBookings: sumBookings(weeklyData),
      monthlyBookings: sumBookings(monthlyData),
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);

    setDashboardData({
      totalCars: 0,
      totalBookings: 0,
      totalCustomers: 0,
      todayBookings: 0,
      weeklyBookings: 0,
      monthlyBookings: 0,
    });
  }
};

 const timeSlots: Record<number, string> = {
  1: "08:00 - 10:00",
  2: "10:00 - 12:00",
  3: "13:00 - 15:00",
  4: "15:00 - 17:00",
};

const fetchAppointments = async (token: string): Promise<void> => {
  setLoadingAppointments(true);

  try {
    const bookings = await bookingService.getBookings(token);

    const formatted = (bookings || [])
      .sort((a: any, b: any) => {
        return new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime();
      })
      .map((booking: any) => ({
        date: booking.bookingDate
          ? new Date(booking.bookingDate).toLocaleDateString("vi-VN")
          : "N/A",
        time: timeSlots[booking.timeSlot_Id ?? booking.timeSlotId] || "N/A",
        service: booking.serviceName || booking.note || "Booking service",
        car: booking.licensePlate || booking.license_plate || "N/A",
        status: booking.status || "pending",
        bookingId: booking.booking_id ?? booking.bookingId,
      }));

    setUpcomingAppointments(formatted.slice(0, 5));
  } catch (error) {
    console.error("Error fetching appointments:", error);
    setUpcomingAppointments([]);
  } finally {
    setLoadingAppointments(false);
  }
};

  const fetchCars = async (token: string): Promise<void> => {
    setLoadingCars(true);
    try {
      const cars = await carService.getCars(token);
      const formatted = (cars || []).map((car: any) => ({
        plate: car.licensePlate || "N/A",
        brand: car.brand || "N/A",
        model: car.model || "N/A",
        year: car.year || "N/A",
        status: "Active",
      }));
      setRecentCars(formatted.slice(0, 3));
    } catch (error) {
      setRecentCars([]);
    } finally {
      setLoadingCars(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSummary(token);
      fetchAppointments(token);
      fetchCars(token);
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

 const stats = [
  {
    label: "Cars",
    value: dashboardData?.totalCars || 0,
    icon: Car,
    color: "from-blue-500 to-cyan-500",
    change: "Total vehicles",
  },
  {
    label: "Bookings",
    value: dashboardData?.totalBookings || 0,
    icon: Calendar,
    color: "from-purple-500 to-pink-500",
    change: "Total bookings",
  },
  {
    label: "Weekly",
    value: dashboardData?.weeklyBookings || 0,
    icon: Clock,
    color: "from-green-500 to-emerald-500",
    change: "Bookings this week",
  },
  {
    label: "Monthly",
    value: dashboardData?.monthlyBookings || 0,
    icon: TrendingUp,
    color: "from-orange-500 to-red-500",
    change: "Bookings this month",
  },
];
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Top Navigation Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo and Title */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500">System Management & Analytics</p>
              </div>
            </div>

            {/* Right: Language Switch, Notifications, User Info, and Logout */}
            <div className="flex items-center gap-4">
              {/* Language Switcher */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-xl">
                <Globe className="w-4 h-4 text-gray-600" />
                <select 
                  value={language}
                  onChange={(e) => changeLanguage(e.target.value as 'en' | 'vi')}
                  className="bg-transparent text-sm font-medium text-gray-700 cursor-pointer focus:outline-none"
                >
                  <option value="en">English</option>
                  <option value="vi">Tiếng Việt</option>
                </select>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.sub?.[0]?.toUpperCase() || "A"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{user?.sub}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 hover:shadow-lg transition-all font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 group hover:scale-105"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.change}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Admin Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all cursor-pointer group hover:scale-105"
            onClick={() => router.push("/admin/cars")}
          >
            <div className="flex items-center justify-between mb-4">
              <Car className="w-10 h-10 opacity-80 group-hover:scale-110 transition-transform" />
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-xl font-bold mb-2">Car Management</h3>
            <p className="text-blue-100 text-sm">Manage all vehicles in system</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all cursor-pointer group hover:scale-105"
            onClick={() => router.push("/admin/bookings")}
          >
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-10 h-10 opacity-80 group-hover:scale-110 transition-transform" />
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-xl font-bold mb-2">All Bookings</h3>
            <p className="text-purple-100 text-sm">View all repair appointments</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all cursor-pointer group hover:scale-105"
            onClick={() => router.push("/admin/customers")}
          >
            <div className="flex items-center justify-between mb-4">
              <User className="w-10 h-10 opacity-80 group-hover:scale-110 transition-transform" />
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-xl font-bold mb-2">Customers</h3>
            <p className="text-green-100 text-sm">Manage customer accounts</p>
          </div>

          <div 
            className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all cursor-pointer group hover:scale-105"
            onClick={() => router.push("/admin/timeslots")}
          >
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-10 h-10 opacity-80 group-hover:scale-110 transition-transform" />
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-xl font-bold mb-2">TimeSlots</h3>
            <p className="text-orange-100 text-sm">Configure appointment slots</p>
          </div>

          <div 
            className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all cursor-pointer group hover:scale-105"
            onClick={() => router.push("/admin/technical")}
          >
            <div className="flex items-center justify-between mb-4">
              <User className="w-10 h-10 opacity-80 group-hover:scale-110 transition-transform" />
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-xl font-bold mb-2">Technical Staff</h3>
            <p className="text-cyan-100 text-sm">Manage technicians</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all cursor-pointer group hover:scale-105"
            onClick={() => router.push("/admin/invoices")}
          >
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-10 h-10 opacity-80 group-hover:scale-110 transition-transform" />
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-xl font-bold mb-2">Invoices</h3>
            <p className="text-green-100 text-sm">Manage all invoices</p>
          </div>

          <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all cursor-pointer group hover:scale-105"
            onClick={() => router.push("/admin/garages")}
          >
            <div className="flex items-center justify-between mb-4">
              <Car className="w-10 h-10 opacity-80 group-hover:scale-110 transition-transform" />
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-xl font-bold mb-2">Garages</h3>
            <p className="text-slate-200 text-sm">Manage garage locations</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all cursor-pointer group hover:scale-105"
            onClick={() => router.push("/admin/servicess")}
          >
            <div className="flex items-center justify-between mb-4">
              <Wrench className="w-10 h-10 opacity-80 group-hover:scale-110 transition-transform" />
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-xl font-bold mb-2">Services</h3>
            <p className="text-red-100 text-sm">Manage services & pricing</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all cursor-pointer group hover:scale-105"
            onClick={() => router.push("/admin/users")}
          >
            <div className="flex items-center justify-between mb-4">
              <Users className="w-10 h-10 opacity-80 group-hover:scale-110 transition-transform" />
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-xl font-bold mb-2">User Management</h3>
            <p className="text-indigo-100 text-sm">Manage system users and roles</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Cars */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recently Added Cars</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                onClick={() => router.push("/admin/cars")}
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              {loadingCars ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading cars...</p>
                </div>
              ) : recentCars.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Plate</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Brand</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Model</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Year</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCars.map((car, idx) => (
                      <tr key={idx} className="border-b border-gray-50 hover:bg-blue-50/50 transition-colors">
                        <td className="py-4 px-4 font-semibold text-gray-900">{car.plate}</td>
                        <td className="py-4 px-4 text-gray-700">{car.brand}</td>
                        <td className="py-4 px-4 text-gray-700">{car.model}</td>
                        <td className="py-4 px-4 text-gray-700">{car.year}</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${car.status === "Completed" ? "bg-green-100 text-green-700" :
                            car.status === "Under Maintenance" ? "bg-blue-100 text-blue-700" :
                              "bg-yellow-100 text-yellow-700"
                            }`}>
                            {car.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No cars found</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Bookings</h2>
            <div className="space-y-4">
              {loadingAppointments ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading appointments...</p>
                </div>
              ) : upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((apt, idx) => (
                  <div key={idx} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-all">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-gray-900">{apt.time}</span>
                          <span className="text-xs text-gray-500">• {apt.date}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 mb-1">{apt.service}</p>
                        <p className="text-xs text-gray-600">{apt.car}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No upcoming appointments</p>
                </div>
              )}
            </div>
            <button className="w-full mt-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              onClick={() => router.push("/admin/bookings")}
            >
              View All Bookings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

