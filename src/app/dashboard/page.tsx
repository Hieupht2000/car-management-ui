"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { jwtDecode } from "jwt-decode";
import { Activity, Bell, User, LogOut, TrendingUp, Car, ChevronRight, Calendar, FileText, Clock, CardSim } from "lucide-react";
import GaragePage from "../garages/page";

export interface TokenData {
  userId: string;
  sub: string; // email
  jti: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
  exp: number; // UNIX timestamp
  iss: string;
  aud: string;
}

function parseJwt(token: string): TokenData | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error parsing JWT:", error);
    return null;
  }
}


export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<TokenData | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const recentCars = [
    { plate: "29A-12345", brand: "Toyota", model: "Camry", year: 2023, status: "Completed" },
    { plate: "30B-67890", brand: "Honda", model: "Accord", year: 2022, status: "Under Maintenance" },
    { plate: "31C-11111", brand: "Hyundai", model: "Elantra", year: 2023, status: "Pending" },
  ];

  const upcomingAppointments = [
    { time: "09:00 AM", date: "Hôm nay", service: "Bảo dưỡng định kỳ", car: "Toyota Camry" },
    { time: "02:00 PM", date: "Hôm nay", service: "Thay dầu nhớt", car: "Honda Accord" },
    { time: "10:00 AM", date: "Ngày mai", service: "Kiểm tra phanh", car: "Hyundai Elantra" },
  ];

  useEffect(() => {
    const savedToken = authService.getToken();
    if (!savedToken) {
      router.push("/auth/login");
    } else {
      setToken(savedToken);
      const decoded = jwtDecode<TokenData>(savedToken);
      setUser(decoded);
    }
  }, [router]);

  const fetchDashboardData = async (token: string) => {
    try {
      const carresponse = await fetch("https://localhost:7249/api/CarMangetment", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!carresponse.ok) {
        throw new Error("Failed to load dashboard data");
      }
      const data = await carresponse.json();
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData(token);
    }
  }, [token]);


  const handleLogout = () => {
    localStorage.getItem("token");
    router.push("/auth/login");
  };

  const stats = dashboardData ? [
    { label: "Cars", value: dashboardData.totalCars || "0", icon: Car, color: "from-blue-500 to-cyan-500", change: `+${dashboardData.newCarsThisMonth || 0} Month` },
    { label: "Date Bookings", value: dashboardData.totalAppointments || "0", icon: Calendar, color: "from-purple-500 to-pink-500", change: `${dashboardData.upcomingAppointments || 0} upcoming` },
    { label: "Events", value: dashboardData.totalActivities || "0", icon: Activity, color: "from-orange-500 to-red-500", change: `+${dashboardData.activityGrowth || 0}% last month` },
    { label: "Invoices", value: dashboardData.totalInvoices || "0", icon: FileText, color: "from-green-500 to-emerald-500", change: `${dashboardData.totalRevenue || 0}M VND` },
  ] : [
    { label: "Cars", value: "0", icon: Car, color: "from-blue-500 to-cyan-500", change: "+0 tháng này" },
    { label: "Date Bookings", value: "0", icon: Calendar, color: "from-purple-500 to-pink-500", change: "0 sắp tới" },
    { label: "Events", value: "0", icon: Activity, color: "from-orange-500 to-red-500", change: "+0% tháng trước" },
    { label: "Invoices", value: "0", icon: FileText, color: "from-green-500 to-emerald-500", change: "0M VNĐ" },
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-sm text-gray-500">Welcome Back!</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{user?.sub}</p>
                  <p className="text-xs text-gray-500">{user?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 hover:shadow-lg transition-all font-medium"
              >
                <LogOut className="w-4 h-4" />
                LogOut
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all cursor-pointer group hover:scale-105"
            onClick={() => router.push("/cars")}

          >
            <div className="flex items-center justify-between mb-4">
              <Car className="w-10 h-10 opacity-80 group-hover:scale-110 transition-transform" />
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-xl font-bold mb-2">Car Management</h3>
            <p className="text-blue-100 text-sm"
            >View car list, add new and edit information</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all cursor-pointer group hover:scale-105"
            onClick={() => router.push("/booking")}
          >
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-10 h-10 opacity-80 group-hover:scale-110 transition-transform" />
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-xl font-bold mb-2">Repair Appointments</h3>
            <p className="text-purple-100 text-sm">Manage and schedule maintenance and repairs</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all cursor-pointer group hover:scale-105"
            onClick={() => router.push("/customer")}
          >
            <div className="flex items-center justify-between mb-4">
              <User className="w-10 h-10 opacity-80 group-hover:scale-110 transition-transform" />
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-xl font-bold mb-2">Customers</h3>
            <p className="text-green-100 text-sm">Manage customer information</p>
          </div>

          
          <div 
            className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all cursor-pointer group hover:scale-105"
            onClick={() => router.push("/timeslot")}
          >
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-10 h-10 opacity-80 group-hover:scale-110 transition-transform" />
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-xl font-bold mb-2">TimeSlots</h3>
            <p className="text-orange-100 text-sm">Manage appointment scheduling slots</p>
          </div>

          <div 
            className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all cursor-pointer group hover:scale-105"
            onClick={() => router.push("/technical")}
          >
            <div className="flex items-center justify-between mb-4">
              <User className="w-10 h-10 opacity-80 group-hover:scale-110 transition-transform" />
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-xl font-bold mb-2">Technical</h3>
            <p className="text-cyan-100 text-sm">Management Technical Information</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all cursor-pointer group hover:scale-105"
          
            onClick={() => router.push("/invoice")}
          >
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-10 h-10 opacity-80 group-hover:scale-110 transition-transform" />
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-xl font-bold mb-2">Invoices & Payments</h3>
            <p className="text-green-100 text-sm">View invoice and payment history</p>
          </div>
         
          <div className="bg-gradient-to-br from-black-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all cursor-pointer group hover:scale-105"
            onClick={() => router.push("/garages")}
          >
            <div className="flex items-center justify-between mb-4">
              <Car className="w-10 h-10 opacity-80 group-hover:scale-110 transition-transform" />
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-xl font-bold mb-2">Garages</h3>
            <p className="text-green-100 text-sm">View and manage garages</p>
         
          </div>
            <div className="bg-gradient-to-br from-red-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all cursor-pointer group hover:scale-105"
            onClick={() => router.push("/servicess")}
          >
            <div className="flex items-center justify-between mb-4">
              <CardSim className="w-10 h-10 opacity-80 group-hover:scale-110 transition-transform" />
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-xl font-bold mb-2">Services</h3>
            <p className="text-green-100 text-sm">View and manage services</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Cars */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recently Added Cars</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                onClick={() => router.push("/cars")}
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
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
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Calendar Booking</h2>
            <div className="space-y-4">
              {upcomingAppointments.map((apt, idx) => (
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
              ))}
            </div>
            <button className="w-full mt-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              onClick={() => router.push("/booking")}
            >
              View All Appointments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}