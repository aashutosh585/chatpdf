import * as dotenv from 'dotenv';
dotenv.config();

import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import pdf from 'pdf-parse';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import fs from 'fs';
import path from 'path';
import os from 'os';
import Pdf from '../models/pdf.js';

export async function store(req, res) {
    try {
        console.log("Store controller called");
        if (!req.file) {
            console.log("No file in request");
            return res.status(400).json({ message: "No file uploaded" });
        }
        console.log("File received:", req.file);
        console.log("User:", req.user ? req.user._id : "No user");

        const fileName = req.file.originalname;
        const userId = req.user._id;

        // Check if PDF already exists for this user
        const existingPdf = await Pdf.findOne({ userId, fileName });
        if (existingPdf) {
            console.log("PDF already exists for user, skipping processing.");
            return res.status(200).json({ 
                message: "Agent is ready to chat (cached)", 
                pdfId: existingPdf.pdfId,
                namespace: existingPdf.namespace 
            });
        }

        // If using Cloudinary, req.file.path is the URL. 
        // If using local disk storage, req.file.path is the local path.
        // We need to handle both or assume one. The config/cloud.js suggests Cloudinary.
        // PDFLoader needs a local file. So we download it if it's a URL.

        let filePath = req.file.path;
        let isTemp = false;

        if (filePath.startsWith('http')) {
            // Ensure HTTPS
            if (filePath.startsWith('http:')) {
                filePath = filePath.replace('http:', 'https:');
            }

            console.log("Downloading file from URL:", filePath);
            // Download to temp file
            const response = await fetch(filePath);
            console.log(`Fetch Status: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch PDF from URL: ${response.status} ${response.statusText}`);
            }
            const buffer = await response.arrayBuffer();
            const tempDir = os.tmpdir();
            const tempFilePath = path.join(tempDir, `temp_${Date.now()}.pdf`);
            fs.writeFileSync(tempFilePath, Buffer.from(buffer));
            filePath = tempFilePath;
            isTemp = true;
            console.log("File downloaded to:", filePath);
        }

        console.log("Loading PDF from:", filePath);

        // First try pdf-parse for clean text extraction
        let extractedText = '';
        try {
            const pdfBuffer = fs.readFileSync(filePath);
            const pdfData = await pdf(pdfBuffer);
            extractedText = pdfData.text;
            console.log("PDF text extracted with pdf-parse, length:", extractedText.length);
        } catch (error) {
            console.log("pdf-parse failed, falling back to PDFLoader:", error.message);
        }

        let rawDocs;
        if (extractedText) {
            // Use the extracted text directly
            rawDocs = [{
                pageContent: extractedText,
                metadata: { source: fileName, page: 1 }
            }];
        } else {
            // Fallback to PDFLoader
            const pdfLoader = new PDFLoader(filePath, {
                splitPages: false,
            });
            rawDocs = await pdfLoader.load();
        }

        console.log("PDF processing complete, documents:", rawDocs.length);

        // Filter out any documents that might contain image data
        const textOnlyDocs = rawDocs.filter(doc => {
            // Check if the document contains text (not image data)
            const hasText = typeof doc.pageContent === 'string' && doc.pageContent.trim().length > 10; // Increased minimum length
            const noImageData = !doc.pageContent.includes('data:image/'); // Only check for actual data URIs, not file extensions

            console.log(`Document check: hasText=${hasText}, noImageData=${noImageData}, length=${doc.pageContent.length}`);
            return hasText && noImageData;
        });

        console.log(`Filtered to ${textOnlyDocs.length} text documents out of ${rawDocs.length} total`);

        // Log sample content for debugging
        if (textOnlyDocs.length > 0) {
            console.log("Sample document content:", textOnlyDocs[0].pageContent.substring(0, 200) + "...");
        }

        // Clean up temp file
        if (isTemp) {
            fs.unlinkSync(filePath);
        }

        // chunking of data
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        const chunkedDocs = await textSplitter.splitDocuments(textOnlyDocs);
        console.log("PDF Chunked");

        // Validate chunks before embedding
        const validChunks = chunkedDocs.filter(doc => {
            const hasContent = doc.pageContent && doc.pageContent.trim().length > 0;
            if (!hasContent) {
                console.log("Filtered out empty chunk:", doc);
            }
            return hasContent;
        });

        console.log(`Valid chunks: ${validChunks.length} out of ${chunkedDocs.length}`);

        if (validChunks.length === 0) {
            throw new Error("No valid text content found in PDF after processing. The PDF may contain only images or be corrupted.");
        }

        // Vector embedding 
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY,
            model: 'gemini-embedding-001',
            output_dimensionality: 768,
        });
        console.log("Embeddings created");

        // DB Configure Pinecone
        const pinecone = new Pinecone();
        const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);
        console.log("Pinecone Configured");

        // Namespace: user_<userId>_pdf_<filename>
        // We use req.file.filename (Cloudinary public_id) or req.file.originalname
        const pdfId = req.file.filename || req.file.originalname;
        const namespace = `user_${req.user._id}_pdf_${pdfId.replace(/[^a-zA-Z0-9]/g, '_')}`;

        console.log("Storing in namespace:", namespace);

        // Log what we're about to store
        console.log(`Storing ${validChunks.length} chunks in Pinecone`);
        validChunks.forEach((doc, i) => {
            console.log(`Chunk ${i}: length=${doc.pageContent.length}, content preview: "${doc.pageContent.substring(0, 100)}..."`);
        });

        // Test embedding a single chunk first to verify dimensions
        console.log("Testing embedding with first chunk...");
        const testEmbedding = await embeddings.embedQuery(validChunks[0].pageContent);
        console.log(`Original embedding dimension: ${testEmbedding.length}`);

        // Create vectors manually with truncated dimensions
        const vectors = validChunks.map((doc, i) => {
            return {
                id: `${namespace}_${i}`,
                values: Array(768).fill(0.1), // Placeholder - we'll generate real embeddings
                metadata: { 
                    text: doc.pageContent,
                    source: doc.metadata.source || 'pdf',
                    page: doc.metadata.page || i
                }
            };
        });

        // Generate embeddings for all documents and truncate them to 768 dimensions
        console.log("Generating embeddings for all documents and truncating to 768 dimensions...");
        for (let i = 0; i < validChunks.length; i++) {
            const embedding = await embeddings.embedQuery(validChunks[i].pageContent);
            vectors[i].values = embedding.slice(0, 768); // Truncate to 768 dimensions
        }

        console.log(`Uploading ${vectors.length} vectors to Pinecone...`);
        await pineconeIndex.upsert(vectors, { namespace });

        console.log("Successfully stored in Pinecone");

        console.log("data stored successfully");

        // Save PDF metadata to MongoDB
        await Pdf.create({
            userId: userId,
            fileName: fileName,
            pdfId: pdfId,
            namespace: namespace
        });

        // Send success response
        res.status(200).json({ 
            message: "PDF uploaded and processed successfully", 
            pdfId: pdfId,
            namespace: namespace 
        });
    } catch (error) {
        console.log("PDF metadata saved to DB");
        console.error("Error in store controller:", error);
        if (error.message && error.message.includes("Upserting dense vectors is not supported for sparse indexes")) {
            return res.status(400).json({
                message: "Pinecone Index Mismatch: Your index is configured for Sparse vectors. Please create a NEW index with Dimension 768 (for Gemini) and Metric: Cosine.",
                error: error.message
            });
        }
        res.status(500).json({ message: `Error processing PDF: ${error.message}`, error: error });
    }
    
}


