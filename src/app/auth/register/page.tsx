"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
export default function RegisterPage() {
    const router = useRouter();
    const [UserName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [PhoneNumber, setPhoneNumber] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            await authService.register(UserName, email, password, PhoneNumber);
            router.push("/auth/login");
        }
        catch (err: any) {
            setError(err.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Register</h2> 
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-900">Username</label>
                        <input
                            type="text"
                            value={UserName}        
                            onChange={(e) => setUserName(e.target.value)}
                            className="w-full px-3 py-2 border rounded text-gray-900"
                            required
                        />
                    </div>  
                    <div>
                        <label className="block text-gray-900">Email</label>
                        <input  
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}  
                            className="w-full px-3 py-2 border rounded text-gray-900"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-900">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded text-gray-900"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-900">Phone Number</label>
                        <input
                            type="tel"
                            value={PhoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full px-3 py-2 border rounded text-gray-900"
                            required
                        />
                    </div>      
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                        Register
                    </button>
                </form>
            </div>
        </div>
        
    );
}  