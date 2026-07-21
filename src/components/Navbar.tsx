"use client";

import { useState } from "react";
import { Coffee, ShoppingBag, Calendar, Lock, Menu, X, Phone, ShieldCheck, LayoutDashboard } from "lucide-react";
import { SiteSettings } from "@/types";
import Link from "next/link";

interface NavbarProps {
  settings: SiteSettings;
  cartCount: number;
  onOpenCart: () => void;
  onOpenReservation: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export default function Navbar({
  settings,
  cartCount,
  onOpenCart,
  onOpenReservation,
  onOpenAdmin,
  isAdminLoggedIn,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  const phone = settings.phone || "0911 065 022";
  const cafeName = settings.cafe_name || "FANA CAFE";
  const announcement = settings.announcement || "☕ Welcome to Fana Cafe! Dine-In, Takeaway & Delivery available. Call 0911 065 022.";

  const navLinks = [
    { label: "Home", href: "#hero" },
    { label: "About", href: "#about" },
    { label: "Why Fana", href: "#why-us" },
    { label: "Menu", href: "#menu" },
    { label: "Services", href: "#services" },
    { label: "Gallery", href: "#gallery" },
    { label: "Reviews", href: "#reviews" },
    { label: "Find Us", href: "#contact" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      {/* Announcement Bar */}
      {showAnnouncement && announcement && (
        <div className="bg-[#2C1B17] text-[#FAF6F0] px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-between border-b border-[#C9A227]/30">
          <div className="flex items-center gap-2 max-w-6xl mx-auto text-center overflow-hidden whitespace-nowrap text-ellipsis">
            <span className="inline-block bg-[#C9A227] text-[#2C1B17] px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
              22 Square Bole
            </span>
            <span className="truncate">{announcement}</span>
          </div>
          <button
            onClick={() => setShowAnnouncement(false)}
            className="text-amber-200/70 hover:text-white transition-colors ml-2 focus:outline-none"
            aria-label="Close announcement"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Navigation Bar */}
      <nav className="glass-dark border-b border-[#C9A227]/20 shadow-xl px-4 lg:px-8 py-3 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (isAdminLoggedIn) {
                window.location.href = "/";
              } else {
                handleNavClick(e, "#hero");
              }
            }}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9A227] to-[#8C6D18] flex items-center justify-center text-[#2C1B17] shadow-md group-hover:scale-105 transition-transform">
              <Coffee className="w-5 h-5 text-[#2C1B17]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-wider text-white font-serif group-hover:text-[#C9A227] transition-colors">
                {cafeName}
              </span>
              <span className="text-[10px] text-[#C9A227] tracking-widest uppercase font-semibold">
                Golagul Bldg, Addis Ababa
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-5 text-xs xl:text-sm font-medium text-stone-200">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="hover:text-[#C9A227] transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#C9A227] hover:after:w-full after:transition-all"
              >
                {link.label}
              </a>
            ))}

            {/* Dedicated /admin Link */}
            <Link
              href="/admin"
              className="text-[#C9A227] hover:underline flex items-center gap-1 font-bold text-xs bg-[#C9A227]/10 px-2.5 py-1 rounded-lg border border-[#C9A227]/30"
              title="Open Dedicated Admin Dashboard"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Admin Dashboard</span>
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2.5">
            {/* Phone Quick Call */}
            <a
              href={`tel:${phone.replace(/\s+/g, "")}`}
              className="hidden xl:flex items-center gap-1.5 text-xs text-[#FAF6F0] bg-white/10 hover:bg-white/20 px-3 py-2 rounded-full transition border border-white/10"
              title="Call Fana Cafe"
            >
              <Phone className="w-3.5 h-3.5 text-[#C9A227]" />
              <span className="font-semibold">{phone}</span>
            </a>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2 text-stone-200 hover:text-[#C9A227] hover:bg-white/10 rounded-full transition focus:outline-none"
              aria-label="View Order Cart"
              title="Order Cart"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-[#C9A227]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C9A227] text-[#2C1B17] text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Reserve Table Button */}
            <button
              onClick={onOpenReservation}
              className="hidden sm:inline-flex items-center gap-1.5 bg-gradient-to-r from-[#C9A227] to-[#B8921F] hover:from-[#d1ab30] hover:to-[#c49b23] text-[#2C1B17] font-bold text-xs uppercase tracking-wider px-3.5 py-2 rounded-full shadow-lg hover:shadow-amber-500/20 hover:scale-105 transition duration-200"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Reserve Table</span>
            </button>

            {/* Admin Controls Toggle */}
            <button
              onClick={onOpenAdmin}
              className={`p-2 rounded-full transition flex items-center gap-1 text-xs font-semibold ${
                isAdminLoggedIn
                  ? "bg-emerald-600 text-white shadow-md hover:bg-emerald-500 px-3"
                  : "text-amber-200/80 hover:text-amber-300 hover:bg-white/10"
              }`}
              title={isAdminLoggedIn ? "Admin Control Active" : "Admin Password Switch"}
            >
              {isAdminLoggedIn ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span className="hidden md:inline">Admin Mode</span>
                </>
              ) : (
                <Lock className="w-5 h-5 text-[#C9A227]" />
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-stone-200 hover:text-amber-400 focus:outline-none"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-amber-900/40 animate-fadeIn space-y-3 pb-3">
            <div className="grid grid-cols-2 gap-2 px-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="block px-3 py-2 text-xs text-stone-200 hover:bg-[#C9A227]/20 hover:text-[#C9A227] rounded-lg transition"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-amber-900/40 px-2">
              <Link
                href="/admin"
                className="w-full flex items-center justify-center gap-2 bg-[#C9A227]/20 text-[#C9A227] font-bold text-xs py-2.5 rounded-xl border border-[#C9A227]/40"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Open Admin Dashboard (/admin)</span>
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenReservation();
                }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#C9A227] to-[#B8921F] text-[#2C1B17] font-bold text-xs py-2.5 rounded-xl shadow-md uppercase"
              >
                <Calendar className="w-4 h-4" />
                <span>Reserve Table</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
