"use client";

import { useState, useEffect } from "react";
import {
  Wrench,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Clock,
  DollarSign,
  FileText,
  Eye
} from "lucide-react";
import { ServiceDTO, servicesService } from "@/services/servicesService";

// Helper function to format duration
const formatDuration = (duration: string): string => {
  const parts = duration.split(':');
  const hours = parseInt(parts[0]);
  const minutes = parseInt(parts[1]);

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
};

// Helper function to parse duration input to TimeSpan format
const parseDurationToTimeSpan = (hours: number, minutes: number): string => {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
};

export default function ServicePage() {
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServiceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceDTO | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceDTO | null>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;


  useEffect(() => {
    if (!token) {
      setError("Please log in to access this page");
      setLoading(false);
      return;
    }
    loadServices();
  }, [token]);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm]);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for demo
      // const mockData: ServiceDTO[] = [
      //   {
      //     serviceId: 1,
      //     name: "Thay dầu động cơ",
      //     description: "Thay dầu động cơ và lọc dầu, kiểm tra mức dầu",
      //     price: 500000,
      //     estimatedDuration: "00:30:00"
      //   },
      //   {
      //     serviceId: 2,
      //     name: "Bảo dưỡng định kỳ",
      //     description: "Bảo dưỡng toàn diện theo chu kỳ 10,000 km",
      //     price: 1500000,
      //     estimatedDuration: "02:00:00"
      //   },
      //   {
      //     serviceId: 3,
      //     name: "Thay phanh",
      //     description: "Thay má phanh trước/sau, kiểm tra hệ thống phanh",
      //     price: 1200000,
      //     estimatedDuration: "01:30:00"
      //   },
      //   {
      //     serviceId: 4,
      //     name: "Kiểm tra tổng quát",
      //     description: "Kiểm tra toàn bộ hệ thống xe, chẩn đoán sự cố",
      //     price: 300000,
      //     estimatedDuration: "00:45:00"
      //   },
      //   {
      //     serviceId: 5,
      //     name: "Thay lốp xe",
      //     description: "Thay lốp mới, cân bằng và căn chỉnh",
      //     price: 800000,
      //     estimatedDuration: "01:00:00"
      //   },
      //   {
      //     serviceId: 6,
      //     name: "Sửa chữa điện",
      //     description: "Kiểm tra và sửa chữa hệ thống điện, đèn",
      //     price: 600000,
      //     estimatedDuration: "01:15:00"
      //   }
      // ];

      // setServices(mockData);
      // setFilteredServices(mockData);
      const data = await servicesService.getServices(token!);
            setServices(data);
            setFilteredServices(data);
    } catch (error: any) {
      console.error("Error loading services:", error);
      setError(error.message || "Can't load service data");
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    if (!searchTerm) {
      setFilteredServices(services);
      return;
    }
    const filtered = services.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredServices(filtered);
  };

  const handleAdd = async (serviceData: any) => {
    if (!token) {
      alert("Token not found!");
      return;
    }

    try {
      const newService = await servicesService.createService(serviceData, token);
      setServices(prev => [...prev, newService]);
      setFilteredServices(prev => [...prev, newService]);
      setShowModal(false);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to add service");
    }
  };

  const handleEdit = async (serviceData: any) => {
    if (!token || !editingService) return;

    try {
      const updated = await servicesService.updateService(editingService.serviceId, serviceData, token);
      setServices(prev =>
        prev.map(s => s.serviceId === editingService.serviceId
          ? { ...s, ...serviceData }
          : s
        )
      );
      setFilteredServices(prev =>
        prev.map(s => s.serviceId === editingService.serviceId
          ? { ...s, ...serviceData }
          : s
        )
      );
      setShowModal(false);
      setEditingService(null);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to update service");
    }
  };

  const handleDelete = async (serviceId: number) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    if (!token) return;

    try {
      await servicesService.deleteService(serviceId, token);
      setServices(prev => prev.filter(s => s.serviceId !== serviceId));
      setFilteredServices(prev => prev.filter(s => s.serviceId !== serviceId));
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Delete failed!");
    }
  };

  const openEditModal = (service: ServiceDTO) => {
    setEditingService(service);
    setShowModal(true);
  };

  const stats = {
    total: services.length,
    avgPrice: services.length > 0
      ? Math.round(services.reduce((sum, s) => sum + s.price, 0) / services.length / 1000)
      : 0,
    quickServices: services.filter(s => {
      const duration = s.estimatedDuration.split(':');
      return parseInt(duration[0]) === 0 && parseInt(duration[1]) <= 45;
    }).length,
    premium: services.filter(s => s.price >= 1000000).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading service data...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Not logged in</h2>
          <p className="text-gray-600 mb-6">Please log in to access this page</p>
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
              <Wrench className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Service Management
              </h1>
              <p className="text-gray-500 mt-1">Manage repair and maintenance services</p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 font-medium flex-1">{error}</p>
            <button onClick={() => setError(null)}><X className="w-5 h-5" /></button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Services</p>
                <p className="text-3xl font-bold mt-2">{stats.total}</p>
              </div>
              <div className="p-4 bg-white/20 rounded-xl">
                <Wrench className="w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Average Price</p>
                <p className="text-3xl font-bold mt-2">{stats.avgPrice}K</p>
              </div>
              <div className="p-4 bg-white/20 rounded-xl">
                <DollarSign className="w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Quick Services</p>
                <p className="text-3xl font-bold mt-2">{stats.quickServices}</p>
              </div>
              <div className="p-4 bg-white/20 rounded-xl">
                <Clock className="w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Premium</p>
                <p className="text-3xl font-bold mt-2">{stats.premium}</p>
              </div>
              <div className="p-4 bg-white/20 rounded-xl">
                <FileText className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
            <button
              onClick={() => {
                setEditingService(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:scale-105 transition-all font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add New Service
            </button>
          </div>
        </div>

        {/* Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.serviceId}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all group"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                <h3 className="text-xl font-bold text-white mb-1">{service.name}</h3>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold text-white">
                  ID: {service.serviceId}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4">
                <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">{service.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">Service Price</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {(service.price / 1000).toFixed(0)}K
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Duration</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      {formatDuration(service.estimatedDuration)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="px-5 pb-5 flex gap-2">
                <button
                  onClick={() => {
                    setSelectedService(service);
                    setShowDetailModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors font-medium"
                >
                  <Eye className="w-4 h-4" />
                  Details
                </button>
                <button
                  onClick={() => openEditModal(service)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(service.serviceId)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-2xl shadow-lg">
            <Wrench className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No services found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <ServiceModal
          close={() => {
            setShowModal(false);
            setEditingService(null);
          }}
          submit={editingService ? handleEdit : handleAdd}
          title={editingService ? "Edit Service" : "Add New Service"}
          initialData={editingService}
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedService && (
        <DetailModal
          service={selectedService}
          close={() => {
            setShowDetailModal(false);
            setSelectedService(null);
          }}
        />
      )}
    </div>
  );
}

function ServiceModal({ close, submit, title, initialData }: any) {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    durationHours: initialData ? parseInt(initialData.estimatedDuration.split(':')[0]) : 0,
    durationMinutes: initialData ? parseInt(initialData.estimatedDuration.split(':')[1]) : 30
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.description || form.price <= 0) {
      alert("Please fill in all required fields!");
      return;
    }

    setSubmitting(true);
    try {
      const serviceData = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        estimatedDuration: parseDurationToTimeSpan(form.durationHours, form.durationMinutes)
      };
      await submit(serviceData);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-t-3xl sticky top-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Wrench className="w-6 h-6 text-white" />
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
              Service Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Engine oil change"
              className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
             Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detailed description of the service..."
              rows={3}
              className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
             Price Service (VNĐ) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              placeholder="500000"
              className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              DurationHours
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Hour</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={form.durationHours}
                  onChange={(e) => setForm({ ...form, durationHours: Math.min(23, Math.max(0, Number(e.target.value))) })}
                  className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: Math.min(59, Math.max(0, Number(e.target.value))) })}
                  className="w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Duration: {form.durationHours}h {form.durationMinutes}m
            </p>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={close}
            disabled={submitting}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {submitting ? <><Loader2 className="w-5 h-5 animate-spin" />Saving...</> : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ service, close }: any) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Service Details</h2>
            </div>
            <button onClick={close} className="p-2 hover:bg-white/20 rounded-lg">
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{service.name}</h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              ID: {service.serviceId}
            </span>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-1">Mô Tả</h4>
            <p className="text-gray-600">{service.description}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Service Price</p>
                <p className="text-lg font-bold text-green-600">
                  {(service.price / 1000).toFixed(0)}K
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Estimated Duration</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatDuration(service.estimatedDuration)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}