export interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  imageUrl: string;
  isPopular: boolean;
  isAvailable: boolean;
  dietaryTags?: string | null;
  prepTime?: string | null;
  badge?: string | null;
  sortOrder?: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  sortOrder?: number;
}

export interface Reservation {
  id: number;
  reservationNumber: string;
  guestName: string;
  phone: string;
  email?: string;
  date: string;
  time: string;
  partySize: number;
  tablePreference: string;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | string;
  createdAt?: string;
}

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  phone: string;
  orderType: 'dine-in' | 'takeaway' | 'delivery' | string;
  address?: string;
  items: OrderItem[] | string;
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled' | string;
  notes?: string;
  createdAt?: string;
}

export interface Review {
  id: number;
  customerName: string;
  rating: number;
  reviewText: string;
  reviewDate: string;
  isApproved: boolean;
  isVerified: boolean;
}

export interface GalleryItem {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  caption?: string;
  sortOrder?: number;
}

export interface SiteSettings {
  cafe_name?: string;
  tagline?: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_bg_image?: string;
  phone?: string;
  address?: string;
  plus_code?: string;
  opening_hours?: string;
  about_title?: string;
  about_description?: string;
  announcement?: string;
  admin_password?: string;
  delivery_fee?: string | number;
  [key: string]: string | number | undefined;
}
