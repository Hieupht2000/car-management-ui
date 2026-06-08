/**
 * Customer Cars Page
 * Allows customers to manage only their own vehicles
 */
"use client";

import { useEffect, useState } from "react";
import { Car, Plus, Search, Edit2, Trash2, X, Loader2, AlertCircle } from "lucide-react";
import { CarDTO, carService } from "@/services/carService";
import { useTranslation } from "@/src/hooks/useTranslation";

export default function CustomerCarPage() {
    const { t, language, changeLanguage } = useTranslation('cars');
    const [cars, setCars] = useState<CarDTO[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCar, setEditingCar] = useState<CarDTO | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        if (!savedToken) {
            setError(t('messages.error'));
            setLoading(false);
            return;
        }
        setToken(savedToken);
        loadCars(savedToken);
    }, []);

    const loadCars = async (authToken: string) => {
        try {
            setLoading(true);
            setError(null);
            const data = await carService.getCars(authToken);
            setCars(data);
        } catch (error: any) {
            console.error("Error fetching cars:", error);
            setError(error.message || "Failed to load car data");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (carId: number) => {
        if (!confirm(t('messages.confirmDelete'))) return;
        if (!token) return;

        try {
            await carService.deleteCar(carId, token);
            setCars((prev) => prev.filter((c) => c.carId !== carId));
        } catch (error: any) {
            console.error(error);
            alert(error.message || t('messages.error'));
        }
    };

    const handleAdd = async (carData: any) => {
        if (!token) {
            alert(t('messages.error'));
            return;
        }

        try {
            const newCar = await carService.addCar(carData, token);
            setCars((prev) => [...prev, newCar as unknown as CarDTO]);
            setShowModal(false);
        } catch (error: any) {
            console.error(error);
            alert(error.message || t('messages.error'));
        }
    };

    const handleEdit = async (carData: any) => {
        if (!token || !editingCar) return;

        try {
            const updatedCar = await carService.updateCar(editingCar.carId, carData, token);
            setCars((prev) =>
                prev.map((c) => (c.carId === editingCar.carId ? updatedCar as unknown as CarDTO : c))
            );
            setShowEditModal(false);
            setEditingCar(null);
        } catch (error: any) {
            console.error(error);
            alert(error.message || t('messages.error'));
        }
    };

    const openEditModal = (car: CarDTO) => {
        setEditingCar(car);
        setShowEditModal(true);
    };

    const filteredCars = cars.filter(car =>
        car.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">{t('messages.loading')}</p>
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
                            <Car className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                {t('title')}
                            </h1>
                            <p className="text-gray-500 mt-1">Manage your vehicles</p>
                        </div>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <div className="flex-1">
                            <p className="text-red-800 font-medium">{error}</p>
                        </div>
                        <button
                            onClick={() => setError(null)}
                            className="text-red-600 hover:text-red-700"
                        >
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
                                placeholder={t('searchPlaceholder')}
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
                            {t('addCar')}
                        </button>
                    </div>
                </div>

                {/* Stats Card */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">My Vehicles</p>
                            <p className="text-3xl font-bold mt-2">{cars.length}</p>
                        </div>
                        <div className="p-4 bg-white/20 rounded-xl">
                            <Car className="w-8 h-8" />
                        </div>
                    </div>
                </div>

                {/* Cars Table */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">License Plate</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Brand</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Model</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Year</th>
                                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredCars.length > 0 ? (
                                    filteredCars.map((car) => (
                                        <tr key={car.carId} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-gray-900">{car.licensePlate}</td>
                                            <td className="px-6 py-4 text-gray-700">{car.brand}</td>
                                            <td className="px-6 py-4 text-gray-700">{car.model}</td>
                                            <td className="px-6 py-4 text-gray-700">{car.year}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(car)}
                                                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(car.carId)}
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
                                        <td colSpan={5} className="text-center py-12 text-gray-500">
                                            <Car className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                            <p className="text-lg font-medium">{t('messages.noCars')}</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Car Modal */}
            {showModal && (
                <CarModal
                    close={() => setShowModal(false)}
                    submit={handleAdd}
                    title={t('addCar')}
                    t={t}
                />
            )}

            {/* Edit Car Modal */}
            {showEditModal && editingCar && (
                <CarModal
                    close={() => {
                        setShowEditModal(false);
                        setEditingCar(null);
                    }}
                    submit={handleEdit}
                    title={t('editCar')}
                    initialData={editingCar}
                    carId={editingCar.carId}
                    t={t}
                />
            )}
        </div>
    );
}

function CarModal({
    close,
    submit,
    title,
    initialData,
    carId,
    t
}: {
    close: () => void;
    submit: (carData: any) => void;
    title: string;
    initialData?: CarDTO;
    carId?: number;
    t?: any;
}) {
    const [form, setForm] = useState({
        customerId: initialData?.customerId || 4,
        fullName: initialData?.fullName || "",
        licensePlate: initialData?.licensePlate || "",
        brand: initialData?.brand || "",
        model: initialData?.model || "",
        year: initialData?.year || new Date().getFullYear(),
        odometer: initialData?.odometer || 0,
    });

    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!form.licensePlate || !form.brand || !form.model || !form.year) {
            alert(t?.('messages.requiredField') || "Please fill in all required fields!");
            return;
        }

        setSubmitting(true);
        try {
            await submit({
                carId,
                CustomerId: form.customerId,
                FullName: form.fullName,
                LicensePlate: form.licensePlate,
                Brand: form.brand,
                Model: form.model,
                Year: Number(form.year),
                Odometer: Number(form.odometer),
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl transform transition-all animate-in">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-t-3xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Car className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">{title}</h2>
                        </div>
                        <button
                            onClick={close}
                            disabled={submitting}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t?.('table.plate')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="licensePlate"
                            value={form.licensePlate}
                            onChange={handleChange}
                            placeholder="VD: 30A-12345"
                            disabled={submitting}
                            className="w-full px-4 py-3 border-2 text-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all disabled:bg-gray-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Brand</label>
                        <input
                            type="text"
                            name="brand"
                            value={form.brand}
                            onChange={handleChange}
                            placeholder="VD: Toyota"
                            disabled={submitting}
                            className="w-full px-4 py-3 border-2 text-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all disabled:bg-gray-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t?.('table.model')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="model"
                            value={form.model}
                            onChange={handleChange}
                            placeholder="VD: Camry"
                            disabled={submitting}
                            className="w-full px-4 py-3 border-2 text-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all disabled:bg-gray-50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {t?.('table.year')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="year"
                                value={form.year}
                                onChange={handleChange}
                                placeholder="2024"
                                disabled={submitting}
                                className="w-full px-4 py-3 border-2 text-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all disabled:bg-gray-50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Odometer</label>
                            <input
                                type="number"
                                name="odometer"
                                value={form.odometer}
                                onChange={handleChange}
                                placeholder="0"
                                disabled={submitting}
                                className="w-full px-4 py-3 border-2 text-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all disabled:bg-gray-50"
                            />
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={close}
                        disabled={submitting}
                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        {t?.('form.cancel')}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {t?.('messages.loading')}
                            </>
                        ) : (
                            t?.('form.submit')
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
