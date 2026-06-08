/**
 * Login Page Component
 * Handles user authentication with email and password
 * Stores JWT token to localStorage on successful login
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { useTranslation } from "@/src/hooks/useTranslation";
import { Mail, Lock, LogIn, Car, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

/**
 * LoginPage - User authentication form
 * Routes to dashboard on successful login
 */
export default function LoginPage() {
  const router = useRouter();
  
  // Form state management
  const [email, setEmail] = useState("");           // User email input
  const [password, setPassword] = useState("");     // User password input
  const [loading, setLoading] = useState(false);    // Loading state during API call
  const [error, setError] = useState("");           // Error message display
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility

  /**
   * Handle login form submission
   * Validates input, calls auth API, stores token, navigates to dashboard
   */
  const handleLogin = async () => {
    // Clear previous errors
    setError("");
    
    // Validate form inputs
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    
    // Start loading state
    setLoading(true);
    
    try {
      // Call login API with credentials
      const data = await authService.login(email, password);
      console.log("Login response:", data); // Debug
      
      // Try different token property names (flexible API response handling)
      const token = data?.token || data?.accessToken || data?.result?.token || data?.data?.token;
      console.log("Extracted token:", token); // Debug
      
      if (token) {
        // Store token to localStorage for future requests
        localStorage.setItem("token", token);
        console.log("Token saved to localStorage"); // Debug
        
        // Decode token to check user role
        try {
          const { jwtDecode } = await import("jwt-decode");
          const decoded: any = jwtDecode(token);
          const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
          
          // Route based on role (case-insensitive)
          if (role?.trim().toLowerCase() === "admin") {
            router.push("/admin/dashboard");
          } else {
            router.push("/customer/dashboard");
          }
        } catch (decodeError) {
          console.error("Error decoding token:", decodeError);
          // Default to customer dashboard if decode fails
          router.push("/customer/dashboard");
        }
      } else {
        // Token not found in response
        setError(`Invalid response: ${JSON.stringify(data).substring(0, 100)}`);
      }

    } catch (err: any) {
      // Display error message from API or generic fallback
      setError(err.message || err.response?.data?.message || "Login failed");
    } finally {
      // Stop loading state
      setLoading(false);
    }
  };

  /**
   * Handle Enter key to submit form
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };


  // Render login page UI
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Left Side - Branding (hidden on mobile) */}

      {/* Right Side - Login Form Container */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo - Visible only on small screens */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <Car className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Car Repair
              </h1>
            </div>
          </div>

          {/* Main Login Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            {/* Page Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
              <p className="text-gray-500">Login to continue</p>
            </div>

            {/* Error Message Alert - Conditionally displayed */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <div className="space-y-5">
              {/* Email Input Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-12 pr-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    placeholder="your.email@example.com"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Input Field with Show/Hide Toggle */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-12 pr-12 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  {/* Toggle password visibility button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Forgot password?
                </button>
              </div>

              {/* Login Submit Button */}
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading Log In...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Log In
                  </>
                )}
              </button>
            </div>

            {/* Visual Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Social Login Buttons (Google & Facebook) */}
            <div className="grid grid-cols-2 gap-3">
              {/* Google Sign-In */}
              <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700">Google</span>
              </button>
              
              {/* Facebook Sign-In */}
              <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700">Facebook</span>
              </button>
            </div>

            {/* Registration Link */}
            <p className="text-center text-gray-600 mt-6">
              Don't have an account?{" "}
              <button 
                onClick={() => window.location.href = '/auth/register'}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Register now
              </button>
            </p>
          </div>

          {/* Footer Legal Links */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>By logging in, you agree to our</p>
            <div className="flex items-center justify-center gap-4 mt-2">
              <button 
                className="text-blue-600 hover:underline"
                onClick={() => window.location.href = '/terms'}
              >
                Terms of Service
              </button>
              <span>•</span>
              <button 
                className="text-blue-600 hover:underline"
                onClick={() => window.location.href = '/privacy'}
              >
                Privacy Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
