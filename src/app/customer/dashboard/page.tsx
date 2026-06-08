/**
 * Customer Dashboard Page Component
 * Displays customer-specific information and actions
 * Only accessible to customer role users
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { bookingService } from "@/services/bookingService";
import { carService } from "@/services/carService";
import { jwtDecode } from "jwt-decode";
import { Home, Bell, User, LogOut, TrendingUp, Car, ChevronRight, Calendar, FileText, Clock, Globe } from "lucide-react";
import { useTranslation } from "@/src/hooks/useTranslation";

export interface TokenData {
  userId: string;
  sub: string; // email
  jti: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
  exp: number; // UNIX timestamp
  iss: string;
  aud: string;
}

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { t, language, changeLanguage, availableLanguages } = useTranslation('dashboard');
  
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<TokenData | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [myCars, setMyCars] = useState<any[]>([]);
  const [loadingCars, setLoadingCars] = useState(false);

  useEffect(() => {
    const savedToken = authService.getToken();
    if (!savedToken) {
      router.push("/auth/login");
    } else {
      try {
        setToken(savedToken);
        const decoded = jwtDecode<TokenData>(savedToken);
        setUser(decoded);
        
        // Check if user is admin - redirect to admin dashboard
        const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        if (role?.trim().toLowerCase() === "admin") {
          router.push("/admin/dashboard");
          return;
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        router.push("/auth/login");
      }
    }
  }, [router]);

  const fetchDashboardData = async (token: string): Promise<void> => {
    try {
      const response = await fetch("https://localhost:7249/api/Dashboard/summary", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to load dashboard data: ${response.status}`);
      }
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setDashboardData(null);
    }
  };

  const fetchAppointments = async (token: string): Promise<void> => {
    setLoadingAppointments(true);
    try {
      const bookings = await bookingService.getBookings(token);
      const formatted = (bookings || []).map((booking: any) => ({
        date: booking.bookingDate || booking.booking_date || "N/A",
        service: booking.note || "N/A",
        car: booking.licensePlate || booking.license_plate || "N/A",
        status: booking.status,
        bookingId: booking.booking_id,
      }));
      setUpcomingAppointments(formatted.slice(0, 3));
    } catch (error) {
      setUpcomingAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const fetchMyCars = async (token: string): Promise<void> => {
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
      setMyCars(formatted);
    } catch (error) {
      setMyCars([]);
    } finally {
      setLoadingCars(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData(token);
      fetchAppointments(token);
      fetchMyCars(token);
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  const stats = [
    { label: "My Cars", value: myCars.length || "0", icon: Car, color: "from-blue-500 to-cyan-500", change: `Vehicles` },
    { label: "Bookings", value: upcomingAppointments.length || "0", icon: Calendar, color: "from-purple-500 to-pink-500", change: `Appointments` },
    { label: "Total Spent", value: dashboardData?.totalRevenue ? `$${dashboardData.totalRevenue}` : "$0", icon: FileText, color: "from-green-500 to-emerald-500", change: `Amount` },
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
                <Home className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  My Dashboard
                </h1>
                <p className="text-sm text-gray-500">{t('welcomeBack')}</p>
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

              {/* Notification Bell */}
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Info */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.sub?.[0]?.toUpperCase() || "C"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{user?.sub}</p>
                  <p className="text-xs text-gray-500">Customer</p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 hover:shadow-lg transition-all font-medium"
              >
                <LogOut className="w-4 h-4" />
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

        {/* Customer Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all cursor-pointer group hover:scale-105"
            onClick={() => router.push("/customer/cars")}
          >
            <div className="flex items-center justify-between mb-4">
              <Car className="w-10 h-10 opacity-80 group-hover:scale-110 transition-transform" />
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-xl font-bold mb-2">My Vehicles</h3>
            <p className="text-blue-100 text-sm">View and manage your cars</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all cursor-pointer group hover:scale-105"
            onClick={() => router.push("/customer/bookings")}
          >
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-10 h-10 opacity-80 group-hover:scale-110 transition-transform" />
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-xl font-bold mb-2">Book Service</h3>
            <p className="text-purple-100 text-sm">Schedule maintenance appointments</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all cursor-pointer group hover:scale-105"
            onClick={() => router.push("/customer/invoices")}
          >
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-10 h-10 opacity-80 group-hover:scale-110 transition-transform" />
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-xl font-bold mb-2">My Invoices</h3>
            <p className="text-green-100 text-sm">View payment history</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Cars */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">My Vehicles</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                onClick={() => router.push("/customer/cars")}
              >
                Manage Cars
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              {loadingCars ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading cars...</p>
                </div>
              ) : myCars.length > 0 ? (
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
                    {myCars.map((car, idx) => (
                      <tr key={idx} className="border-b border-gray-50 hover:bg-blue-50/50 transition-colors">
                        <td className="py-4 px-4 font-semibold text-gray-900">{car.plate}</td>
                        <td className="py-4 px-4 text-gray-700">{car.brand}</td>
                        <td className="py-4 px-4 text-gray-700">{car.model}</td>
                        <td className="py-4 px-4 text-gray-700">{car.year}</td>
                        <td className="py-4 px-4">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            {car.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No cars registered yet</p>
                </div>
              )}
            </div>
          </div>

          {/* My Appointments */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Appointments</h2>
            <div className="space-y-4">
              {loadingAppointments ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading...</p>
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
                          <span className="text-xs text-gray-500">{apt.date}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 mb-1">{apt.service}</p>
                        <p className="text-xs text-gray-600">{apt.car}</p>
                        <span className="text-xs font-medium text-blue-600 mt-2 inline-block">{apt.status}</span>
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
              onClick={() => router.push("/customer/bookings")}
            >
              View All Appointments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
