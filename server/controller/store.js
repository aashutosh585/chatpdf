import * as dotenv from 'dotenv';
dotenv.config();

import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import pdf from 'pdf-parse';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Pinecone } from '@pinecone-database/pinecone';
import fs from 'fs';
import path from 'path';
import os from 'os';
import Pdf from '../models/pdf.js';

export async function store(req, res) {
    let tempFilePathToDelete = null;

    try {
        console.log("Store controller called");
        if (!req.file) {
            console.log("No file in request");
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        console.log("File received:", req.file.originalname);
        console.log("User:", req.user ? req.user._id : "No user");

        const fileName = req.file.originalname;
        const userId = req.user._id;

        // Check if PDF already exists for this user
        const existingPdf = await Pdf.findOne({ userId, fileName });
        if (existingPdf) {
            console.log("PDF already exists for user, skipping processing.");
            return res.status(200).json({
                success: true,
                message: "Agent is ready to chat (cached)",
                pdfId: existingPdf.pdfId,
                fileName: existingPdf.fileName,
                namespace: existingPdf.namespace
            });
        }

        let filePath = req.file.path;

        if (filePath.startsWith('http')) {
            if (filePath.startsWith('http:')) {
                filePath = filePath.replace('http:', 'https:');
            }

            console.log("Downloading file from URL:", filePath);
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Failed to fetch PDF from URL: ${response.status} ${response.statusText}`);
            }
            const buffer = await response.arrayBuffer();
            const tempDir = os.tmpdir();
            const tempFilePath = path.join(tempDir, `temp_${Date.now()}.pdf`);
            fs.writeFileSync(tempFilePath, Buffer.from(buffer));
            filePath = tempFilePath;
            tempFilePathToDelete = tempFilePath;
            console.log("File downloaded to:", filePath);
        } else {
            tempFilePathToDelete = filePath;
        }

        console.log("Loading PDF from:", filePath);

        // Load PDF with page numbers preserved
        let rawDocs = [];
        try {
            const pdfLoader = new PDFLoader(filePath, {
                splitPages: true,
            });
            rawDocs = await pdfLoader.load();
            console.log(`PDFLoader loaded ${rawDocs.length} pages`);
        } catch (loaderErr) {
            console.log("PDFLoader failed, falling back to pdf-parse:", loaderErr.message);
            try {
                const pdfBuffer = fs.readFileSync(filePath);
                const pdfData = await pdf(pdfBuffer);
                if (pdfData.text && pdfData.text.trim()) {
                    rawDocs = [{
                        pageContent: pdfData.text,
                        metadata: { source: fileName, page: 1, loc: { pageNumber: 1 } }
                    }];
                }
            } catch (parseErr) {
                console.error("pdf-parse fallback also failed:", parseErr.message);
            }
        }

        console.log("PDF processing complete, pages/documents:", rawDocs.length);

        // Clean up temp file immediately after reading
        if (tempFilePathToDelete && fs.existsSync(tempFilePathToDelete)) {
            try {
                fs.unlinkSync(tempFilePathToDelete);
                tempFilePathToDelete = null;
            } catch (err) {
                console.warn("Could not delete temp file:", err.message);
            }
        }

        // Filter out documents with invalid text
        const textOnlyDocs = rawDocs.filter(doc => {
            const hasText = typeof doc.pageContent === 'string' && doc.pageContent.trim().length > 10;
            const noImageData = !doc.pageContent.includes('data:image/');
            return hasText && noImageData;
        });

        console.log(`Filtered to ${textOnlyDocs.length} text documents out of ${rawDocs.length} total`);

        if (textOnlyDocs.length === 0) {
            throw new Error("No valid text content found in PDF after processing. The PDF may contain only images or be corrupted.");
        }

        // Chunking of data
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        const chunkedDocs = await textSplitter.splitDocuments(textOnlyDocs);

        // Validate chunks before embedding
        const validChunks = chunkedDocs.filter(doc => {
            return doc.pageContent && doc.pageContent.trim().length > 0;
        });

        console.log(`Valid chunks: ${validChunks.length} out of ${chunkedDocs.length}`);

        if (validChunks.length === 0) {
            throw new Error("No valid text chunks generated from PDF.");
        }

        // Configure Pinecone Client
        const pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
        });
        const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

        const pdfId = req.file.filename || `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const namespace = `user_${req.user._id}_pdf_${pdfId.replace(/[^a-zA-Z0-9]/g, '_')}`;

        console.log("Storing in namespace:", namespace);
        console.log(`Batch embedding ${validChunks.length} chunks via Pinecone Inference (llama-text-embed-v2, 1024-dim)...`);

        const chunkTexts = validChunks.map(doc => doc.pageContent);
        const vectors = [];

        // Pinecone Inference allows up to 50-96 inputs per request
        const EMBED_BATCH_SIZE = 50;
        for (let i = 0; i < chunkTexts.length; i += EMBED_BATCH_SIZE) {
            const textBatch = chunkTexts.slice(i, i + EMBED_BATCH_SIZE);
            const embeddingResponse = await pinecone.inference.embed(
                'llama-text-embed-v2',
                textBatch,
                { inputType: 'passage', truncate: 'END' }
            );

            embeddingResponse.data.forEach((emb, batchIndex) => {
                const globalIndex = i + batchIndex;
                const doc = validChunks[globalIndex];
                const pageNum = doc.metadata?.loc?.pageNumber || doc.metadata?.page || (globalIndex + 1);
                vectors.push({
                    id: `${namespace}_${globalIndex}`,
                    values: emb.values,
                    metadata: {
                        text: doc.pageContent,
                        source: doc.metadata?.source || fileName,
                        page: pageNum,
                    }
                });
            });
        }

        console.log(`Uploading ${vectors.length} vectors to Pinecone in batches...`);

        // Upsert to Pinecone
        const UPSERT_BATCH_SIZE = 100;
        for (let i = 0; i < vectors.length; i += UPSERT_BATCH_SIZE) {
            const batch = vectors.slice(i, i + UPSERT_BATCH_SIZE);
            await pineconeIndex.namespace(namespace).upsert(batch);
        }

        console.log("Successfully stored vectors in Pinecone");

        // Save PDF metadata to MongoDB
        await Pdf.create({
            userId: userId,
            fileName: fileName,
            pdfId: pdfId,
            namespace: namespace
        });

        res.status(200).json({
            success: true,
            message: "PDF uploaded and processed successfully",
            pdfId: pdfId,
            fileName: fileName,
            namespace: namespace
        });
    } catch (error) {
        console.error("Error in store controller:", error);
        res.status(500).json({
            success: false,
            message: `Error processing PDF: ${error.message}`,
            error: error.message
        });
    } finally {
        if (tempFilePathToDelete && fs.existsSync(tempFilePathToDelete)) {
            try {
                fs.unlinkSync(tempFilePathToDelete);
            } catch (err) {
                // ignore
            }
        }
    }
}
