import { db } from "@/db";
import { siteSettings, categories, menuItems, reviews, galleryItems } from "@/db/schema";
import { DEFAULT_SETTINGS, DEFAULT_CATEGORIES, DEFAULT_MENU_ITEMS, DEFAULT_REVIEWS, DEFAULT_GALLERY } from "@/lib/initial-data";

export async function ensureDbSeeded() {
  try {
    // 1. Check & seed site settings
    const existingSettings = await db.select().from(siteSettings);
    if (existingSettings.length === 0) {
      const settingsToInsert = Object.entries(DEFAULT_SETTINGS).map(([key, value]) => ({
        key,
        value: typeof value === "object" ? JSON.stringify(value) : String(value),
      }));
      await db.insert(siteSettings).values(settingsToInsert);
    }

    // 2. Check & seed categories
    const existingCategories = await db.select().from(categories);
    if (existingCategories.length === 0) {
      await db.insert(categories).values(
        DEFAULT_CATEGORIES.map((cat) => ({
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          sortOrder: cat.sortOrder,
        }))
      );
    }

    // 3. Check & seed menu items
    const existingMenuItems = await db.select().from(menuItems);
    if (existingMenuItems.length === 0) {
      await db.insert(menuItems).values(
        DEFAULT_MENU_ITEMS.map((item) => ({
          name: item.name,
          category: item.category,
          price: item.price,
          description: item.description,
          imageUrl: item.imageUrl,
          isPopular: item.isPopular,
          isAvailable: item.isAvailable,
          dietaryTags: item.dietaryTags,
          prepTime: item.prepTime,
          badge: item.badge,
          sortOrder: item.sortOrder,
        }))
      );
    }

    // 4. Check & seed reviews
    const existingReviews = await db.select().from(reviews);
    if (existingReviews.length === 0) {
      await db.insert(reviews).values(
        DEFAULT_REVIEWS.map((rev) => ({
          customerName: rev.customerName,
          rating: rev.rating,
          reviewText: rev.reviewText,
          reviewDate: rev.reviewDate,
          isApproved: rev.isApproved,
          isVerified: rev.isVerified,
        }))
      );
    }

    // 5. Check & seed gallery
    const existingGallery = await db.select().from(galleryItems);
    if (existingGallery.length === 0) {
      await db.insert(galleryItems).values(
        DEFAULT_GALLERY.map((gal) => ({
          title: gal.title,
          category: gal.category,
          imageUrl: gal.imageUrl,
          caption: gal.caption,
          sortOrder: gal.sortOrder,
        }))
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Db Seed Error:", error);
    return { success: false, error: String(error) };
  }
}
