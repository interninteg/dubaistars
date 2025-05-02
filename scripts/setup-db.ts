import { db } from "../server/db";
import { 
  users, bookings, accommodations, chatMessages,
  destinationDetails, packageDetails 
} from "../shared/schema";
import { sql } from "drizzle-orm";

async function setupDatabase() {
  console.log("Setting up database...");

  try {
    // Create tables - normally would use drizzle-kit, but for simplicity we'll do it here
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT UNIQUE,
        first_name TEXT,
        last_name TEXT,
        phone_number TEXT,
        profile_picture TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        is_verified BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        last_login TIMESTAMP
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        destination TEXT NOT NULL,
        departure_date TIMESTAMP NOT NULL,
        return_date TIMESTAMP,
        travel_class TEXT NOT NULL,
        number_of_travelers INTEGER NOT NULL DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'confirmed',
        price DOUBLE PRECISION NOT NULL,
        user_id TEXT NOT NULL DEFAULT 'john-doe',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS accommodations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        description TEXT NOT NULL,
        price_per_night DOUBLE PRECISION NOT NULL,
        image TEXT NOT NULL,
        tier TEXT NOT NULL,
        amenities TEXT[] NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL DEFAULT 'john-doe',
        content TEXT NOT NULL,
        role TEXT NOT NULL,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Create default user with enhanced profile
    const existingUser = await db.select().from(users).where(sql`username = 'john-doe'`);
    
    if (existingUser.length === 0) {
      await db.insert(users).values({
        username: "john-doe",
        password: "password123",
        email: "john.doe@example.com",
        firstName: "John",
        lastName: "Doe",
        phoneNumber: "+971 50 123 4567",
        profilePicture: "https://randomuser.me/api/portraits/men/42.jpg",
        role: "user",
        isVerified: true,
        createdAt: new Date(),
        lastLogin: new Date()
      });
      console.log("Created default user");
    } else {
      console.log("Default user already exists");
    }

    // Add sample bookings
    const existingBookings = await db.select().from(bookings);
    
    if (existingBookings.length === 0) {
      await db.insert(bookings).values([
        {
          destination: "mars",
          departureDate: new Date("2025-06-15T23:30:00"),
          returnDate: new Date("2025-12-20T10:15:00"),
          travelClass: "vip",
          numberOfTravelers: 1,
          status: "confirmed",
          price: 750000,
          userId: "john-doe",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          destination: "saturn",
          departureDate: new Date("2025-12-10T08:15:00"),
          returnDate: null,
          travelClass: "luxury",
          numberOfTravelers: 2,
          status: "pending",
          price: 1200000,
          userId: "john-doe",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
      console.log("Created sample bookings");
    } else {
      console.log("Bookings already exist");
    }

    // Add accommodations
    const existingAccommodations = await db.select().from(accommodations);
    
    if (existingAccommodations.length === 0) {
      await db.insert(accommodations).values([
        {
          name: "Orbital Luxury Suite",
          location: "Earth Orbit, 400km",
          description: "Experience weightlessness in our premium orbital suites with panoramic Earth views.",
          pricePerNight: 35000,
          image: "https://images.unsplash.com/photo-1517495306984-f84210f9daa8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
          tier: "premium",
          amenities: ["Panoramic Views", "Zero-G Spa", "Gourmet Dining"]
        },
        {
          name: "Lunar Dome Residence",
          location: "Lunar Surface, Sea of Tranquility",
          description: "Luxury domes with Earth views and private lunar terrace access.",
          pricePerNight: 75000,
          image: "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
          tier: "luxury",
          amenities: ["Private Terrace", "Earth View", "Lunar Rover"]
        },
        {
          name: "Mars Habitat Suite",
          location: "Martian Colony, Olympus Mons",
          description: "Experience the red planet in comfort with artificial gravity and hydroponic gardens.",
          pricePerNight: 25000,
          image: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
          tier: "standard",
          amenities: ["Artificial Gravity", "Hydroponic Garden", "VR Suite"]
        },
        {
          name: "Zero-G Capsule",
          location: "Low Earth Orbit Station",
          description: "Affordable orbital accommodation with all essential amenities.",
          pricePerNight: 8500,
          image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
          tier: "budget",
          amenities: ["Compact Design", "Shared Facilities", "Basic Amenities"]
        },
        {
          name: "Saturn Ring View Suite",
          location: "Saturn Orbital Station",
          description: "Our most luxurious offering with unparalleled views of Saturn's rings.",
          pricePerNight: 125000,
          image: "https://images.unsplash.com/photo-1540198163009-7afda7da2945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
          tier: "ultra-luxury",
          amenities: ["360° Ring Views", "Private Chef", "Luxury Spa"]
        },
        {
          name: "International Space Hub",
          location: "Earth Orbit, Equatorial",
          description: "Modern space station accommodations with scientific facilities access.",
          pricePerNight: 18000,
          image: "https://images.unsplash.com/photo-1465101162946-4377e57745c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
          tier: "standard",
          amenities: ["Zero-G Gym", "Science Lab Access", "Observatory"]
        }
      ]);
      console.log("Created accommodations");
    } else {
      console.log("Accommodations already exist");
    }

    // Add welcome message
    const existingMessages = await db.select().from(chatMessages);
    
    if (existingMessages.length === 0) {
      await db.insert(chatMessages).values({
        userId: "john-doe",
        content: "Welcome to Dubai to the Stars AI Travel Assistant! I'm your interplanetary travel advisor. Ask me about destinations, travel options, or package recommendations. How can I help you plan your space adventure today?",
        role: "assistant",
        timestamp: new Date()
      });
      console.log("Created welcome message");
    } else {
      console.log("Chat messages already exist");
    }

    console.log("Database setup complete!");
  } catch (error) {
    console.error("Error setting up database:", error);
  }
}

setupDatabase();