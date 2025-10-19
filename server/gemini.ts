import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";

type MessageRole = "user" | "model";

interface ChatMessage {
  role: MessageRole;
  parts: { text: string }[];
}

// Store for ongoing conversations per project
const conversationHistory: Map<string, ChatMessage[]> = new Map();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

export async function generateResponse(
  prompt: string, 
  controller: ReadableStreamDefaultController,
  projectId?: string
) {
  const encoder = new TextEncoder();
  const enqueue = controller.enqueue.bind(controller);
  const close = controller.close.bind(controller);
  
  try {
    console.log("Loading system prompt...");
    const systemPrompt = await getSystemPrompt();
    
    let history: ChatMessage[] = [];
    
    // If projectId is provided, use existing conversation history
    if (projectId) {
      if (conversationHistory.has(projectId)) {
        history = [...conversationHistory.get(projectId)!];
      } else {
        // Initialize with system prompt for new project
        history = [{ role: "user", parts: [{ text: systemPrompt }] }];
        conversationHistory.set(projectId, history);
      }
    } else {
      // For initial generation, start with system prompt
      history = [{ role: "user", parts: [{ text: systemPrompt }] }];
    }
    
    console.log("Starting chat with system prompt...");
    const chat = model.startChat({
      history,
      generationConfig: { maxOutputTokens: 8192 },
    });

    console.log("Sending user prompt...");
    const result = await chat.sendMessageStream(prompt);
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      const data = `data: ${JSON.stringify({ text: chunkText })}\\n\\n`;
      enqueue(encoder.encode(data));
    }

    // Update conversation history if projectId is provided
    if (projectId) {
      const updatedHistory = [
        ...history,
        { role: "user" as MessageRole, parts: [{ text: prompt }] },
        { role: "model" as MessageRole, parts: [{ text: "" }] } // Placeholder for AI response
      ];
      
      // Get the full response to store in history
      const fullResponse = await result.response;
      const aiResponse = fullResponse.text();
      
      updatedHistory[updatedHistory.length - 1] = {
        role: "model" as MessageRole,
        parts: [{ text: aiResponse }]
      };
      
      conversationHistory.set(projectId, updatedHistory);
    }

    enqueue(encoder.encode(`data: [DONE]\\n\\n`));

  } catch (error) {
    console.error("Gemini error:", error);
    enqueue(encoder.encode(`data: ${JSON.stringify({ error: (error as Error).message })}\\n\\n`));
  } finally {
    close();
  }
}

export async function generateFollowUpResponse(
  prompt: string,
  controller: ReadableStreamDefaultController,
  projectId: string
) {
  const encoder = new TextEncoder();
  const enqueue = controller.enqueue.bind(controller);
  const close = controller.close.bind(controller);
  
  try {
    if (!conversationHistory.has(projectId)) {
      throw new Error("No conversation history found for this project. Please start a new project first.");
    }
    
    const history = conversationHistory.get(projectId)!;
    
    console.log(`Starting follow-up chat for project ${projectId}...`);
    const chat = model.startChat({
      history,
      generationConfig: { maxOutputTokens: 8192 },
    });

    console.log("Sending follow-up prompt...");
    const result = await chat.sendMessageStream(prompt);
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      const data = `data: ${JSON.stringify({ text: chunkText })}\\n\\n`;
      enqueue(encoder.encode(data));
    }

    // Update conversation history with the new exchange
    const fullResponse = await result.response;
    const aiResponse = fullResponse.text();
    
    const updatedHistory = [
      ...history,
      { role: "user" as MessageRole, parts: [{ text: prompt }] },
      { role: "model" as MessageRole, parts: [{ text: aiResponse }] }
    ];
    
    conversationHistory.set(projectId, updatedHistory);

    enqueue(encoder.encode(`data: [DONE]\\n\\n`));

  } catch (error) {
    console.error("Gemini follow-up error:", error);
    enqueue(encoder.encode(`data: ${JSON.stringify({ error: (error as Error).message })}\\n\\n`));
  } finally {
    close();
  }
}

async function getSystemPrompt(): Promise<string> {
  const promptPath = path.join(process.cwd(), 'system-prompt.md');
  try {
    return await fs.readFile(promptPath, 'utf-8');
  } catch (error) {
    console.error("Error reading system prompt:", error);
    return "You are an expert full-stack software engineer.";
  }
}