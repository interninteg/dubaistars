import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateAIResponse } from "./aiAdvisor";
import { z } from "zod";
import { insertBookingSchema, destinationDetails, packageDetails, insertUserSchema } from "@shared/schema";
import { compare, hash } from "bcryptjs";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.userId) {
    return next();
  }
  
  return res.status(401).json({ 
    message: "Unauthorized", 
    isAuthenticated: false 
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { username, password, email, firstName, lastName } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Hash the password
      const hashedPassword = await hash(password, 10);
      
      // Create user in database
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        firstName,
        lastName,
        role: "user",
        isVerified: true, // Auto-verify for demo purposes
      });
      
      // Set session data
      req.session.userId = user.id;
      req.session.username = user.username;
      
      // Return user info (without password)
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ 
        user: userWithoutPassword,
        isAuthenticated: true
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid registration data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to register user" });
    }
  });
  
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await storage.getUserByUsername(username);
        if (!user) {
            return res.status(401).json({ 
                message: "Invalid username or password",
                isAuthenticated: false
            });
        }

        // Compare passwords
        const isPasswordValid = await compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: "Invalid username or password",
                isAuthenticated: false
            });
        }

        // Update last login time
        await storage.updateUserLastLogin(user.id);

        // Set session data
        req.session.userId = user.id;
        req.session.username = user.username;

        // Return user info (without password)
        const { password: _, ...userWithoutPassword } = user;
        res.json({ 
            user: userWithoutPassword,
            isAuthenticated: true 
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ 
            message: "Failed to log in",
            isAuthenticated: false
        });
    }
  });
  
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ 
          message: "Failed to log out",
          isAuthenticated: true 
        });
      }
      
      res.clearCookie("connect.sid");
      res.json({ 
        message: "Logged out successfully",
        isAuthenticated: false 
      });
    });
  });
  
  app.get("/api/auth/me", (req: Request, res: Response) => {
    if (req.session && req.session.userId) {
      return res.json({ 
        isAuthenticated: true,
        userId: req.session.userId,
        username: req.session.username
      });
    }
    
    res.status(401).json({ 
      isAuthenticated: false,
      message: "Not authenticated" 
    });
  });
  
  // Protected routes that require authentication
  
  // Get all bookings for the authenticated user
  app.get("/api/bookings", isAuthenticated, async (req: Request, res: Response) => {
    const userId = req.session.username;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const bookings = await storage.getBookings(userId);
    res.json(bookings);
  });
  
  // Get a single booking
  app.get("/api/bookings/:id", isAuthenticated, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }
    
    const booking = await storage.getBooking(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    // Only allow users to access their own bookings
    if (booking.userId !== req.session.username) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    res.json(booking);
  });
  
  // Create a new booking
  app.post("/api/bookings", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Use userId from the request body if provided, otherwise fallback to session
      const userId = req.body.userId || req.session.username;

      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Create booking data with the userId
      const bookingData = {
        ...req.body,
        userId, // Ensure userId is included
      };

      const validatedData = insertBookingSchema.parse(bookingData);
      const booking = await storage.createBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });
  
  // Update a booking
  app.patch("/api/bookings/:id", isAuthenticated, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }
    
    try {
      // Check if the booking exists and belongs to the user
      const existingBooking = await storage.getBooking(id);
      if (!existingBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Only allow users to update their own bookings
      if (existingBooking.userId !== req.session.username) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const booking = await storage.updateBooking(id, req.body);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to update booking" });
    }
  });
  
  // Delete a booking
  app.delete("/api/bookings/:id", isAuthenticated, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }
    
    // Check if the booking exists and belongs to the user
    const existingBooking = await storage.getBooking(id);
    if (!existingBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    // Only allow users to delete their own bookings
    if (existingBooking.userId !== req.session.username) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const success = await storage.deleteBooking(id);
    if (!success) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    res.status(204).end();
  });
  
  // Get all accommodations
  app.get("/api/accommodations", async (req: Request, res: Response) => {
    const { location, amenity, priceRange } = req.query;
    
    const accommodations = await storage.getFilteredAccommodations(
      location as string | undefined,
      amenity as string | undefined,
      priceRange as string | undefined
    );
    
    res.json(accommodations);
  });
  
  // Get destination details
  app.get("/api/destinations", (req: Request, res: Response) => {
    res.json(destinationDetails);
  });
  
  // Get package details
  app.get("/api/packages", (req: Request, res: Response) => {
    res.json(packageDetails);
  });
  
  // Chat with AI advisor
  app.post("/api/chat", async (req: Request, res: Response) => {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }
    
    const userId = req.session.username || "guest"; 
    
    try {
      const aiResponse = await generateAIResponse(userId, message);
      
      // If user is authenticated, save the chat messages (both user and assistant)
      if (req.session.userId) {
        // Save user message
        await storage.createChatMessage({
          userId,
          content: message,
          role: "user",
          timestamp: new Date()
        });
        
        // Save assistant response
        await storage.createChatMessage({
          userId,
          content: aiResponse,
          role: "assistant",
          timestamp: new Date()
        });
      }
      
      res.json({ response: aiResponse });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Failed to generate response" });
    }
  });
  
  // Get chat history - only for authenticated users
  app.get("/api/chat", isAuthenticated, async (req: Request, res: Response) => {
    const userId = req.session.username;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const messages = await storage.getChatMessages(userId);
    res.json(messages);
  });
  
  // Clear chat history - only for authenticated users
  app.delete("/api/chat", isAuthenticated, async (req: Request, res: Response) => {
    const userId = req.session.username;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const success = await storage.clearChatMessages(userId);
    if (success) {
      res.status(204).end();
    } else {
      res.status(500).json({ message: "Failed to clear chat history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
