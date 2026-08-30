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
const INITIAL_TOP_K = 10; // Broad initial retrieval
const FINAL_TOP_K = 4;    // Re-ranked top chunks
const RERANK_SCORE_THRESHOLD = 0.05; // Strict relevance threshold for cross-encoder reranker
const VECTOR_SCORE_THRESHOLD = 0.55; // Fallback threshold for raw vector similarity

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

    /* 1. Embed question using Pinecone Inference (1024-dim llama-text-embed-v2) */
    const embeddingResponse = await pinecone.inference.embed(
      'llama-text-embed-v2',
      [question],
      { inputType: 'query', truncate: 'END' }
    );

    const queryVector = embeddingResponse.data[0].values;

    /* 2. Initial broad search (Top-10 candidates) */
    const searchResults = await pineconeIndex
      .namespace(namespace)
      .query({
        vector: queryVector,
        topK: INITIAL_TOP_K,
        includeMetadata: true,
      });

    if (!searchResults.matches?.length) {
      return res.json({
        success: true,
        answer: "I could not find relevant information in the uploaded document.",
        sources: []
      });
    }

    // Prepare candidate chunks for re-ranking
    const candidateChunks = searchResults.matches
      .map((m, idx) => ({
        id: m.id || `${idx}`,
        text: m.metadata?.text || "",
        page: m.metadata?.page || 1,
        source: m.metadata?.source || "",
        rawScore: m.score || 0,
      }))
      .filter(c => c.text.trim().length > 0);

    let topRankedMatches = [];

    /* 3. Re-ranking via Pinecone Inference (bge-reranker-v2-m3) */
    try {
      const rerankDocuments = candidateChunks.map((c, i) => ({
        id: `${i}`,
        text: c.text
      }));

      const rerankResponse = await pinecone.inference.rerank(
        'bge-reranker-v2-m3',
        question,
        rerankDocuments,
        { topN: FINAL_TOP_K, returnDocuments: false }
      );

      const rerankedData = rerankResponse.data || [];
      console.log("Rerank result count:", rerankedData.length);

      // 4. Similarity / Relevance Score Thresholding
      const qualified = rerankedData.filter(d => d.score >= RERANK_SCORE_THRESHOLD);

      if (qualified.length === 0) {
        console.log("All chunks scored below rerank threshold:", RERANK_SCORE_THRESHOLD);
        return res.json({
          success: true,
          answer: "I could not find relevant information in the uploaded document.",
          sources: []
        });
      }

      topRankedMatches = qualified.map(d => ({
        ...candidateChunks[d.index],
        rerankScore: d.score,
        metadata: {
          text: candidateChunks[d.index].text,
          page: candidateChunks[d.index].page,
          source: candidateChunks[d.index].source,
        }
      }));
    } catch (rerankError) {
      console.warn("Pinecone inference rerank fallback:", rerankError.message);
      
      // Fallback: check raw vector similarity score
      const qualified = candidateChunks.filter(c => c.rawScore >= VECTOR_SCORE_THRESHOLD);
      if (qualified.length === 0) {
        return res.json({
          success: true,
          answer: "I could not find relevant information in the uploaded document.",
          sources: []
        });
      }

      topRankedMatches = qualified.slice(0, FINAL_TOP_K).map(c => ({
        ...c,
        metadata: {
          text: c.text,
          page: c.page,
          source: c.source,
        }
      }));
    }

    /* 5. Context + history construction */
    const context = buildContext(topRankedMatches);
    const chatHistory = buildChatHistory(history);

    // Extract deduplicated citations from top re-ranked chunks
    const seenPages = new Set();
    const sources = [];
    topRankedMatches.forEach((m) => {
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

    /* 6. Strict Grounded Gemini Model Setup */
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.1, // Low temperature to minimize hallucination
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
You are an expert Document Intelligence Assistant.

INSTRUCTIONS:
1. If the user asks a broad concept, term, or acronym question (e.g. "What is DSA?", "DSA??", "Explain Recursion"):
   - Briefly define the core concept clearly in 1-2 sentences.
   - Then explain thoroughly how this concept is discussed and applied in the provided "Document Context".
2. For specific questions about the document, answer strictly using the provided Document Context.
3. If the topic is completely absent from the Document Context, reply:
   "I could not find relevant information in the uploaded document."
4. Structure your response cleanly using rich Markdown (bold headers, key terms in **bold**, bullet points).

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
