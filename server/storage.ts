import { 
  Booking, InsertBooking, 
  Accommodation, InsertAccommodation,
  User, InsertUser,
  ChatMessage, InsertChatMessage,
  destinationDetails,
  accommodations, bookings, users, chatMessages,
  packageDetails
} from "@shared/schema";
import { db } from "./db";
import { and, asc, desc, eq, gt, gte, lt, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(id: number): Promise<User | undefined>;
  
  // Booking operations
  getBookings(userId: string): Promise<Booking[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined>;
  deleteBooking(id: number): Promise<boolean>;
  
  // Accommodation operations
  getAccommodations(): Promise<Accommodation[]>;
  getFilteredAccommodations(location?: string, amenity?: string, priceRange?: string): Promise<Accommodation[]>;
  
  // Chat message operations
  getChatMessages(userId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  clearChatMessages(userId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private bookings: Map<number, Booking>;
  private accommodations: Map<number, Accommodation>;
  private chatMessages: Map<number, ChatMessage>;
  private currentIds: {
    user: number;
    booking: number;
    accommodation: number;
    chatMessage: number;
  };

  constructor() {
    this.users = new Map();
    this.bookings = new Map();
    this.accommodations = new Map();
    this.chatMessages = new Map();
    this.currentIds = {
      user: 1,
      booking: 1,
      accommodation: 1,
      chatMessage: 1
    };
    
    // Initialize with sample data
    this._initializeSampleData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.user++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      email: insertUser.email || null,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      phoneNumber: insertUser.phoneNumber || null,
      profilePicture: insertUser.profilePicture || null,
      role: insertUser.role || "user",
      isVerified: insertUser.isVerified || false,
      createdAt: now,
      lastLogin: now
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserLastLogin(id: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      lastLogin: new Date()
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Booking operations
  async getBookings(userId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.userId === userId
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }
  
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentIds.booking++;
    const now = new Date();
    const booking: Booking = { 
      id,
      destination: insertBooking.destination,
      departureDate: insertBooking.departureDate,
      returnDate: insertBooking.returnDate || null,
      travelClass: insertBooking.travelClass,
      numberOfTravelers: insertBooking.numberOfTravelers || 1,
      status: insertBooking.status || "confirmed",
      price: insertBooking.price,
      userId: insertBooking.userId || "john-doe",
      createdAt: now,
      updatedAt: now
    };
    this.bookings.set(id, booking);
    return booking;
  }
  
  async updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined> {
    const existingBooking = this.bookings.get(id);
    if (!existingBooking) return undefined;
    
    const updatedBooking: Booking = {
      ...existingBooking,
      ...booking,
      updatedAt: new Date()
    };
    
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }
  
  async deleteBooking(id: number): Promise<boolean> {
    return this.bookings.delete(id);
  }
  
  // Accommodation operations
  async getAccommodations(): Promise<Accommodation[]> {
    return Array.from(this.accommodations.values());
  }
  
  async getFilteredAccommodations(location?: string, amenity?: string, priceRange?: string): Promise<Accommodation[]> {
    let filteredAccommodations = Array.from(this.accommodations.values());
    
    if (location && location !== 'all') {
      filteredAccommodations = filteredAccommodations.filter(acc => 
        acc.location.toLowerCase().includes(location.toLowerCase()));
    }
    
    if (amenity && amenity !== 'all') {
      filteredAccommodations = filteredAccommodations.filter(acc => 
        acc.amenities.some(a => a.toLowerCase().includes(amenity.toLowerCase())));
    }
    
    if (priceRange && priceRange !== 'all') {
      switch(priceRange) {
        case 'budget':
          filteredAccommodations = filteredAccommodations.filter(acc => acc.pricePerNight < 10000);
          break;
        case 'standard':
          filteredAccommodations = filteredAccommodations.filter(acc => 
            acc.pricePerNight >= 10000 && acc.pricePerNight <= 25000);
          break;
        case 'luxury':
          filteredAccommodations = filteredAccommodations.filter(acc => 
            acc.pricePerNight > 25000 && acc.pricePerNight <= 50000);
          break;
        case 'ultra':
          filteredAccommodations = filteredAccommodations.filter(acc => acc.pricePerNight > 50000);
          break;
      }
    }
    
    return filteredAccommodations;
  }
  
  // Chat message operations
  async getChatMessages(userId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.userId === userId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
  
  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentIds.chatMessage++;
    const message: ChatMessage = {
      id,
      userId: insertMessage.userId,
      content: insertMessage.content,
      role: insertMessage.role,
      timestamp: insertMessage.timestamp ? new Date(insertMessage.timestamp) : new Date()
    };
    this.chatMessages.set(id, message);
    return message;
  }
  
  async clearChatMessages(userId: string): Promise<boolean> {
    const messagesToDelete = Array.from(this.chatMessages.values())
      .filter(msg => msg.userId === userId)
      .map(msg => msg.id);
    
    messagesToDelete.forEach(id => this.chatMessages.delete(id));
    
    // Add welcome message
    this.createChatMessage({
      userId,
      content: "Welcome to Dubai to the Stars AI Travel Assistant! I'm your interplanetary travel advisor. Ask me about destinations, travel options, or package recommendations. How can I help you plan your space adventure today?",
      role: "assistant",
      timestamp: new Date()
    });
    
    return true;
  }
  
  // Initialize sample data
  private _initializeSampleData() {
    // Create sample accommodations only
    [
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
      },
    ].forEach(acc => {
      this.createAccommodation(acc);
    });
  }
  
  async createAccommodation(insertAccommodation: InsertAccommodation): Promise<Accommodation> {
    const id = this.currentIds.accommodation++;
    const accommodation: Accommodation = { 
      id,
      name: insertAccommodation.name,
      location: insertAccommodation.location,
      description: insertAccommodation.description,
      pricePerNight: insertAccommodation.pricePerNight,
      image: insertAccommodation.image,
      tier: insertAccommodation.tier,
      amenities: insertAccommodation.amenities
    };
    this.accommodations.set(id, accommodation);
    return accommodation;
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUserLastLogin(id: number): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async getBookings(userId: string): Promise<Booking[]> {
    const bookingsList = await db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));
    return bookingsList;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings).values({
      ...insertBooking,
      updatedAt: new Date()
    }).returning();
    return booking;
  }

  async updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({
        ...booking,
        updatedAt: new Date()
      })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking || undefined;
  }

  async deleteBooking(id: number): Promise<boolean> {
    const [deletedBooking] = await db
      .delete(bookings)
      .where(eq(bookings.id, id))
      .returning();
    return !!deletedBooking;
  }

  async getAccommodations(): Promise<Accommodation[]> {
    return db.select().from(accommodations);
  }

  async getFilteredAccommodations(location?: string, amenity?: string, priceRange?: string): Promise<Accommodation[]> {
    // Build conditions list based on filters
    const conditions = [];
    
    if (location && location !== 'all') {
      conditions.push(sql`${accommodations.location} ILIKE ${`%${location}%`}`);
    }

    if (amenity && amenity !== 'all') {
      conditions.push(sql`${accommodations.amenities} @> ARRAY[${amenity}]::text[]`);
    }

    if (priceRange && priceRange !== 'all') {
      switch(priceRange) {
        case 'budget':
          conditions.push(lt(accommodations.pricePerNight, 10000));
          break;
        case 'standard':
          conditions.push(and(
            gte(accommodations.pricePerNight, 10000),
            lte(accommodations.pricePerNight, 25000)
          ));
          break;
        case 'luxury':
          conditions.push(and(
            gt(accommodations.pricePerNight, 25000),
            lte(accommodations.pricePerNight, 50000)
          ));
          break;
        case 'ultra':
          conditions.push(gt(accommodations.pricePerNight, 50000));
          break;
      }
    }
    
    // Apply all conditions if any exist, otherwise get all accommodations
    if (conditions.length > 0) {
      return await db.select().from(accommodations)
        .where(conditions.length === 1 ? conditions[0] : and(...conditions));
    } else {
      return await db.select().from(accommodations);
    }
  }

  async getChatMessages(userId: string): Promise<ChatMessage[]> {
    return db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(asc(chatMessages.timestamp));
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async clearChatMessages(userId: string): Promise<boolean> {
    await db
      .delete(chatMessages)
      .where(eq(chatMessages.userId, userId));
    
    // Add welcome message
    await this.createChatMessage({
      userId,
      content: "Welcome to Dubai to the Stars AI Travel Assistant! I'm your interplanetary travel advisor. Ask me about destinations, travel options, or package recommendations. How can I help you plan your space adventure today?",
      role: "assistant",
      timestamp: new Date()
    });
    
    return true;
  }
}

// Use in-memory storage for testing or database storage for production
// export const storage = new MemStorage();
export const storage = new DatabaseStorage();
