import OpenAI from "openai";
import { storage } from "./storage";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const OPENAI_MODEL = "gpt-4o";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Read system message from file
let systemMessage = "";
try {
  systemMessage = fs.readFileSync(path.resolve(__dirname, "../attached_assets/system-message.txt"), "utf8");
} catch (error) {
  console.error("Error reading system message file:", error);
  systemMessage = `
  **Role:** Interplanetary travel advisor
  **Destinations:** Mercury, Venus, Earth, Mars, Saturn Rings Tour
  **Travel Options:** Luxury Cabins, Economy Shuttles, VIP Zero-Gravity
  **Packages:** Basic, Premium, Ultimate
  
  **Instructions:**
  1. Provide highlights and essential details about each destination (unique attractions, climate conditions, etc.).
  2. Recommend suitable travel options, emphasizing comfort, exclusivity, and cost.
  3. Suggest relevant activities (space walks, planetary surface tours, etc.).
  4. Include tips for coping with local conditions (e.g., temperature extremes or low gravity).
  5. Present prices or cost estimates where possible, and highlight any special requirements or perks.
  6. Be concise and express your meaning in short, clear statements.
  
  **Goal:** Deliver an engaging, informative, and persuasive guide to interplanetary travel, ensuring that space tourists get the best possible vacation experience.
  `;
}

export async function generateAIResponse(userId: string, userMessage: string): Promise<string> {
  try {
    // Get conversation history
    const chatHistory = await storage.getChatMessages(userId);
    
    // Format messages for OpenAI
    const systemMsg: ChatCompletionMessageParam = { role: "system", content: systemMessage };
    
    // Map each message to the correct type and handle invalid roles
    const historyMessages: ChatCompletionMessageParam[] = chatHistory.map(msg => {
      // Only include valid roles for OpenAI API
      if (msg.role === "user") {
        return { role: "user", content: msg.content };
      } else if (msg.role === "assistant") {
        return { role: "assistant", content: msg.content };
      } else if (msg.role === "system") {
        return { role: "system", content: msg.content };
      } else {
        // Default to assistant for any invalid roles
        return { role: "assistant", content: msg.content };
      }
    });
    
    const userMsg: ChatCompletionMessageParam = { role: "user", content: userMessage };
    
    const messages: ChatCompletionMessageParam[] = [
      systemMsg,
      ...historyMessages,
      userMsg
    ];
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1500,
    });
    
    const aiResponse = response.choices[0].message.content || 
      "I apologize, but I couldn't generate a response. Please try again.";
    
    // Save user message
    await storage.createChatMessage({
      userId,
      content: userMessage,
      role: "user"
    });
    
    // Save AI response
    await storage.createChatMessage({
      userId,
      content: aiResponse,
      role: "assistant"
    });
    
    return aiResponse;
  } catch (error: any) {
    console.error("Error generating AI response:", error);
    
    // Check for API key issues
    if (error.code === 'auth_error' || error.message?.includes('API key')) {
      return "There seems to be an issue with the AI service authentication. Please check the API key configuration.";
    }
    
    // Check for rate limit issues
    if (error.code === 'rate_limit_exceeded') {
      return "The AI service is currently experiencing high demand. Please try again in a few moments.";
    }
    
    // Return a generic error message
    return "I'm sorry, I encountered an error while processing your request. Please try again later.";
  }
}
