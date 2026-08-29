import * as dotenv from "dotenv";
dotenv.config();

import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { GoogleGenerativeAI } from "@google/generative-ai";

/*  CLIENTS (singleton)  */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const pinecone = new Pinecone();
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-embedding-001",
  output_dimensionality: 768,
});

/*  CONFIG  */

const MAX_CONTEXT_CHARS = 3000;
const MAX_HISTORY_MESSAGES = 2;
const TOP_K = 3;

/*  HELPERS  */

function buildNamespace(userId, pdfId) {
  return `user_${userId}_pdf_${pdfId.replace(/[^a-zA-Z0-9]/g, "_")}`;
}

function buildContext(matches) {
  let context = matches
    .map(m => m.metadata?.text || "")
    .join("\n\n");

  return context.length > MAX_CONTEXT_CHARS
    ? context.slice(0, MAX_CONTEXT_CHARS)
    : context;
}

function buildChatHistory(history) {
  return history
    .slice(-MAX_HISTORY_MESSAGES)
    .map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));
}

/*  CONTROLLER  */

export async function chat(req, res) {
  try {
    const { question, pdfId, history = [] } = req.body;
    const userId = req.user?._id;

    if (!question || !pdfId || !userId) {
      return res.status(400).json({
        message: "question, pdfId and userId are required",
      });
    }

    const namespace = buildNamespace(userId, pdfId);
    console.log("Chatting in namespace:", namespace);

    /* Embed question */
    const fullQueryVector = await embeddings.embedQuery(question);
    const queryVector = fullQueryVector.slice(0, 768); // Truncate to 768 dimensions to match stored vectors
    console.log(`Query embedding truncated from ${fullQueryVector.length} to ${queryVector.length} dimensions`);

    /*  Pinecone search */
    const searchResults = await pineconeIndex
      .namespace(namespace)
      .query({
        vector: queryVector,
        topK: TOP_K,
        includeMetadata: true,
      });

    if (!searchResults.matches?.length) {
      return res.json({
        answer: "I could not find relevant information in this document.",
      });
    }

    /*  Context + history */
    const context = buildContext(searchResults.matches);
    const chatHistory = buildChatHistory(history);

    console.log("Retrieved context length:", context.length);
    console.log("Context preview:", context.substring(0, 300) + "...");

    // Check for image data in context
    if (context.includes('data:image') || context.includes('.png') || context.includes('.jpg')) {
        console.error("WARNING: Context contains image data!");
        return res.json({
            answer: "The retrieved context contains image data that cannot be processed. Please try a different question or re-upload the PDF.",
        });
    }

    /* Create Gemini chat (official) */
    console.log("Creating Gemini model...");
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    });

    console.log("Starting chat session...");
    const chatSession = model.startChat({
      history: [
        ...chatHistory,
        {
          role: "user",
          parts: [{
            text: `
You are an AI assistant answering questions from a PDF.

Rules:
- Prefer the provided context
- If the answer is not in the context, answer using general knowledge
- Keep the answer short and clear

Context:
${context}
            `.trim(),
          }],
        },
      ],
    });

    console.log("Sending message to Gemini...");
    /*  Send question */
    const result = await chatSession.sendMessage(question);
    const response = await result.response;
    console.log("Gemini response received:", response.text().substring(0, 100) + "...");

    res.json({
      answer: response.text() || "No response generated.",
    });

  } catch (error) {
    console.error("Chat error:", error);

    if (error?.status === 429 || error?.code === 429) {
      return res.json({
        answer: "AI quota exceeded. Please try again later.",
      });
    }

    // Handle Gemini API specific errors
    if (error.message && error.message.includes("does not support image input")) {
      console.error("Gemini image input error - this might indicate PDF processing included images");
      return res.json({
        answer: "There was an issue processing the PDF content. Please try uploading a different PDF or contact support.",
      });
    }

    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}
