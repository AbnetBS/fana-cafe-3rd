"use client";

import { useState } from "react";
import { Calendar, Clock, Users, MapPin, CheckCircle2, Phone, AlertCircle, Sparkles, Utensils } from "lucide-react";
import { SiteSettings, Reservation } from "@/types";

interface ReservationProps {
  settings: SiteSettings;
  isOpenModal?: boolean;
  onCloseModal?: () => void;
}

export default function ReservationSection({ settings, isOpenModal, onCloseModal }: ReservationProps) {
  const [formData, setFormData] = useState({
    guestName: "",
    phone: "",
    email: "",
    date: new Date().toISOString().split("T")[0],
    time: "12:30 PM",
    partySize: 2,
    tablePreference: "Indoor Dining Lounge",
    specialRequests: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const phone = settings.phone || "0911 065 022";

  const timeSlots = [
    "08:30 AM", "09:30 AM", "10:30 AM", "11:30 AM",
    "12:30 PM", "01:30 PM", "02:30 PM", "03:30 PM",
    "04:30 PM", "05:30 PM", "06:30 PM", "07:30 PM"
  ];

  const preferences = [
    "Indoor Dining Lounge",
    "Outdoor Garden Terrace",
    "Quiet Meeting Corner",
    "Window Seat View",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.guestName || !formData.phone || !formData.date || !formData.time) {
      setErrorMsg("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setConfirmedReservation(data);
      } else {
        // Never show raw server errors to customers — log them instead
        console.error("Reservation failed:", data);
        setErrorMsg(
          "Reservation could not be submitted right now. Please call us directly at " + phone + " to book your table."
        );
      }
    } catch (err) {
      console.error("Reservation network error:", err);
      setErrorMsg("Connection issue. Please call us directly at " + phone + " to book your table.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      
      {/* Header */}
      {!confirmedReservation && (
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A227]/20 border border-[#C9A227]/40 text-[#C9A227] text-xs font-bold uppercase tracking-widest mb-3">
            <Calendar className="w-3.5 h-3.5" />
            <span>Table Reservation</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
            Reserve Your Special Table
          </h2>
          <p className="text-stone-300 text-sm mt-2 font-light">
            Guaranteed seating for business lunches, coffee dates, or relaxing family dinners.
          </p>
        </div>
      )}

      {/* Confirmed State */}
      {confirmedReservation ? (
        <div className="bg-[#3D2314] rounded-3xl p-8 text-center border-2 border-[#C9A227] shadow-2xl text-white animate-scaleUp">
          <div className="w-16 h-16 rounded-full bg-[#C9A227]/20 border-2 border-[#C9A227] text-[#C9A227] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="bg-[#C9A227] text-[#2C1B17] font-extrabold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
            Reservation Confirmed
          </span>

          <h3 className="text-2xl font-serif font-bold mt-3 text-amber-100">
            We Look Forward To Welcoming You!
          </h3>

          <p className="text-stone-300 text-sm mt-1">
            Reservation Reference Code:{" "}
            <strong className="text-[#C9A227] font-mono text-base">{confirmedReservation.reservationNumber}</strong>
          </p>

          <div className="mt-6 bg-[#2C1B17] p-6 rounded-2xl border border-[#C9A227]/30 text-left max-w-md mx-auto space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between border-b border-stone-800 pb-2">
              <span className="text-stone-400">Guest Name:</span>
              <span className="font-bold text-amber-100">{confirmedReservation.guestName}</span>
            </div>
            <div className="flex justify-between border-b border-stone-800 pb-2">
              <span className="text-stone-400">Date & Time:</span>
              <span className="font-bold text-[#C9A227]">{confirmedReservation.date} at {confirmedReservation.time}</span>
            </div>
            <div className="flex justify-between border-b border-stone-800 pb-2">
              <span className="text-stone-400">Party Size:</span>
              <span className="font-bold text-amber-100">{confirmedReservation.partySize} Guests</span>
            </div>
            <div className="flex justify-between border-b border-stone-800 pb-2">
              <span className="text-stone-400">Table Preference:</span>
              <span className="font-bold text-amber-100">{confirmedReservation.tablePreference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Contact Phone:</span>
              <span className="font-bold text-amber-100">{confirmedReservation.phone}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`tel:${phone.replace(/\s+/g, "")}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#C9A227] text-[#2C1B17] font-bold text-xs uppercase px-6 py-3 rounded-full hover:bg-amber-400 transition"
            >
              <Phone className="w-4 h-4" />
              <span>Call Cafe ({phone})</span>
            </a>

            <button
              onClick={() => {
                setConfirmedReservation(null);
                if (onCloseModal) onCloseModal();
              }}
              className="w-full sm:w-auto bg-white/10 text-stone-200 font-bold text-xs uppercase px-6 py-3 rounded-full hover:bg-white/20 transition"
            >
              Done / Book Another
            </button>
          </div>
        </div>
      ) : (
        /* Reservation Form */
        <form onSubmit={handleSubmit} className="bg-[#3D2314]/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-[#C9A227]/30 shadow-2xl text-stone-100 space-y-6">
          
          {errorMsg && (
            <div className="bg-rose-900/60 border border-rose-500 text-rose-200 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Guest Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-200/80 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.guestName}
                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                placeholder="e.g. Abebe Kebede"
                className="w-full bg-[#2C1B17] border border-[#C9A227]/30 rounded-xl px-4 py-3 text-sm text-stone-100 focus:outline-none focus:border-[#C9A227]"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-200/80 mb-1.5">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. 0911 223 344"
                className="w-full bg-[#2C1B17] border border-[#C9A227]/30 rounded-xl px-4 py-3 text-sm text-stone-100 focus:outline-none focus:border-[#C9A227]"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-200/80 mb-1.5">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-[#2C1B17] border border-[#C9A227]/30 rounded-xl px-4 py-3 text-sm text-stone-100 focus:outline-none focus:border-[#C9A227]"
              />
            </div>

            {/* Time Slot */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-200/80 mb-1.5">
                Preferred Time *
              </label>
              <select
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full bg-[#2C1B17] border border-[#C9A227]/30 rounded-xl px-4 py-3 text-sm text-stone-100 focus:outline-none focus:border-[#C9A227]"
              >
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            {/* Party Size */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-200/80 mb-1.5">
                Guests Count *
              </label>
              <select
                value={formData.partySize}
                onChange={(e) => setFormData({ ...formData, partySize: Number(e.target.value) })}
                className="w-full bg-[#2C1B17] border border-[#C9A227]/30 rounded-xl px-4 py-3 text-sm text-stone-100 focus:outline-none focus:border-[#C9A227]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? "Guest" : "Guests"}
                  </option>
                ))}
              </select>
            </div>

            {/* Table Preference */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-200/80 mb-1.5">
                Table Preference
              </label>
              <select
                value={formData.tablePreference}
                onChange={(e) => setFormData({ ...formData, tablePreference: e.target.value })}
                className="w-full bg-[#2C1B17] border border-[#C9A227]/30 rounded-xl px-4 py-3 text-sm text-stone-100 focus:outline-none focus:border-[#C9A227]"
              >
                {preferences.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-200/80 mb-1.5">
              Special Requests or Occasion (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              placeholder="e.g. High chair needed, business presentation setup, quiet birthday corner..."
              className="w-full bg-[#2C1B17] border border-[#C9A227]/30 rounded-xl px-4 py-3 text-sm text-stone-100 focus:outline-none focus:border-[#C9A227]"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#C9A227] to-[#B8921F] hover:from-[#d6ad2a] hover:to-[#c29b21] text-[#2C1B17] font-black text-sm uppercase tracking-wider py-4 rounded-2xl shadow-xl hover:scale-[1.01] transition duration-200 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Confirming Reservation...</span>
            ) : (
              <>
                <Calendar className="w-5 h-5 text-[#2C1B17]" />
                <span>Confirm Table Booking</span>
              </>
            )}
          </button>

        </form>
      )}

    </div>
  );

  if (isOpenModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
        <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <button
            onClick={onCloseModal}
            className="absolute top-4 right-6 z-20 text-amber-200/80 hover:text-white text-xl font-bold bg-black/40 w-9 h-9 rounded-full flex items-center justify-center"
          >
            ✕
          </button>
          {content}
        </div>
      </div>
    );
  }

  return (
    <section id="reservation" className="py-20 bg-[#2C1B17] relative">
      {content}
    </section>
  );
}
