"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Utensils,
  Calendar,
  ShoppingBag,
  Star,
  Lock,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Save,
  LogOut,
  RefreshCw,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  Bell,
  BellRing,

  Camera,
  Layers,
  Sparkles
} from "lucide-react";
import { MenuItem, SiteSettings, Reservation, Order, Review, Category, GalleryItem } from "@/types";
import { triggerDesktopNotification } from "@/lib/notifications";

interface AdminPanelProps {
  settings: SiteSettings;
  menuItems: MenuItem[];
  categories: Category[];
  reservations: Reservation[];
  orders: Order[];
  reviews: Review[];
  galleryItems?: GalleryItem[];
  onRefreshData: () => void;
  onLogout: () => void;
}

export default function AdminPanel({
  settings,
  menuItems,
  categories,
  reservations,
  orders,
  reviews,
  galleryItems = [],
  onRefreshData,
  onLogout,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"settings" | "menu" | "gallery" | "reservations" | "orders" | "reviews" | "security">("orders");

  // Cashier Desktop Notification State
  const [lastNotifiedCount, setLastNotifiedCount] = useState<number>(0);

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    cafe_name: settings.cafe_name || "Fana Cafe & Restaurant",
    tagline: settings.tagline || "Where Great Coffee Meets Beautiful Moments in Addis Ababa",
    hero_title: settings.hero_title || "Where Great Coffee Meets Beautiful Moments",
    hero_subtitle: settings.hero_subtitle || "A cozy café and restaurant located at Golagul Building, 22 Square (Djibouti Street, Bole, Addis Ababa)...",
    hero_bg_image: settings.hero_bg_image || "https://images.pexels.com/photos/16563658/pexels-photo-16563658.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1080&w=1920",
    phone: settings.phone || "0911 065 022",
    address: settings.address || "Golagul Building, 22 Square, Djibouti Street, Bole, Addis Ababa, Ethiopia",
    plus_code: settings.plus_code || "2Q7Q+W2 Addis Ababa",
    opening_hours: settings.opening_hours || "Open Daily Until 8:30 PM (Hours may vary during holidays)",
    announcement: settings.announcement || "☕ Welcome to Fana Cafe (22 Square, Golagul Building)! Dine-In, Takeaway & Delivery available.",
    delivery_fee: settings.delivery_fee || "50",
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState("");

  // Menu Item Modal State
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [isMenuSubmitting, setIsMenuSubmitting] = useState(false);

  // Gallery Item Modal State
  const [editingGallery, setEditingGallery] = useState<Partial<GalleryItem> | null>(null);
  const [isGallerySubmitting, setIsGallerySubmitting] = useState(false);

  // Security State
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");

  // Pending Orders & Reservations Count
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "preparing");
  const pendingReservations = reservations.filter((r) => r.status === "pending" || r.status === "confirmed");
  const totalPendingNotifications = pendingOrders.length + pendingReservations.length;

  // Active vs archived orders for the cashier workflow
  const activeOrders = orders.filter((o) => o.status !== "completed" && o.status !== "cancelled");
  const historyOrders = orders.filter((o) => o.status === "completed" || o.status === "cancelled");

  // Parse order items safely (DB stores JSON string)
  const parseOrderItems = (items: Order["items"]): Array<{ name: string; price: number; quantity: number }> => {
    try {
      const parsed = typeof items === "string" ? JSON.parse(items) : items;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // Delete an order from history
  const handleDeleteOrder = async (id: number) => {
    if (!confirm("Permanently delete this order record?")) return;
    try {
      const res = await fetch(`/api/orders?id=${id}`, { method: "DELETE" });
      if (res.ok) onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // Desktop Notification Only Effect
  useEffect(() => {
    if (totalPendingNotifications > lastNotifiedCount) {
      // Desktop Popup Notification only (no sound chime)
      triggerDesktopNotification({
        title: "Fana Cafe Alert",
        message: `New activity detected! ${pendingOrders.length > 0 ? `${pendingOrders.length} order(s)` : ""}${pendingOrders.length > 0 && pendingReservations.length > 0 ? " + " : ""}${pendingReservations.length > 0 ? `${pendingReservations.length} table reservation(s)` : ""} pending!`,
      });
    }
    setLastNotifiedCount(totalPendingNotifications);
  }, [totalPendingNotifications, pendingOrders.length, pendingReservations.length]);

  // Handle Device Image Upload for Hero BG
  const handleHeroBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image smaller than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Data = uploadEvent.target?.result as string;
      if (base64Data) {
        setSettingsForm((prev) => ({
          ...prev,
          hero_bg_image: base64Data,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Device Image Upload for Menu Items
  const handleMenuImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image smaller than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Data = uploadEvent.target?.result as string;
      if (base64Data) {
        setEditingItem({
          ...editingItem,
          imageUrl: base64Data,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Device Image Upload for Gallery
  const handleGalleryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingGallery) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image smaller than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Data = uploadEvent.target?.result as string;
      if (base64Data) {
        setEditingGallery({
          ...editingGallery,
          imageUrl: base64Data,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // 1. Save Site Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMsg("");

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm),
      });

      if (res.ok) {
        setSettingsMsg("Website content & Hero background updated successfully!");
        onRefreshData();
      } else {
        setSettingsMsg("Failed to update settings.");
      }
    } catch (err) {
      setSettingsMsg("Network error.");
    } finally {
      setSavingSettings(false);
    }
  };

  // 2. Save Menu Item
  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsMenuSubmitting(true);
    try {
      const method = editingItem.id ? "PUT" : "POST";
      const res = await fetch("/api/menu", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem),
      });

      const data = await res.json();
      if (res.ok) {
        setEditingItem(null);
        onRefreshData();
        alert(editingItem.id ? "Menu item updated!" : "New menu item added successfully!");
      } else {
        alert("Failed to save menu item: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Error: " + String(err));
      console.error(err);
    } finally {
      setIsMenuSubmitting(false);
    }
  };

  // 3. Delete Menu Item
  const handleDeleteMenuItem = async (id: number) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    try {
      const res = await fetch(`/api/menu?id=${id}`, { method: "DELETE" });
      if (res.ok) onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Save Gallery Item
  const handleSaveGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGallery) return;

    setIsGallerySubmitting(true);
    try {
      const method = editingGallery.id ? "PUT" : "POST";
      const res = await fetch("/api/gallery", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingGallery),
      });

      const data = await res.json();
      if (res.ok) {
        setEditingGallery(null);
        onRefreshData();
        alert(editingGallery.id ? "Gallery photo updated!" : "Gallery photo added successfully!");
      } else {
        alert("Failed to save gallery: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Error: " + String(err));
      console.error(err);
    } finally {
      setIsGallerySubmitting(false);
    }
  };

  // Delete Gallery Item
  const handleDeleteGalleryItem = async (id: number) => {
    if (!confirm("Delete this photo from gallery?")) return;
    try {
      const res = await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
      if (res.ok) onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // Update Reservation Status
  const handleUpdateReservationStatus = async (id: number, status: string) => {
    try {
      const res = await fetch("/api/reservations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (id: number, status: string) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // Update Admin Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      setPasswordMsg("Password must be at least 4 characters.");
      return;
    }

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_password: newPassword }),
      });

      if (res.ok) {
        setPasswordMsg("Admin password updated successfully!");
        setNewPassword("");
      }
    } catch (err) {
      setPasswordMsg("Error updating password.");
    }
  };

  return (
    <div className="bg-[#1C120F] text-white min-h-screen p-4 sm:p-8">
      
      {/* CASHIER REAL-TIME NOTIFICATION ALERT BANNER */}
      {totalPendingNotifications > 0 && (
        <div className="max-w-7xl mx-auto mb-6 bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-amber-300 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black/30 rounded-xl">
              <BellRing className="w-6 h-6 text-amber-200 animate-bounce" />
            </div>
            <div>
              <p className="font-bold text-sm sm:text-base uppercase tracking-wider">
                🔔 Cashier Alert: {totalPendingNotifications} Active Orders & Table Bookings Pending!
              </p>
              <p className="text-xs text-amber-100 font-light">
                {pendingOrders.length} online takeaway/delivery orders & {pendingReservations.length} table bookings requiring review.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerDesktopNotification({ title: "Fana Cafe Alert", message: "Test desktop notification popup!" })}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-[#2C1B17] rounded-xl text-xs font-extrabold shadow-lg transition"
            >
              Test Popup Alert
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-[#C9A227]/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C9A227] text-[#2C1B17] font-bold flex items-center justify-center relative">
            <Lock className="w-5 h-5" />
            {totalPendingNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-ping">
                {totalPendingNotifications}
              </span>
            )}
          </div>
          <div>
            <h1 className="font-serif font-black text-2xl text-amber-100">
              Fana Cafe Admin Dashboard
            </h1>
            <p className="text-xs text-amber-200/70">
              Live editor for hero background photo, menu, gallery, prices in ETB, orders & bookings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefreshData}
            className="p-2 bg-white/10 hover:bg-white/20 text-amber-200 rounded-xl text-xs flex items-center gap-1.5 font-semibold transition"
            title="Refresh DB Data"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>

          <button
            onClick={onLogout}
            className="p-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs flex items-center gap-1.5 font-bold transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit Admin</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="max-w-7xl mx-auto my-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap relative ${
            activeTab === "orders"
              ? "bg-[#C9A227] text-[#2C1B17]"
              : "bg-[#2C1B17] text-stone-300 hover:bg-white/10"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Online Orders ({orders.length})</span>
          {pendingOrders.length > 0 && (
            <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              {pendingOrders.length} New
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("reservations")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap relative ${
            activeTab === "reservations"
              ? "bg-[#C9A227] text-[#2C1B17]"
              : "bg-[#2C1B17] text-stone-300 hover:bg-white/10"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Table Bookings ({reservations.length})</span>
          {pendingReservations.length > 0 && (
            <span className="bg-amber-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow">
              {pendingReservations.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "settings"
              ? "bg-[#C9A227] text-[#2C1B17]"
              : "bg-[#2C1B17] text-stone-300 hover:bg-white/10"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Website Copy & Hero Photo</span>
        </button>

        <button
          onClick={() => setActiveTab("menu")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "menu"
              ? "bg-[#C9A227] text-[#2C1B17]"
              : "bg-[#2C1B17] text-stone-300 hover:bg-white/10"
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Menu & Food Photos ({menuItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("gallery")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "gallery"
              ? "bg-[#C9A227] text-[#2C1B17]"
              : "bg-[#2C1B17] text-stone-300 hover:bg-white/10"
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Gallery Manager ({galleryItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("reviews")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "reviews"
              ? "bg-[#C9A227] text-[#2C1B17]"
              : "bg-[#2C1B17] text-stone-300 hover:bg-white/10"
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Reviews ({reviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "security"
              ? "bg-[#C9A227] text-[#2C1B17]"
              : "bg-[#2C1B17] text-stone-300 hover:bg-white/10"
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Admin Password</span>
        </button>
      </div>

      {/* Main Tab Panels */}
      <div className="max-w-7xl mx-auto">
        
        {/* TAB 1: WEBSITE CONTENT SETTINGS & HERO BG PHOTO */}
        {activeTab === "settings" && (
          <form onSubmit={handleSaveSettings} className="bg-[#2C1B17] p-6 sm:p-8 rounded-3xl border border-[#C9A227]/30 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-amber-100">Main Website Copy & Background Photo</h2>
                <p className="text-xs text-stone-400">Upload background photo for hero banner, edit titles, phone number, and announcement text.</p>
              </div>
              <button
                type="submit"
                disabled={savingSettings}
                className="bg-[#C9A227] hover:bg-amber-400 text-[#2C1B17] font-bold text-xs uppercase px-6 py-3 rounded-xl flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{savingSettings ? "Saving..." : "Save Website Info"}</span>
              </button>
            </div>

            {settingsMsg && (
              <div className="bg-emerald-900/60 border border-emerald-500 text-emerald-200 text-xs p-3 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{settingsMsg}</span>
              </div>
            )}

            {/* HERO BACKGROUND PHOTO UPLOAD */}
            <div className="bg-[#3D2314] p-5 rounded-2xl border border-[#C9A227]/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-amber-200 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#C9A227]" />
                    <span>Hero Section Background Photo</span>
                  </h3>
                  <p className="text-[11px] text-stone-400">This photo appears behind "Where Great Coffee Meets Beautiful Moments" when visitors open the site.</p>
                </div>
              </div>

              {/* Current Hero BG Preview */}
              {settingsForm.hero_bg_image && (
                <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-stone-700 bg-stone-900 shadow-inner">
                  <img
                    src={settingsForm.hero_bg_image}
                    alt="Hero Background Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 bg-black/80 text-[#C9A227] text-xs font-bold px-3 py-1 rounded-full border border-[#C9A227]/40">
                    Current Cafe Background Preview
                  </span>
                </div>
              )}

              {/* Device Upload Button */}
              <div className="pt-2">
                <label className="flex items-center justify-center gap-2 w-full bg-[#C9A227] hover:bg-amber-400 text-[#2C1B17] font-extrabold text-xs py-3 px-4 rounded-xl cursor-pointer shadow transition">
                  <Upload className="w-4 h-4" />
                  <span>Upload Custom Cafe Image From Device (Computer / Phone)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeroBgUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Image URL fallback */}
              <div className="pt-2 border-t border-stone-800">
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">Or paste background image web URL:</label>
                <input
                  type="text"
                  value={settingsForm.hero_bg_image}
                  onChange={(e) => setSettingsForm({ ...settingsForm, hero_bg_image: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-[#2C1B17] border border-stone-700 rounded-xl p-2.5 text-xs text-stone-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1">Café Name</label>
                <input
                  type="text"
                  value={settingsForm.cafe_name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, cafe_name: e.target.value })}
                  className="w-full bg-[#3D2314] border border-stone-700 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1">Tagline</label>
                <input
                  type="text"
                  value={settingsForm.tagline}
                  onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                  className="w-full bg-[#3D2314] border border-stone-700 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-amber-200 mb-1">Hero Title</label>
                <input
                  type="text"
                  value={settingsForm.hero_title}
                  onChange={(e) => setSettingsForm({ ...settingsForm, hero_title: e.target.value })}
                  className="w-full bg-[#3D2314] border border-stone-700 rounded-xl p-3 text-xs text-white font-bold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-amber-200 mb-1">Hero Subtitle</label>
                <textarea
                  rows={2}
                  value={settingsForm.hero_subtitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, hero_subtitle: e.target.value })}
                  className="w-full bg-[#3D2314] border border-stone-700 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={settingsForm.phone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                  className="w-full bg-[#3D2314] border border-stone-700 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1">Plus Code (Google Maps)</label>
                <input
                  type="text"
                  value={settingsForm.plus_code}
                  onChange={(e) => setSettingsForm({ ...settingsForm, plus_code: e.target.value })}
                  className="w-full bg-[#3D2314] border border-stone-700 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1">Opening Hours Text</label>
                <input
                  type="text"
                  value={settingsForm.opening_hours}
                  onChange={(e) => setSettingsForm({ ...settingsForm, opening_hours: e.target.value })}
                  className="w-full bg-[#3D2314] border border-stone-700 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1">Delivery Fee (ETB)</label>
                <input
                  type="number"
                  value={settingsForm.delivery_fee}
                  onChange={(e) => setSettingsForm({ ...settingsForm, delivery_fee: e.target.value })}
                  className="w-full bg-[#3D2314] border border-stone-700 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-amber-200 mb-1">Header Announcement Text</label>
                <input
                  type="text"
                  value={settingsForm.announcement}
                  onChange={(e) => setSettingsForm({ ...settingsForm, announcement: e.target.value })}
                  className="w-full bg-[#3D2314] border border-stone-700 rounded-xl p-3 text-xs text-white"
                />
              </div>

            </div>
          </form>
        )}

        {/* TAB 2: MENU & PRICES MANAGER */}
        {activeTab === "menu" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-bold text-amber-100">Homepage Menu & Price Manager</h2>
                <p className="text-xs text-stone-400">Add food/drinks, change prices in ETB, upload photos directly from your device, or toggle availability.</p>
              </div>

              <button
                onClick={() =>
                  setEditingItem({
                    id: undefined,
                    name: "",
                    category: "signature-coffee",
                    price: 120,
                    description: "",
                    imageUrl: "https://images.pexels.com/photos/16563658/pexels-photo-16563658.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
                    isPopular: false,
                    isAvailable: true,
                    dietaryTags: "Vegetarian",
                    prepTime: "10 min",
                    badge: "",
                  })
                }
                className="bg-[#C9A227] hover:bg-amber-400 text-[#2C1B17] font-bold text-xs uppercase px-5 py-3 rounded-2xl flex items-center gap-2 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Food / Drink</span>
              </button>
            </div>

            {/* Menu Table */}
            <div className="bg-[#2C1B17] rounded-3xl border border-[#C9A227]/30 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#3D2314] text-amber-200 uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4">Item & Photo</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price (ETB)</th>
                      <th className="p-4">Badge</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800">
                    {menuItems.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-900/40">
                        <td className="p-4 flex items-center gap-3">
                          <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-amber-500/30" />
                          <div>
                            <p className="font-bold text-amber-100 text-sm">{item.name}</p>
                            <p className="text-[11px] text-stone-400 line-clamp-1 max-w-xs">{item.description}</p>
                          </div>
                        </td>

                        <td className="p-4 font-semibold text-stone-300 capitalize">
                          {item.category.replace("-", " ")}
                        </td>

                        <td className="p-4 font-serif font-black text-[#C9A227] text-sm">
                          {item.price} ETB
                        </td>

                        <td className="p-4">
                          {item.badge ? (
                            <span className="bg-[#C9A227]/20 text-[#C9A227] border border-[#C9A227]/40 px-2.5 py-1 rounded text-[10px] font-bold">
                              {item.badge}
                            </span>
                          ) : (
                            <span className="text-stone-600">—</span>
                          )}
                        </td>

                        <td className="p-4">
                          {item.isAvailable ? (
                            <span className="text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded text-[10px] font-bold border border-emerald-800">
                              In Stock
                            </span>
                          ) : (
                            <span className="text-rose-400 bg-rose-950/60 px-2.5 py-1 rounded text-[10px] font-bold border border-rose-800">
                              Sold Out
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-2 bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black rounded-lg transition"
                            title="Edit Item & Upload Photo"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMenuItem(item.id)}
                            className="p-2 bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white rounded-lg transition"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GALLERY MANAGER WITH DEVICE PHOTO UPLOADS */}
        {activeTab === "gallery" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-bold text-amber-100">Photo Gallery Manager</h2>
                <p className="text-xs text-stone-400">Add, edit, or upload custom photos from your device to display in the website gallery.</p>
              </div>

              <button
                onClick={() =>
                  setEditingGallery({
                    title: "",
                    category: "Coffee",
                    imageUrl: "https://images.pexels.com/photos/16563658/pexels-photo-16563658.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
                    caption: "",
                  })
                }
                className="bg-[#C9A227] hover:bg-amber-400 text-[#2C1B17] font-bold text-xs uppercase px-5 py-3 rounded-2xl flex items-center gap-2 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Add Gallery Photo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((gal) => (
                <div key={gal.id} className="bg-[#2C1B17] rounded-3xl overflow-hidden border border-[#C9A227]/30 shadow-xl flex flex-col justify-between">
                  <div className="relative h-48 bg-stone-900">
                    <img src={gal.imageUrl} alt={gal.title} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 bg-black/70 text-[#C9A227] text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border border-[#C9A227]/40">
                      {gal.category}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-serif font-bold text-amber-100 text-sm">{gal.title}</h3>
                    {gal.caption && <p className="text-stone-400 text-xs line-clamp-2">{gal.caption}</p>}
                  </div>

                  <div className="p-4 pt-0 flex justify-end gap-2">
                    <button
                      onClick={() => setEditingGallery(gal)}
                      className="p-2 bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black rounded-lg text-xs font-bold transition flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Photo
                    </button>
                    <button
                      onClick={() => handleDeleteGalleryItem(gal.id)}
                      className="p-2 bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: TABLE RESERVATIONS MANAGER */}
        {activeTab === "reservations" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-amber-100">Table Reservations Manager</h2>
              <p className="text-xs text-stone-400">View guest bookings, preferences, phone contacts, and status.</p>
            </div>

            <div className="bg-[#2C1B17] rounded-3xl border border-[#C9A227]/30 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#3D2314] text-amber-200 uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4">Ref Code</th>
                      <th className="p-4">Guest Name</th>
                      <th className="p-4">Phone</th>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4">Guests & Preference</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800">
                    {reservations.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-stone-500">
                          No reservations logged yet.
                        </td>
                      </tr>
                    ) : (
                      reservations.map((res) => (
                        <tr key={res.id} className="hover:bg-stone-900/40">
                          <td className="p-4 font-mono font-bold text-[#C9A227]">
                            {res.reservationNumber}
                          </td>
                          <td className="p-4 font-bold text-amber-100">{res.guestName}</td>
                          <td className="p-4 text-stone-300">{res.phone}</td>
                          <td className="p-4 text-amber-200 font-medium">
                            {res.date} @ {res.time}
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-white">{res.partySize} Guests</span>
                            <span className="text-stone-400 block text-[10px]">{res.tablePreference}</span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                                res.status === "confirmed"
                                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                  : res.status === "cancelled"
                                  ? "bg-rose-950 text-rose-400 border border-rose-800"
                                  : "bg-amber-950 text-amber-400 border border-amber-800"
                              }`}
                            >
                              {res.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-1">
                            <button
                              onClick={() => handleUpdateReservationStatus(res.id, "confirmed")}
                              className="px-2.5 py-1 bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600 hover:text-white rounded text-[10px] font-bold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateReservationStatus(res.id, "cancelled")}
                              className="px-2.5 py-1 bg-rose-600/30 text-rose-300 hover:bg-rose-600 hover:text-white rounded text-[10px] font-bold"
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ONLINE ORDERS MANAGER */}
        {activeTab === "orders" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-serif font-bold text-amber-100">Takeaway & Delivery Orders</h2>
              <p className="text-xs text-stone-400">
                Workflow: New order → click <strong>Accept & Prepare</strong> → when ready, click <strong>Mark Completed</strong> → order moves to History below.
              </p>
            </div>

            {/* ACTIVE ORDERS (pending + preparing) */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-amber-200 uppercase tracking-wider flex items-center gap-2">
                <BellRing className="w-4 h-4 text-[#C9A227]" />
                Active Orders ({activeOrders.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeOrders.length === 0 ? (
                  <div className="col-span-2 p-8 bg-[#2C1B17] rounded-3xl text-center text-stone-500 border border-stone-800 text-xs">
                    No active orders right now. New customer orders will appear here automatically.
                  </div>
                ) : (
                  activeOrders.map((ord) => {
                    const itemsList = parseOrderItems(ord.items);
                    const isPending = ord.status === "pending";
                    const isPreparing = ord.status === "preparing";

                    return (
                      <div
                        key={ord.id}
                        className={`bg-[#2C1B17] p-5 rounded-3xl border shadow-xl space-y-3 ${
                          isPreparing ? "border-sky-500/50" : "border-[#C9A227]/40"
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                          <div>
                            <span className="font-mono text-xs font-bold text-[#C9A227]">
                              {ord.orderNumber}
                            </span>
                            <span className="text-[10px] uppercase font-extrabold text-stone-400 block">
                              Type: {ord.orderType}
                            </span>
                          </div>
                          <span className="text-lg font-serif font-black text-amber-200">
                            {ord.totalAmount} ETB
                          </span>
                        </div>

                        <div className="text-xs space-y-1">
                          <p className="font-bold text-amber-100">{ord.customerName} ({ord.phone})</p>
                          <p className="text-stone-400 text-[11px]">{ord.address}</p>
                        </div>

                        <div className="bg-[#3D2314] p-3 rounded-2xl border border-stone-800 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-amber-300">Items:</span>
                          <ul className="text-xs space-y-1 text-stone-300">
                            {itemsList.map((it: any, i: number) => (
                              <li key={i} className="flex justify-between">
                                <span>• {it.name} x{it.quantity}</span>
                                <span className="font-bold">{it.price * it.quantity} ETB</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Status chip + workflow action */}
                        <div className="flex items-center justify-between pt-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              isPending
                                ? "bg-amber-500/20 text-amber-300 animate-pulse"
                                : "bg-sky-500/20 text-sky-300"
                            }`}
                          >
                            {isPending ? "🔔 New Order" : "👨‍🍳 Preparing..."}
                          </span>

                          <div className="flex gap-1.5">
                            {isPending && (
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.id, "preparing")}
                                className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-bold hover:bg-sky-500 shadow"
                              >
                                Accept & Prepare
                              </button>
                            )}
                            {isPreparing && (
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.id, "completed")}
                                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-500 shadow"
                              >
                                ✓ Mark Completed
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (confirm("Cancel this order?")) handleUpdateOrderStatus(ord.id, "cancelled");
                              }}
                              className="px-3 py-1.5 bg-rose-900/60 text-rose-300 rounded-lg text-xs font-bold hover:bg-rose-700 hover:text-white"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ORDER HISTORY (completed + cancelled) */}
            <div className="space-y-4 pt-4 border-t border-stone-800">
              <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Order History ({historyOrders.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {historyOrders.length === 0 ? (
                  <div className="col-span-3 p-5 bg-[#2C1B17] rounded-2xl text-center text-stone-500 border border-stone-800 text-xs">
                    Completed orders will be archived here after you click "Mark Completed".
                  </div>
                ) : (
                  historyOrders.map((ord) => {
                    const itemsList = parseOrderItems(ord.items);
                    const isDone = ord.status === "completed";
                    return (
                      <div
                        key={ord.id}
                        className="bg-[#241714] p-4 rounded-2xl border border-stone-800 space-y-2 opacity-80"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold text-stone-400">
                            {ord.orderNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              isDone
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-rose-500/20 text-rose-400"
                            }`}
                          >
                            {isDone ? "✓ COMPLETED" : "✗ CANCELLED"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-stone-400">
                          <span className="truncate">{ord.customerName} • {itemsList.length} item(s)</span>
                          <span className="font-bold text-amber-200/80">{ord.totalAmount} ETB</span>
                        </div>
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleDeleteOrder(ord.id)}
                            className="text-[10px] text-rose-500 hover:underline font-bold"
                          >
                            Delete from history
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: REVIEWS MODERATION */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-amber-100">Customer Reviews Moderation</h2>
              <p className="text-xs text-stone-400">Approve, edit, or delete customer feedback on the homepage.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-[#2C1B17] p-5 rounded-3xl border border-[#C9A227]/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-amber-100 text-sm">{rev.customerName}</h4>
                      <p className="text-[10px] text-stone-400">{rev.reviewDate}</p>
                    </div>
                    <div className="text-[#C9A227] font-bold">★ {rev.rating}/5</div>
                  </div>

                  <p className="text-xs text-stone-300 italic">"{rev.reviewText}"</p>

                  <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs">
                    <span className={rev.isApproved ? "text-emerald-400" : "text-amber-400"}>
                      {rev.isApproved ? "✓ Displayed on Homepage" : "Pending"}
                    </span>

                    <button
                      onClick={async () => {
                        await fetch(`/api/reviews?id=${rev.id}`, { method: "DELETE" });
                        onRefreshData();
                      }}
                      className="text-rose-400 hover:underline text-[11px]"
                    >
                      Delete Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: ADMIN PASSWORD MANAGEMENT */}
        {activeTab === "security" && (
          <div className="bg-[#2C1B17] p-6 sm:p-8 rounded-3xl border border-[#C9A227]/30 max-w-lg mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-amber-100">Update Admin Security Password</h2>
              <p className="text-xs text-stone-400">Set a new master password to protect this live editor.</p>
            </div>

            {passwordMsg && (
              <div className="bg-amber-900/60 border border-amber-500 text-amber-200 text-xs p-3 rounded-xl">
                {passwordMsg}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1">New Admin Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new admin password"
                    className="w-full bg-[#3D2314] border border-stone-700 rounded-xl p-3 text-xs text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#C9A227] text-[#2C1B17] font-black text-xs uppercase tracking-wider py-3.5 rounded-xl hover:bg-amber-400 transition"
              >
                Update Master Password
              </button>
            </form>
          </div>
        )}

      </div>

      {/* EDIT MENU ITEM MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#2C1B17] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 border border-[#C9A227] shadow-2xl text-white space-y-4">
            
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-serif font-bold text-lg text-amber-100">
                {editingItem.id ? "Edit Menu Item" : "Create New Menu Item"}
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-stone-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveMenuItem} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={editingItem.name || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="e.g. Famous Fana Macchiato"
                  className="w-full bg-[#3D2314] border border-stone-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-amber-200 mb-1">Category *</label>
                  <select
                    value={editingItem.category || "signature-coffee"}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full bg-[#3D2314] border border-stone-700 rounded-xl p-2.5 text-xs text-white"
                  >
                    <option value="signature-coffee">Signature Coffee</option>
                    <option value="fresh-drinks">Fresh Drinks & Juices</option>
                    <option value="food">Ethiopian Traditional Meals</option>
                    <option value="snacks">Sandwiches & Snacks</option>
                    <option value="pastries">Cakes & Pastries</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-200 mb-1">Price (ETB) *</label>
                  <input
                    type="number"
                    required
                    value={editingItem.price || 0}
                    onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                    className="w-full bg-[#3D2314] border border-stone-700 rounded-xl p-2.5 text-xs text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={editingItem.description || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Describe taste, ingredients..."
                  className="w-full bg-[#3D2314] border border-stone-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              {/* PHOTO SELECTION */}
              <div className="bg-[#3D2314] p-4 rounded-2xl border border-[#C9A227]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#C9A227]" />
                    <span>Food/Drink Photo *</span>
                  </label>
                  <span className="text-[10px] text-amber-300 font-medium">Select photo from device</span>
                </div>

                {editingItem.imageUrl && (
                  <div className="relative h-32 w-full rounded-xl overflow-hidden border border-stone-700 bg-stone-900">
                    <img
                      src={editingItem.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div>
                  <label className="flex items-center justify-center gap-2 w-full bg-[#C9A227] hover:bg-amber-400 text-[#2C1B17] font-extrabold text-xs py-2.5 px-4 rounded-xl cursor-pointer shadow transition">
                    <Upload className="w-4 h-4" />
                    <span>Choose Photo From Your Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMenuImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="pt-2 border-t border-stone-800">
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Or paste Image Web URL:</label>
                  <input
                    type="text"
                    value={editingItem.imageUrl || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-[#2C1B17] border border-stone-700 rounded-xl p-2 text-xs text-stone-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-amber-200 mb-1">Badge Title</label>
                  <input
                    type="text"
                    value={editingItem.badge || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, badge: e.target.value })}
                    placeholder="e.g. Best Seller"
                    className="w-full bg-[#3D2314] border border-stone-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-200 mb-1">Prep Time</label>
                  <input
                    type="text"
                    value={editingItem.prepTime || "10 min"}
                    onChange={(e) => setEditingItem({ ...editingItem, prepTime: e.target.value })}
                    className="w-full bg-[#3D2314] border border-stone-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1">Dietary Tags</label>
                <input
                  type="text"
                  value={editingItem.dietaryTags || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, dietaryTags: e.target.value })}
                  placeholder="e.g. Popular, High Protein, Fasting"
                  className="w-full bg-[#3D2314] border border-stone-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-amber-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isAvailable ?? true}
                    onChange={(e) => setEditingItem({ ...editingItem, isAvailable: e.target.checked })}
                    className="w-4 h-4 accent-[#C9A227]"
                  />
                  <span>Is In Stock</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-amber-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isPopular ?? false}
                    onChange={(e) => setEditingItem({ ...editingItem, isPopular: e.target.checked })}
                    className="w-4 h-4 accent-[#C9A227]"
                  />
                  <span>Featured Menu Highlight</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isMenuSubmitting}
                className="w-full bg-gradient-to-r from-[#C9A227] to-[#B8921F] hover:from-[#d6ad2a] hover:to-[#c29b21] text-[#2C1B17] font-black text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-xl transition mt-4"
              >
                {isMenuSubmitting ? "Saving Menu Item..." : "Save Menu Item"}
              </button>

            </form>
          </div>
        </div>
      )}

      {/* EDIT GALLERY ITEM MODAL */}
      {editingGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#2C1B17] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 border border-[#C9A227] shadow-2xl text-white space-y-4">
            
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-serif font-bold text-lg text-amber-100">
                {editingGallery.id ? "Edit Gallery Photo" : "Add New Gallery Photo"}
              </h3>
              <button onClick={() => setEditingGallery(null)} className="text-stone-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveGalleryItem} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1">Photo Title *</label>
                <input
                  type="text"
                  required
                  value={editingGallery.title || ""}
                  onChange={(e) => setEditingGallery({ ...editingGallery, title: e.target.value })}
                  placeholder="e.g. Cozy Seating Area at 22 Square"
                  className="w-full bg-[#3D2314] border border-stone-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1">Gallery Category *</label>
                <select
                  value={editingGallery.category || "Coffee"}
                  onChange={(e) => setEditingGallery({ ...editingGallery, category: e.target.value })}
                  className="w-full bg-[#3D2314] border border-stone-700 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="Coffee">Coffee</option>
                  <option value="Juices">Juices</option>
                  <option value="Meals">Meals</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Interior">Interior</option>
                  <option value="Outdoor">Outdoor</option>
                  <option value="Vibe">Vibe</option>
                </select>
              </div>

              {/* PHOTO UPLOAD BOX */}
              <div className="bg-[#3D2314] p-4 rounded-2xl border border-[#C9A227]/30 space-y-3">
                <label className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[#C9A227]" />
                  <span>Gallery Photo File *</span>
                </label>

                {editingGallery.imageUrl && (
                  <div className="relative h-36 w-full rounded-xl overflow-hidden border border-stone-700 bg-stone-900">
                    <img src={editingGallery.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <div>
                  <label className="flex items-center justify-center gap-2 w-full bg-[#C9A227] hover:bg-amber-400 text-[#2C1B17] font-extrabold text-xs py-2.5 px-4 rounded-xl cursor-pointer shadow transition">
                    <Upload className="w-4 h-4" />
                    <span>Upload Image From Your Computer / Phone</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleGalleryImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="pt-2 border-t border-stone-800">
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Or paste photo URL:</label>
                  <input
                    type="text"
                    value={editingGallery.imageUrl || ""}
                    onChange={(e) => setEditingGallery({ ...editingGallery, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-[#2C1B17] border border-stone-700 rounded-xl p-2 text-xs text-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1">Caption / Description</label>
                <input
                  type="text"
                  value={editingGallery.caption || ""}
                  onChange={(e) => setEditingGallery({ ...editingGallery, caption: e.target.value })}
                  placeholder="e.g. Freshly blended avocado Spris juice"
                  className="w-full bg-[#3D2314] border border-stone-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isGallerySubmitting}
                className="w-full bg-gradient-to-r from-[#C9A227] to-[#B8921F] hover:from-[#d6ad2a] hover:to-[#c29b21] text-[#2C1B17] font-black text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-xl transition mt-4"
              >
                {isGallerySubmitting ? "Saving Gallery Photo..." : "Save Gallery Photo"}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
