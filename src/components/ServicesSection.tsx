"use client";

import { UtensilsCrossed, ShoppingBag, Truck, Briefcase, ArrowUpRight, ShieldCheck } from "lucide-react";

interface ServicesProps {
  onOpenOrderModal: () => void;
  onOpenReservationModal: () => void;
}

export default function ServicesSection({ onOpenOrderModal, onOpenReservationModal }: ServicesProps) {
  const services = [
    {
      icon: UtensilsCrossed,
      title: "Dine-In",
      desc: "Enjoy freshly prepared meals, aromatic macchiato, and fresh juices in our cozy, ambient dining space in Addis Ababa.",
      actionLabel: "Reserve Table",
      actionFn: onOpenReservationModal,
      badge: "In-House Hospitality",
    },
    {
      icon: ShoppingBag,
      title: "Takeaway",
      desc: "In a hurry? Order your coffee, breakfast combo, or club sandwiches ahead of time and grab them on the go.",
      actionLabel: "Order Takeaway",
      actionFn: onOpenOrderModal,
      badge: "Fast Pick-Up",
    },
    {
      icon: Truck,
      title: "Delivery",
      desc: "Enjoy Fana Cafe specialties brought straight to your home or office anywhere across Addis Ababa with thermal care.",
      actionLabel: "Order Delivery",
      actionFn: onOpenOrderModal,
      badge: "Direct To Door",
    },
    {
      icon: Briefcase,
      title: "Business & Meetings",
      desc: "A quiet, professional space equipped with comfortable seating and great coffee for productive team catch-ups.",
      actionLabel: "Book Meeting Table",
      actionFn: onOpenReservationModal,
      badge: "Productive Vibe",
    },
  ];

  return (
    <section id="services" className="py-20 bg-[#2C1B17] text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A227]/20 border border-[#C9A227]/40 text-[#C9A227] text-xs font-bold uppercase tracking-widest mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Tailored Hospitality</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-amber-100">
            Our Core Services
          </h2>

          <p className="text-stone-300 text-sm sm:text-base mt-3 font-light">
            We make it effortless to enjoy your favorite food and drinks however you choose.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div
                key={idx}
                className="bg-[#3D2314]/80 backdrop-blur-md p-6 rounded-3xl border border-[#C9A227]/20 hover:border-[#C9A227]/60 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C9A227] to-[#B8921F] flex items-center justify-center text-[#2C1B17] shadow-lg group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-[#C9A227] bg-[#C9A227]/10 px-2 py-0.5 rounded border border-[#C9A227]/20">
                      {srv.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-stone-100 group-hover:text-[#C9A227] transition-colors">
                    {srv.title}
                  </h3>

                  <p className="text-stone-300 text-xs mt-2 leading-relaxed font-light">
                    {srv.desc}
                  </p>
                </div>

                <button
                  onClick={srv.actionFn}
                  className="mt-6 flex items-center justify-between w-full pt-3 border-t border-stone-800 text-xs font-extrabold text-[#C9A227] hover:text-amber-300 transition"
                >
                  <span>{srv.actionLabel}</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
