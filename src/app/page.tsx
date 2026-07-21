"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import WhyChooseSection from "@/components/WhyChooseSection";
import MenuSection from "@/components/MenuSection";
import ReservationSection from "@/components/ReservationSection";
import ServicesSection from "@/components/ServicesSection";
import GallerySection from "@/components/GallerySection";
import ReviewsSection from "@/components/ReviewsSection";
import LocationSection from "@/components/LocationSection";
import FaqSection from "@/components/FaqSection";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import OrderCartModal from "@/components/OrderCartModal";

import { MenuItem, Category, SiteSettings, Review, GalleryItem } from "@/types";
import { DEFAULT_SETTINGS, DEFAULT_CATEGORIES, DEFAULT_MENU_ITEMS, DEFAULT_REVIEWS, DEFAULT_GALLERY } from "@/lib/initial-data";

export default function HomePage() {
  // Data State
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS as SiteSettings);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES as Category[]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEFAULT_MENU_ITEMS as MenuItem[]);
  const [reviews, setReviews] = useState<Review[]>(DEFAULT_REVIEWS as Review[]);
  const [gallery, setGallery] = useState<GalleryItem[]>(DEFAULT_GALLERY as GalleryItem[]);

  // UI Modal Controls State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Cart State: Item ID -> Quantity
  const [cartMap, setCartMap] = useState<Record<number, number>>({});

  // Fetch all public site data
  const loadSiteData = async () => {
    try {
      await fetch("/api/seed");

      const settingsRes = await fetch("/api/settings");
      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        if (Object.keys(sData).length > 0) setSettings(sData);
      }

      const catRes = await fetch("/api/categories");
      if (catRes.ok) {
        const cData = await catRes.json();
        if (cData.length > 0) setCategories(cData);
      }

      const menuRes = await fetch("/api/menu");
      if (menuRes.ok) {
        const mData = await menuRes.json();
        if (mData.length > 0) setMenuItems(mData);
      }

      const revRes = await fetch("/api/reviews");
      if (revRes.ok) {
        const rData = await revRes.json();
        if (rData.length > 0) setReviews(rData);
      }

      const galRes = await fetch("/api/gallery");
      if (galRes.ok) {
        const gData = await galRes.json();
        if (gData.length > 0) setGallery(gData);
      }
    } catch (err) {
      console.error("Error loading Fana Cafe data:", err);
    }
  };

  useEffect(() => {
    loadSiteData();
    // Check admin cookie ONLY to show a small indicator in the navbar.
    // The public website is ALWAYS shown — admin mode lives only at /admin.
    fetch("/api/admin/verify")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) setIsAdminLoggedIn(true);
      })
      .catch(() => {});
  }, []);

  const goToAdmin = () => {
    window.location.href = "/admin";
  };

  // Cart Helper Functions
  const handleAddToCart = (item: MenuItem, quantity: number) => {
    setCartMap((prev) => {
      const next = { ...prev };
      if (quantity <= 0) {
        delete next[item.id];
      } else {
        next[item.id] = quantity;
      }
      return next;
    });
  };

  const cartItems = Object.entries(cartMap)
    .map(([itemId, qty]) => {
      const foundItem = menuItems.find((m) => m.id === Number(itemId));
      if (!foundItem) return null;
      return { item: foundItem, quantity: qty };
    })
    .filter(Boolean) as { item: MenuItem; quantity: number }[];

  const cartCount = cartItems.reduce((acc, ci) => acc + ci.quantity, 0);

  const handleClearCart = () => setCartMap({});

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#2C1B17] font-sans selection:bg-[#C9A227] selection:text-[#2C1B17]">
      {/* Navigation Header */}
      <Navbar
        settings={settings}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenReservation={() => setIsReservationOpen(true)}
        onOpenAdmin={goToAdmin}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* PUBLIC LANDING PAGE — always visible */}
      <main>
        <HeroSection
          settings={settings}
          onOpenReservation={() => setIsReservationOpen(true)}
          onOpenMenu={() => {
            const menuEl = document.getElementById("menu");
            if (menuEl) menuEl.scrollIntoView({ behavior: "smooth" });
          }}
        />

        <AboutSection settings={settings} />

        <WhyChooseSection />

        <MenuSection
          items={menuItems}
          categories={categories}
          onAddToCart={handleAddToCart}
          cartMap={cartMap}
        />

        <ReservationSection settings={settings} />

        <ServicesSection
          onOpenOrderModal={() => setIsCartOpen(true)}
          onOpenReservationModal={() => setIsReservationOpen(true)}
        />

        <GallerySection items={gallery} />

        <LocationSection
          settings={settings}
          onOpenReservationModal={() => setIsReservationOpen(true)}
        />

        <FaqSection />

        <ReviewsSection reviews={reviews} onReviewSubmitted={loadSiteData} />

        <CtaBanner
          settings={settings}
          onOpenReservationModal={() => setIsReservationOpen(true)}
          onOpenOrderModal={() => setIsCartOpen(true)}
        />
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onOpenAdmin={goToAdmin}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Cart & Checkout Modal */}
      <OrderCartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleAddToCart}
        onClearCart={handleClearCart}
        settings={settings}
      />

      {/* Reservation Dialog Modal */}
      {isReservationOpen && (
        <ReservationSection
          settings={settings}
          isOpenModal={true}
          onCloseModal={() => setIsReservationOpen(false)}
        />
      )}
    </div>
  );
}
