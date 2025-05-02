import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Booking table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  destination: text("destination").notNull(),
  departureDate: timestamp("departure_date").notNull(),
  returnDate: timestamp("return_date"),
  travelClass: text("travel_class").notNull(),
  numberOfTravelers: integer("number_of_travelers").notNull().default(1),
  status: text("status").notNull().default("confirmed"),
  price: doublePrecision("price").notNull(),
  userId: text("user_id").notNull().default("john-doe"), // Keep default for backward compatibility
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Create the base schema first
const baseInsertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Then extend it with proper date parsing
export const insertBookingSchema = baseInsertBookingSchema.extend({
  departureDate: z.string().transform((str) => new Date(str)),
  returnDate: z.string().nullable().transform((str) => str ? new Date(str) : null),
});

// Accommodation table
export const accommodations = pgTable("accommodations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  pricePerNight: doublePrecision("price_per_night").notNull(),
  image: text("image").notNull(),
  tier: text("tier").notNull(), // budget, standard, premium, luxury, ultra-luxury
  amenities: text("amenities").array().notNull(),
});

export const insertAccommodationSchema = createInsertSchema(accommodations).omit({
  id: true
});

// Users table with future-proof fields for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phoneNumber: text("phone_number"),
  profilePicture: text("profile_picture"),
  role: text("role").default("user").notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastLogin: timestamp("last_login"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
});

// Chat message table for AI advisor
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), 
  content: text("content").notNull(), // Message content
  role: text("role").notNull(), // Message role (user/assistant)
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true
});

// Define types
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Accommodation = typeof accommodations.$inferSelect;
export type InsertAccommodation = z.infer<typeof insertAccommodationSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

// Destination details
export const destinationDetails = [
  {
    id: "mercury",
    name: "Mercury",
    description: "The closest planet to the sun, offering extreme temperature variations and challenging but rewarding exploration opportunities.",
    distance: "57.9 million km",
    travelTime: "2-3 months",
    temperature: "430°C (day) to -180°C (night)",
    color: "#A9A9A9",
    activities: ["Crater exploration", "Solar observation", "Extreme terrain hiking"]
  },
  {
    id: "venus",
    name: "Venus",
    description: "Known for its thick atmosphere and extreme surface pressure, Venus offers spectacular cloud-top viewing platforms.",
    distance: "108.2 million km",
    travelTime: "3-4 months",
    temperature: "462°C (constant)",
    color: "#E6A727",
    activities: ["Cloud-top observatories", "Atmospheric diving", "Sulfuric sunrise viewing"]
  },
  {
    id: "earth",
    name: "Earth",
    description: "Our home planet, offering a return journey with breathtaking views of the Blue Marble from space.",
    distance: "149.6 million km",
    travelTime: "N/A (Home)",
    temperature: "15°C (average)",
    color: "#2E86C1",
    activities: ["Orbital photography", "Zero-G recreation", "Space station tours"]
  },
  {
    id: "mars",
    name: "Mars",
    description: "The Red Planet, featuring massive canyons, extinct volcanoes, and emerging human colonies.",
    distance: "227.9 million km",
    travelTime: "6-8 months",
    temperature: "-65°C (average)",
    color: "#C0392B",
    activities: ["Colony tours", "Olympus Mons expedition", "Desert rover adventures"]
  },
  {
    id: "saturn",
    name: "Saturn Rings Tour",
    description: "Experience the magnificent rings up close with our exclusive tour around this gas giant's unique features.",
    distance: "1.4 billion km",
    travelTime: "3-4 years",
    temperature: "-178°C (average)",
    color: "#F5CBA7",
    activities: ["Ring surfing", "Moonlet hopping", "Cassini division cruise"]
  }
];

// Package details
export const packageDetails = [
  {
    id: "basic",
    name: "Basic",
    description: "Essential Experience",
    price: 250000,
    accommodation: "Shared Cabin",
    meals: "Standard Menu",
    spacewalk: false,
    surfaceTours: "Group Tour",
    training: "3 Days",
    medicalSupport: "Standard",
    souvenirs: "Digital Photos"
  },
  {
    id: "premium",
    name: "Premium",
    description: "Enhanced Journey",
    price: 450000,
    accommodation: "Private Suite",
    meals: "Premium Menu",
    spacewalk: "1 Session",
    surfaceTours: "Small Group",
    training: "7 Days",
    medicalSupport: "Enhanced",
    souvenirs: "Photo Book + Video"
  },
  {
    id: "ultimate",
    name: "Ultimate",
    description: "Luxury Expedition",
    price: 750000,
    accommodation: "Luxury Module",
    meals: "Gourmet Dining",
    spacewalk: "Unlimited",
    surfaceTours: "Private Guide",
    training: "14 Days",
    medicalSupport: "Dedicated Doctor",
    souvenirs: "Lunar/Martian Rock"
  }
];

// Define relations between tables
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  chatMessages: many(chatMessages),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.username],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.username],
  }),
}));
