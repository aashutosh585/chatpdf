import * as dotenv from "dotenv";
dotenv.config();

import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";

/*  CLIENTS  */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

/*  CONFIG  */
const MAX_CONTEXT_CHARS = 6000;
const MAX_HISTORY_MESSAGES = 8;
const TOP_K = 4;

/*  HELPERS  */
function buildNamespace(userId, pdfId) {
  return `user_${userId}_pdf_${pdfId.replace(/[^a-zA-Z0-9]/g, "_")}`;
}

function buildContext(matches) {
  let context = matches
    .map((m, idx) => {
      const pageInfo = m.metadata?.page ? `[Page ${m.metadata.page}]` : `[Excerpt ${idx + 1}]`;
      const text = m.metadata?.text || "";
      return `${pageInfo}:\n${text}`;
    })
    .join("\n\n");

  return context.length > MAX_CONTEXT_CHARS
    ? context.slice(0, MAX_CONTEXT_CHARS)
    : context;
}

function buildChatHistory(history) {
  return history
    .slice(-MAX_HISTORY_MESSAGES)
    .map(m => ({
      role: (m.role === "user" || m.type === "user") ? "user" : "model",
      parts: [{ text: m.text || m.content || "" }],
    }));
}

/*  CONTROLLER  */
export async function chat(req, res) {
  try {
    const question = req.body.question;
    const pdfId = req.body.pdfId || req.body.pdf_id;
    const history = req.body.history || [];
    const userId = req.user?._id;

    if (!question || !pdfId || !userId) {
      return res.status(400).json({
        success: false,
        message: "question and pdfId are required",
      });
    }

    const namespace = buildNamespace(userId, pdfId);
    console.log("Chatting in namespace:", namespace);

    /* Embed question using Pinecone Inference (1024-dim llama-text-embed-v2) */
    const embeddingResponse = await pinecone.inference.embed(
      'llama-text-embed-v2',
      [question],
      { inputType: 'query', truncate: 'END' }
    );

    const queryVector = embeddingResponse.data[0].values;

    /* Pinecone search */
    const searchResults = await pineconeIndex
      .namespace(namespace)
      .query({
        vector: queryVector,
        topK: TOP_K,
        includeMetadata: true,
      });

    if (!searchResults.matches?.length) {
      return res.json({
        success: true,
        answer: "I could not find relevant information in this document for your query. Could you please rephrase or ask about another topic?",
        sources: []
      });
    }

    /* Context + history */
    const context = buildContext(searchResults.matches);
    const chatHistory = buildChatHistory(history);

    // Extract deduplicated citations
    const seenPages = new Set();
    const sources = [];
    searchResults.matches.forEach((m) => {
      if (m.metadata?.text) {
        const pageNum = m.metadata?.page || 1;
        if (!seenPages.has(pageNum)) {
          seenPages.add(pageNum);
          sources.push({
            page: pageNum,
            snippet: (m.metadata.text || "").substring(0, 160) + "..."
          });
        }
      }
    });

    /* Create Gemini model */
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 1600,
      }
    });

    const chatSession = model.startChat({
      history: [
        ...chatHistory,
        {
          role: "user",
          parts: [{
            text: `
You are an expert AI Document Intelligence Assistant.

Role & Objectives:
1. Provide comprehensive, accurate, and educational answers grounded in the provided document context.
2. Structure your response cleanly using rich Markdown:
   - Use bold headers and bullet points for readability.
   - Highlight key terminology and definitions in **bold**.
   - If applicable, explain core concepts, examples, or code snippets provided in the document.
3. If the user asks a broad conceptual question (such as "What is DSA?", "Explain algorithm complexity", etc.):
   - Explain the concept clearly and thoroughly.
   - Relate it directly to how it is covered in this document.
4. If the exact answer is not in the context, clearly mention what the document contains and provide a helpful, reliable explanation.
5. Be professional, friendly, and structured.

Document Context:
${context}
            `.trim(),
          }],
        },
      ],
    });

    const result = await chatSession.sendMessage(question);
    const response = await result.response;
    const responseText = response.text() || "No response generated.";

    res.json({
      success: true,
      answer: responseText,
      sources: sources
    });

  } catch (error) {
    console.error("Chat error:", error);

    if (error?.status === 429 || error?.code === 429) {
      return res.status(429).json({
        success: false,
        answer: "AI quota exceeded. Please try again in a moment.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}
