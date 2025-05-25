import { storage } from "./storage";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ChatOpenAI } from "@langchain/openai";
import { createGraph, Node, GraphInputs } from "@langchain/langgraph";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
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

// Set up LangGraph LLM
const llm = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: OPENAI_MODEL,
  temperature: 0.3,
  maxTokens: 1500,
});

// Define a single node for the assistant
const assistantNode: Node = async (inputs: GraphInputs) => {
  const { messages } = inputs;
  const response = await llm.invoke(messages);
  return { messages: [...messages, response] };
};

// Create the graph
const graph = createGraph({
  nodes: {
    assistant: assistantNode,
  },
  edges: [
    { from: "start", to: "assistant" },
  ],
  start: "assistant",
});

export async function generateAIResponse(userId: string, userMessage: string): Promise<string> {
  try {
    // Get conversation history
    const chatHistory = await storage.getChatMessages(userId);

    // Format messages for LangGraph
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
    const result = await graph.invoke({ messages });
    const aiResponse = result.messages[result.messages.length - 1]?.content ||
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

    if (error.code === 'auth_error' || error.message?.includes('API key')) {
      return "There seems to be an issue with the AI service authentication. Please check the API key configuration.";
    }
    if (error.code === 'rate_limit_exceeded') {
      return "The AI service is currently experiencing high demand. Please try again in a few moments.";
    }
    return "I'm sorry, I encountered an error while processing your request. Please try again later.";
  }
}
