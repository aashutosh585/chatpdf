# 📄 ChatPDF - AI-Powered Document Q&A Platform

**ChatPDF is a full-stack AI-powered document intelligence platform that allows users to upload PDF documents and interact with them using natural language. Powered by an end-to-end RAG (Retrieval-Augmented Generation) pipeline using Google Gemini 1.5 Flash, LangChain, and Pinecone vector database.**

---

## ✨ Features

- 🔐 **JWT Authentication & Security** - User registration, password hashing with bcrypt, session validation, and protected routes.
- 📁 **Smart PDF Processing** - Cloudinary cloud storage, dual-layer PDF parsing (`pdf-parse` & LangChain `PDFLoader`), and recursive character chunking (1000/200 overlap).
- 🧠 **Vector Embeddings & Semantic Search** - 1024-dimensional vector generation via Pinecone Inference (`llama-text-embed-v2`) and Top-K semantic retrieval.
- 🛡️ **Multi-Tenant Namespace Isolation** - PDF vectors are strictly indexed under dynamic namespaces (`user_{userId}_pdf_{pdfId}`) to prevent cross-user/document data leakage.
- 💬 **Conversational Context Memory** - Multi-turn conversation history management coupled with retrieved vector chunks for precise context-grounded answers via Google Gemini 1.5 Flash.
- ⚡ **Responsive UI** - Modern interface built with React, Vite, and Tailwind CSS.

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|:-----------|:--------|
| **React 19** | Frontend UI library |
| **Vite** | Build tool & local development server |
| **Tailwind CSS** | Utility-first styling |
| **React Router** | Client-side routing |
| **Axios** | HTTP client for backend communication |

### Backend (`server/`)
| Technology | Purpose |
|:-----------|:--------|
| **Node.js & Express.js** | Backend runtime & RESTful API framework |
| **MongoDB & Mongoose** | NoSQL database for users & PDF document metadata |
| **LangChain** | Document processing & chunking (`RecursiveCharacterTextSplitter`) |
| **Google Gemini API** | Embeddings (`gemini-embedding-001`) & Generative Chat (`gemini-1.5-flash`) |
| **Pinecone** | Managed vector database for high-speed similarity search |
| **Cloudinary & Multer** | Cloud PDF storage & multipart file handling |
| **JWT & Bcrypt.js** | Token-based auth & cryptographic password hashing |

---

## 🏗️ Architecture & RAG Pipeline Flow

```
[User Uploads PDF] 
       │
       ▼
[Dual Parser: pdf-parse / PDFLoader] 
       │
       ▼
[RecursiveCharacterTextSplitter (chunk: 1000, overlap: 200)] 
       │
       ▼
[Gemini Embeddings (768-dim)] 
       │
       ▼
[Pinecone Upsert (Namespace: user_{userId}_pdf_{pdfId})]
```

```
[User Asks Question] 
       │
       ▼
[Embed Question Vector] 
       │
       ▼
[Pinecone Top-K Semantic Search in Namespace] 
       │
       ▼
[Context Assembly + Chat History Window] 
       │
       ▼
[Google Gemini 1.5 Flash Inference] 
       │
       ▼
[Streamed / Grounded Response to Frontend]
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18+)
- **MongoDB** (Local or MongoDB Atlas)
- **Google Gemini API Key** ([Google AI Studio](https://aistudio.google.com/))
- **Pinecone API Key & Index** ([Pinecone Console](https://www.pinecone.io/))
- **Cloudinary Account** ([Cloudinary](https://cloudinary.com/))

---

### 1. Clone the Repository
```bash
git clone https://github.com/aashutosh585/chatpdf.git
cd chatpdf
```

---

### 2. Setup Server (`server/`)
```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:
```env
PORT=8000
CLIENT_URL=http://localhost:5173
MONGO_URI=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret_key

# Google Gemini
GEMINI_API_KEY=your_google_gemini_api_key

# Pinecone (Dimension: 1024, Metric: Cosine, Model: llama-text-embed-v2)
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=ragpdf

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start the backend server:
```bash
npm run dev
# Server runs on http://localhost:8000
```

---

### 3. Setup Frontend (`frontend/`)
In a new terminal window:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:8000
```

Start the frontend development server:
```bash
npm run dev
# App runs on http://localhost:5173
```

---

## 📂 Project Structure

```
chatpdf/
├── frontend/                         # React Frontend Application
│   ├── src/
│   │   ├── components/               # UI components (Chat, Upload, Navbar, Tables)
│   │   ├── hooks/                    # Custom React hooks (useAuth)
│   │   ├── pages/                    # Views (Dashboard, Chat, Login, Landing)
│   │   ├── App.jsx                   # Route configurations
│   │   └── main.jsx                  # Application entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                           # Express.js Backend Application
│   ├── config/
│   │   ├── cloud.js                  # Cloudinary configuration
│   │   ├── db.js                     # MongoDB connection
│   │   └── multer.js                 # File upload middleware
│   ├── controller/
│   │   ├── chatController.js         # RAG query, Pinecone retrieval & Gemini chat
│   │   └── store.js                  # PDF text extraction, chunking & vector storage
│   ├── middleware/
│   │   └── isAuth.js                 # JWT verification middleware
│   ├── models/
│   │   ├── pdf.js                    # PDF metadata schema
│   │   └── user.js                   # User auth schema
│   ├── routes/
│   │   ├── authRoute.js              # Auth endpoints (/auth/*)
│   │   └── userRoute.js              # PDF & chat endpoints (/user/*)
│   ├── server.js                     # Server entry point
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🔗 API Endpoints

### Authentication (`/auth`)
| Method | Endpoint | Description | Auth Required |
|:-------|:---------|:------------|:-------------:|
| `POST` | `/auth/register` | Register a new user | ❌ |
| `POST` | `/auth/login` | Log in user and receive JWT | ❌ |
| `GET` | `/auth/me` | Retrieve authenticated user profile | ✅ |
| `POST` | `/auth/logout` | Invalidate current session | ✅ |

### User & Document Management (`/user`)
| Method | Endpoint | Description | Auth Required |
|:-------|:---------|:------------|:-------------:|
| `POST` | `/user/uploadpdf` | Upload PDF, parse, chunk & vectorize to Pinecone | ✅ |
| `POST` | `/user/chat` | Query RAG pipeline for conversational Q&A | ✅ |
| `GET` | `/user/pdfs` | List all processed PDFs for current user | ✅ |
| `GET` | `/user/profile` | Get user profile details | ✅ |

---

## 👤 Author & Support

**Ashutosh Maurya**
- 🌐 Portfolio: [aashutosh.me](https://aashutosh.me)
- 💻 GitHub: [@aashutosh585](https://github.com/aashutosh585)
- 💼 LinkedIn: [ashutosh585](https://www.linkedin.com/in/ashutosh585)
- 📧 Email: [ashutoshmaurya585@gmail.com](mailto:ashutoshmaurya585@gmail.com)

---

<div align="center">
⭐ If you found this project helpful, please consider giving it a star on GitHub!
</div>
