/**
 * Time Slot Selector Component
 * Displays available time slots for a specific date and garage
 * Similar to movie ticket booking UI
 */

import React, { useState, useEffect } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

interface TimeSlot {
    id: number;
    time: string;
    isBooked: boolean;
}

interface TimeSlotSelectorProps {
    date: string;
    garageId: number;
    selectedSlot: number | null;
    onSelectSlot: (slotId: number) => void;
    token: string;
    timeSlots: Record<number, string>;
}

export default function TimeSlotSelector({
    date,
    garageId,
    selectedSlot,
    onSelectSlot,
    token,
    timeSlots,
}: TimeSlotSelectorProps) {
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (date && garageId) {
            loadAvailableSlots();
        }
    }, [date, garageId]);

    const loadAvailableSlots = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Format date as YYYY-MM-DD for API
            const formattedDate = new Date(date).toISOString().split('T')[0];
            
            // Get available slots from API
            const response = await fetch(
                `https://localhost:7249/api/Booking/available-slots?date=${formattedDate}&garageId=${garageId}`,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const slots = await response.json();
                console.log("Available slots:", slots);
                setSlots(slots);
            } else if (response.status === 404) {
                // Endpoint doesn't exist, fallback to manual calculation
                console.warn("Endpoint not found, using fallback method");
                loadAvailableSlotsManual(formattedDate);
            } else {
                throw new Error("Failed to load available slots");
            }
        } catch (err: any) {
            setError(err.message || "Error loading slots");
            console.error("Error loading slots:", err);
        } finally {
            setLoading(false);
        }
    };

    const loadAvailableSlotsManual = async (formattedDate: string) => {
        try {
            // Fallback: Get all bookings for the selected date and garage
            const response = await fetch(
                `https://localhost:7249/api/Booking?date=${formattedDate}&garageId=${garageId}`,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const bookings = await response.json();
                
                // Create slot array with availability status
                const availableSlots: TimeSlot[] = Object.entries(timeSlots).map(([id, time]) => {
                    const slotId = parseInt(id);
                    const isBooked = bookings.some((b: any) => b.timeSlot_Id === slotId);
                    return {
                        id: slotId,
                        time,
                        isBooked,
                    };
                });
                
                setSlots(availableSlots);
            }
        } catch (err: any) {
            console.error("Fallback slot loading failed:", err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                <span className="ml-2 text-gray-600">Loading available slots...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700">{error}</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Available Time Slots</h3>
            
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {slots.map((slot) => (
                    <button
                        key={slot.id}
                        onClick={() => !slot.isBooked && onSelectSlot(slot.id)}
                        disabled={slot.isBooked}
                        className={`p-4 rounded-lg font-medium transition-all ${
                            slot.isBooked
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                                : selectedSlot === slot.id
                                ? "bg-blue-600 text-white ring-2 ring-blue-400 scale-105"
                                : "bg-white border-2 border-gray-200 text-gray-900 hover:border-blue-400 hover:bg-blue-50"
                        }`}
                    >
                        <div className="text-sm">{slot.time}</div>
                        <div className="text-xs mt-1">
                            {slot.isBooked ? "Booked" : "Available"}
                        </div>
                    </button>
                ))}
            </div>

            {slots.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No time slots available for this date and garage
                </div>
            )}
        </div>
    );
}
