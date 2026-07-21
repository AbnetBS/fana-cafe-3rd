import { pgTable, serial, varchar, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const siteSettings = pgTable("site_settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 50 }).notNull(),
  sortOrder: integer("sort_order").default(0),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  price: integer("price").notNull(), // Amount in ETB (Ethiopian Birr)
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  isPopular: boolean("is_popular").default(false),
  isAvailable: boolean("is_available").default(true),
  dietaryTags: text("dietary_tags"), // comma separated tags e.g. "Vegetarian, Espresso, Authentic"
  prepTime: varchar("prep_time", { length: 50 }).default("10-15 min"),
  badge: varchar("badge", { length: 50 }),
  sortOrder: integer("sort_order").default(0),
});

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  reservationNumber: varchar("reservation_number", { length: 50 }).notNull(),
  guestName: varchar("guest_name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  email: varchar("email", { length: 100 }),
  date: varchar("date", { length: 20 }).notNull(),
  time: varchar("time", { length: 20 }).notNull(),
  partySize: integer("party_size").notNull(),
  tablePreference: varchar("table_preference", { length: 50 }).default("Indoor"),
  specialRequests: text("special_requests"),
  status: varchar("status", { length: 20 }).default("confirmed"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 50 }).notNull(),
  customerName: varchar("customer_name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  orderType: varchar("order_type", { length: 50 }).default("delivery"), // dine-in, takeaway, delivery
  address: text("address"),
  items: text("items").notNull(), // JSON string
  totalAmount: integer("total_amount").notNull(),
  status: varchar("status", { length: 50 }).default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  customerName: varchar("customer_name", { length: 100 }).notNull(),
  rating: integer("rating").notNull(),
  reviewText: text("review_text").notNull(),
  reviewDate: varchar("review_date", { length: 50 }).notNull(),
  isApproved: boolean("is_approved").default(true),
  isVerified: boolean("is_verified").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const galleryItems = pgTable("gallery_items", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  sortOrder: integer("sort_order").default(0),
});
