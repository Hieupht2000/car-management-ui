/**
 * Dashboard Redirect Page
 * Automatically redirects to admin or customer dashboard based on user role
 */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { Loader2 } from "lucide-react";

interface TokenData {
  userId: string;
  sub: string;
  jti: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
  exp: number;
  iss: string;
  aud: string;
}

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    
    if (!savedToken) {
      // No token, redirect to login
      router.push("/auth/login");
      return;
    }

    try {
      const decoded = jwtDecode<TokenData>(savedToken);
      const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      // Redirect based on role
      if (role === "Admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/customer/dashboard");
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      router.push("/auth/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
