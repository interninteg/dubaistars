import { storage } from "./storage";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ChatOpenAI } from "@langchain/openai";
import {
  StateGraph,
  MessagesAnnotation,
  END,
  START
} from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { tool } from '@langchain/core/tools';
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OPENAI_MODEL = "gpt-4o";

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

// Define the schema for booking creation
const createBookingSchema = z.object({
  destination: z.string().describe("Destination for the booking (e.g., Mars, Saturn Rings Tour)"),
  departureDate: z.string().describe("Departure date in ISO format (YYYY-MM-DD)"),
  returnDate: z.string().optional().describe("Return date in ISO format (YYYY-MM-DD)"),
  travelClass: z.string().describe("Travel class (e.g., Luxury, Economy, VIP)"),
  numberOfTravelers: z.number().optional().describe("Number of travelers"),
  price: z.number().describe("Total price for the booking"),
  userId: z.string().describe("User ID for whom the booking is created"),
});

// Tool for creating a booking
const createBookingTool = tool(async (input) => {
  // Convert string dates to Date objects
  const bookingInput = {
    ...input,
    departureDate: new Date(input.departureDate),
    returnDate: input.returnDate ? new Date(input.returnDate) : null,
  };
  const booking = await storage.createBooking(bookingInput);
  return `Booking created! ID: ${booking.id}, Destination: ${booking.destination}, Departure: ${booking.departureDate.toISOString().split('T')[0]}`;
}, {
  name: "create_booking",
  description: "Create a new travel booking for a user.",
  schema: createBookingSchema,
});

// Add to your tools array and ToolNode
const tools = [createBookingTool];
const toolNodeForGraph = new ToolNode(tools);

const modelWithTools = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: OPENAI_MODEL,
  temperature: 0.3,
  maxTokens: 1500,
}).bindTools(tools);;

const shouldContinue = (state: typeof MessagesAnnotation.State) => {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1];
  if ("tool_calls" in lastMessage && Array.isArray(lastMessage.tool_calls) && lastMessage.tool_calls.length) {
    return "tools";
  }
  return END;
};

const callModel = async (state: typeof MessagesAnnotation.State) => {
  const { messages } = state;
  const response = await modelWithTools.invoke(messages);
  return { messages: response };
};

const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", toolNodeForGraph)
  .addEdge(START, "agent")
  .addConditionalEdges("agent", shouldContinue, ["tools", END])
  .addEdge("tools", "agent");

const app = workflow.compile();

// --- Your generateAIResponse function remains the same ---
export async function generateAIResponse(userId: string, userMessage: string): Promise<string> {
  try {
    const chatHistory = await storage.getChatMessages(userId);

    const systemMsg = { role: "system", content: systemMessage };
    const historyMessages = chatHistory.map(msg => {
      if (msg.role === "user" || msg.role === "assistant" || msg.role === "system") {
        return { role: msg.role, content: msg.content };
      }
      return { role: "assistant", content: msg.content };
    });
    const userMsg = { role: "user", content: userMessage };
    const messages = [systemMsg, ...historyMessages, userMsg];

    // Run the graph
    const result = await app.invoke({ messages });
    const aiResponse = result.messages[result.messages.length - 1]?.content ||
      "I apologize, but I couldn't generate a response. Please try again.";

    await storage.createChatMessage({
      userId,
      content: userMessage,
      role: "user"
    });

    await storage.createChatMessage({
      userId,
      content: aiResponse.toString(),
      role: "assistant"
    });

    return aiResponse.toString();
  } catch (error: any) {
    console.error("Error generating AI response:", error);

    if (error.code === 'auth_error' || error.message?.includes('API key')) {
      return "There seems to be an issue with the AI service authentication. Please check the API key configuration.";
    }
    if (error.code === 'rate_limit_exceeded') {
      return "The AI service is currently experiencing high demand. Please try again in a few moments.";
    }
    return "I'm sorry, I encountered an error while processing your request. Please try again later.";
  }
}
