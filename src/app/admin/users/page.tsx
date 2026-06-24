/**
 * Admin Users Management Page
 * Admin-only page for managing system users and roles
 */
"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Search, Edit2, Trash2, X, Loader2, AlertCircle, Shield, Mail } from "lucide-react";
import { useTranslation } from "@/src/hooks/useTranslation";
import { userService, UserDTO } from "@/services/userService";

// Use UserDTO from service
type UserRecord = UserDTO;

export default function AdminUsersPage() {
    const { t } = useTranslation('users');
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("all");
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const [form, setForm] = useState({
        email: "",
        fullName: "",
        role: "Customer",
    });

    useEffect(() => {
        if (!token) {
            setError("Please log in to access this page");
            setLoading(false);
            return;
        }
        loadUsers();
    }, [token]);

    useEffect(() => {
        filterUsers();
    }, [searchTerm, filterRole, users]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await userService.getUsers(token!);
            setUsers(data);
            setFilteredUsers(data);
        } catch (err: any) {
            console.error("Error loading users:", err);
            setError(err.message || "Failed to load users");
            // Fallback to empty array on error
            setUsers([]);
            setFilteredUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = users;

        if (searchTerm.trim() !== "") {
            filtered = filtered.filter(user =>
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterRole !== "all") {
            filtered = filtered.filter(user => user.role.toLowerCase() === filterRole.toLowerCase());
        }

        setFilteredUsers(filtered);
    };

    const handleSubmit = async () => {
        if (!form.email || !form.fullName) {
            alert("Please fill in all required fields!");
            return;
        }

        try {
            setLoading(true);
            if (editingUser) {
                // Update user
                const updated = await userService.updateUser(editingUser.userId, {
                    email: form.email,
                    fullName: form.fullName,
                    role: form.role,
                }, token!);
                setUsers(prev => prev.map(u =>
                    u.userId === editingUser.userId ? updated : u
                ));
                alert("User updated successfully!");
            } else {
                // Add new user - need password for creation
                const password = prompt("Enter password for new user:");
                if (!password) return;
                
                const newUserData = {
                    ...form,
                    password,
                };
                const newUser = await userService.createUser(newUserData, token!);
                setUsers(prev => [...prev, newUser]);
                alert("User created successfully!");
            }
            setShowModal(false);
            setEditingUser(null);
            setForm({ email: "", fullName: "", role: "Customer" });
            await loadUsers(); // Reload to get latest data
        } catch (error: any) {
            console.error("Error submitting user:", error);
            alert(error.message || "Failed to save user");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user: UserRecord) => {
        setEditingUser(user);
        setForm({
            email: user.email,
            fullName: user.fullName,
            role: user.role,
        });
        setShowModal(true);
    };

    const handleDelete = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        
        try {
            setLoading(true);
            await userService.deleteUser(userId, token!);
            setUsers(prev => prev.filter(u => u.userId !== userId));
            alert("User deleted successfully!");
        } catch (error: any) {
            console.error("Error deleting user:", error);
            alert(error.message || "Failed to delete user");
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        total: users.length,
        admins: users.filter(u => u.role === "Admin").length,
        customers: users.filter(u => u.role === "Customer").length,
        lastAdded: users.length > 0 ? new Date(users[0].createdAt).toLocaleDateString('vi-VN') : "N/A"
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading users...</p>
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
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                User Management
                            </h1>
                            <p className="text-gray-500 mt-1">Manage system users and their roles</p>
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

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Total Users</p>
                                <p className="text-3xl font-bold mt-2">{stats.total}</p>
                            </div>
                            <Users className="w-8 h-8 opacity-40" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium">Admins</p>
                                <p className="text-3xl font-bold mt-2">{stats.admins}</p>
                            </div>
                            <Shield className="w-8 h-8 opacity-40" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Customers</p>
                                <p className="text-3xl font-bold mt-2">{stats.customers}</p>
                            </div>
                            <Users className="w-8 h-8 opacity-40" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm font-medium">Last Added</p>
                                <p className="text-lg font-bold mt-2">{stats.lastAdded}</p>
                            </div>
                            <Plus className="w-8 h-8 opacity-40" />
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="flex gap-4 flex-1 w-full">
                            <div className="relative flex-1 md:max-w-md">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by email or name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                />
                            </div>
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none"
                            >
                                <option value="all">All Roles</option>
                                <option value="admin">Admin</option>
                                <option value="customer">Customer</option>
                            </select>
                        </div>
                        <button
                            onClick={() => {
                                setEditingUser(null);
                                setForm({ email: "", fullName: "", role: "Customer" });
                                setShowModal(true);
                            }}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:scale-105 transition-all font-semibold"
                        >
                            <Plus className="w-5 h-5" />
                            Add User
                        </button>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Email</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Role</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Joined</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Last Login</th>
                                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user, idx) => (
                                        <tr key={user.userId || idx} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Mail className="font-semibold text-gray-900" />
                                                    {user.email || "N/A"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                        {(user.fullName || "U").charAt(0).toUpperCase()}
                                                    </div>
                                                    <p className="font-semibold text-gray-900">{user.fullName || "N/A"}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    user.role === "Admin" 
                                                        ? "bg-purple-100 text-purple-700" 
                                                        : "bg-blue-100 text-blue-700"
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 text-sm">
                                                {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 text-sm">
                                                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('vi-VN') : "Never"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.userId)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-gray-500">
                                            <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                            <p className="text-lg font-medium">No users found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* User Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl transform transition-all">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-t-3xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-xl">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">
                                        {editingUser ? "Edit User" : "Add User"}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingUser(null);
                                    }}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6 text-white" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="user@example.com"
                                    className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.fullName}
                                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                    placeholder="John Doe"
                                    className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={form.role}
                                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                                    className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                >
                                    <option value="Customer">Customer</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                        </div>

                        <div className="px-6 pb-6 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingUser(null);
                                }}
                                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all"
                            >
                                {editingUser ? "Update" : "Create"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
