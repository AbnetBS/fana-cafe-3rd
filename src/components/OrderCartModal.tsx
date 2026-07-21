"use client";

import { useState } from "react";
import { ShoppingBag, Trash2, Plus, Minus, CheckCircle2, Phone, MapPin, Truck, UtensilsCrossed, AlertCircle, ArrowRight } from "lucide-react";
import { MenuItem, SiteSettings, Order } from "@/types";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: { item: MenuItem; quantity: number }[];
  onUpdateQty: (item: MenuItem, qty: number) => void;
  onClearCart: () => void;
  settings: SiteSettings;
}

export default function OrderCartModal({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onClearCart,
  settings,
}: CartModalProps) {
  const [orderType, setOrderType] = useState<"delivery" | "takeaway" | "dine-in">("delivery");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const phoneSetting = settings.phone || "0911 065 022";
  const deliveryFee = Number(settings.delivery_fee || 50);

  const subtotal = cartItems.reduce((acc, ci) => acc + ci.item.price * ci.quantity, 0);
  const finalDeliveryFee = orderType === "delivery" ? deliveryFee : 0;
  const totalAmount = subtotal + finalDeliveryFee;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!customerName || !phone) {
      setErrorMsg("Please enter your name and contact phone number.");
      return;
    }

    if (orderType === "delivery" && !address) {
      setErrorMsg("Please provide your delivery address in Addis Ababa.");
      return;
    }

    setIsSubmitting(true);

    try {
      const itemsPayload = cartItems.map((ci) => ({
        id: ci.item.id,
        name: ci.item.name,
        price: ci.item.price,
        quantity: ci.quantity,
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          phone,
          orderType,
          address: orderType === "delivery" ? address : "Pick up / Dine-In at Cafe",
          items: itemsPayload,
          totalAmount,
          notes,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setPlacedOrder(data);
        onClearCart();
      } else {
        // Never show raw database/server errors to customers — log them instead
        console.error("Order placement failed:", data);
        setErrorMsg(
          "Order could not be placed right now. Please call us directly at " +
            phoneSetting +
            " and we will take your order over the phone."
        );
      }
    } catch (err) {
      console.error("Order network error:", err);
      setErrorMsg(
        "Connection issue. Please call " + phoneSetting + " and we will assist you immediately."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#2C1B17] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-[#C9A227]/40 relative text-white">
        
        {/* Header */}
        <div className="p-5 bg-[#3D2314] border-b border-[#C9A227]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C9A227]/20 flex items-center justify-center text-[#C9A227]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-amber-100">Your Fana Order</h3>
              <p className="text-xs text-stone-400">Dine-In, Takeaway & Delivery in Addis Ababa</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 text-amber-200 hover:text-white flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {placedOrder ? (
            /* Receipt confirmation */
            <div className="text-center py-6 space-y-4 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h3 className="text-2xl font-serif font-bold text-amber-100">Order Received!</h3>
              <p className="text-xs text-stone-300">
                Order Reference: <strong className="text-[#C9A227] font-mono text-sm">{placedOrder.orderNumber}</strong>
              </p>

              <div className="bg-[#3D2314] p-5 rounded-2xl border border-[#C9A227]/30 text-left max-w-md mx-auto space-y-2 text-xs">
                <div className="flex justify-between border-b border-stone-800 pb-2">
                  <span className="text-stone-400">Customer:</span>
                  <span className="font-bold">{placedOrder.customerName} ({placedOrder.phone})</span>
                </div>
                <div className="flex justify-between border-b border-stone-800 pb-2">
                  <span className="text-stone-400">Order Type:</span>
                  <span className="font-bold text-[#C9A227] uppercase">{placedOrder.orderType}</span>
                </div>
                <div className="flex justify-between border-b border-stone-800 pb-2">
                  <span className="text-stone-400">Total Amount:</span>
                  <span className="font-bold text-[#C9A227] text-sm">{placedOrder.totalAmount} ETB</span>
                </div>
                <p className="text-[11px] text-stone-400 pt-1">
                  Our kitchen is now preparing your delicious order.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={`tel:${phoneSetting.replace(/\s+/g, "")}`}
                  className="inline-flex items-center justify-center gap-2 bg-[#C9A227] text-[#2C1B17] font-bold text-xs uppercase px-6 py-3 rounded-full hover:bg-amber-400 transition"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Cafe ({phoneSetting})</span>
                </a>

                <button
                  onClick={() => {
                    setPlacedOrder(null);
                    onClose();
                  }}
                  className="bg-white/10 text-stone-200 font-bold text-xs uppercase px-6 py-3 rounded-full hover:bg-white/20 transition"
                >
                  Close
                </button>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            /* Empty Cart */
            <div className="text-center py-12 space-y-3">
              <ShoppingBag className="w-16 h-16 text-stone-600 mx-auto" />
              <h4 className="text-lg font-bold text-amber-100">Your Order Bag is Empty</h4>
              <p className="text-xs text-stone-400">Add delicious coffee, juices, and sandwiches from our homepage menu!</p>
              <button
                onClick={onClose}
                className="mt-2 bg-[#C9A227] text-[#2C1B17] font-bold text-xs px-6 py-2.5 rounded-full"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            /* Items List & Form */
            <form onSubmit={handleCheckout} className="space-y-6">
              
              {/* Order Items */}
              <div className="space-y-3 bg-[#3D2314] p-4 rounded-2xl border border-[#C9A227]/20">
                <div className="flex items-center justify-between pb-2 border-b border-stone-700">
                  <span className="text-xs font-bold uppercase text-amber-200">Selected Items ({cartItems.length})</span>
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="text-[11px] text-rose-400 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear Bag</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {cartItems.map(({ item, quantity }) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 text-xs bg-[#2C1B17] p-2.5 rounded-xl">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        <div className="truncate">
                          <p className="font-bold text-amber-100 truncate">{item.name}</p>
                          <p className="text-stone-400 text-[11px]">{item.price} ETB x {quantity}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item, quantity - 1)}
                          className="w-6 h-6 rounded-md bg-stone-800 text-stone-300 hover:bg-stone-700 flex items-center justify-center font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold px-1 text-amber-300">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item, quantity + 1)}
                          className="w-6 h-6 rounded-md bg-[#C9A227] text-[#2C1B17] hover:bg-amber-400 flex items-center justify-center font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-amber-200 ml-2">{item.price * quantity} ETB</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Type Toggle */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-200 mb-2">
                  Select Order Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderType("delivery")}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      orderType === "delivery"
                        ? "bg-[#C9A227] text-[#2C1B17] border-[#C9A227]"
                        : "bg-[#3D2314] text-stone-300 border-stone-700"
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>Delivery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderType("takeaway")}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      orderType === "takeaway"
                        ? "bg-[#C9A227] text-[#2C1B17] border-[#C9A227]"
                        : "bg-[#3D2314] text-stone-300 border-stone-700"
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Takeaway</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderType("dine-in")}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      orderType === "dine-in"
                        ? "bg-[#C9A227] text-[#2C1B17] border-[#C9A227]"
                        : "bg-[#3D2314] text-stone-300 border-stone-700"
                    }`}
                  >
                    <UtensilsCrossed className="w-4 h-4" />
                    <span>Dine-In Order</span>
                  </button>
                </div>
              </div>

              {/* Customer Details */}
              <div className="space-y-3">
                {errorMsg && (
                  <div className="bg-rose-900/60 border border-rose-500 text-rose-200 text-xs p-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-amber-200/80 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Bethlehem"
                      className="w-full bg-[#3D2314] border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#C9A227]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-200/80 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0911 223 344"
                      className="w-full bg-[#3D2314] border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#C9A227]"
                    />
                  </div>
                </div>

                {orderType === "delivery" && (
                  <div>
                    <label className="block text-[11px] font-bold text-amber-200/80 mb-1">Delivery Address *</label>
                    <textarea
                      rows={2}
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Bole Subcity, Near Friendship City Center, Building 3"
                      className="w-full bg-[#3D2314] border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#C9A227]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-amber-200/80 mb-1">Special Notes (Optional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Extra sugar on coffee, no onions on sandwich..."
                    className="w-full bg-[#3D2314] border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#C9A227]"
                  />
                </div>
              </div>

              {/* Price Calculation Summary */}
              <div className="bg-[#3D2314] p-4 rounded-2xl border border-[#C9A227]/30 space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-300">
                  <span>Subtotal:</span>
                  <span>{subtotal} ETB</span>
                </div>
                {orderType === "delivery" && (
                  <div className="flex justify-between text-stone-300">
                    <span>Delivery Fee:</span>
                    <span>{deliveryFee} ETB</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-serif font-extrabold text-[#C9A227] pt-2 border-t border-stone-700">
                  <span>Total Payable:</span>
                  <span>{totalAmount} ETB</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#C9A227] to-[#B8921F] hover:from-[#d6ad2a] hover:to-[#c29b21] text-[#2C1B17] font-black text-sm uppercase tracking-wider py-3.5 rounded-2xl shadow-xl flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Submitting Order...</span>
                ) : (
                  <>
                    <span>Place Order ({totalAmount} ETB)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
