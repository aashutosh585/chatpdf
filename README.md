# 📄 ChatPDF - AI-Powered Document Q&A Platform

🌍 **Live Demo:** [http://18.207.127.87](http://18.207.127.87)

**ChatPDF is a full-stack AI-powered document intelligence platform that allows users to upload PDF documents and interact with them using natural language. Powered by an end-to-end RAG (Retrieval-Augmented Generation) pipeline using Google Gemini 1.5 Flash, LangChain, and Pinecone vector database.**

---

## ✨ Features

- 🔐 **JWT Authentication & Security** - User registration, password hashing with bcrypt, session validation, and protected routes.
- 📁 **Smart PDF Processing** - Cloudinary cloud storage, dual-layer PDF parsing (`pdf-parse` & LangChain `PDFLoader`), and recursive character chunking (500-chunk size / 120-overlap).
- 🧠 **Vector Embeddings & Advanced Search** - 1024-dimensional vector generation via Pinecone Inference (`llama-text-embed-v2`), Top-10 initial semantic retrieval, and precise re-ranking via `bge-reranker-v2-m3` (Top-4).
- 🛡️ **Multi-Tenant Namespace Isolation** - PDF vectors are strictly indexed under dynamic namespaces (`user_{userId}_pdf_{pdfId}`) to prevent cross-user/document data leakage.
- 💬 **Conversational Context Memory** - Multi-turn conversation history management coupled with strictly grounded context assembly for answers via **Google Gemini 2.5 Flash**.
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
| **Google Gemini API** | Generative Chat (`gemini-2.5-flash`) |
| **Pinecone** | Vector database & Native Serverless Inference (`llama-text-embed-v2` & `bge-reranker-v2-m3`) |
| **Cloudinary & Multer** | Cloud PDF storage & multipart file handling |
| **JWT & Bcrypt.js** | Token-based auth & cryptographic password hashing |

### DevOps & Deployment
| Technology | Purpose |
|:-----------|:--------|
| **Docker & Docker Compose** | Containerization of frontend and backend services |
| **GitHub Actions** | Automated CI/CD pipeline for testing and deployment |
| **AWS EC2** | Cloud hosting infrastructure |
| **Nginx** | Reverse proxy and web server |

---

## 🏗️ Architecture & RAG Pipeline Flow

```
[User Uploads PDF] 
       │
       ▼
[Dual Parser: pdf-parse / PDFLoader] 
       │
       ▼
[RecursiveCharacterTextSplitter (chunk: 500, overlap: 120)] 
       │
       ▼
[Pinecone Inference: llama-text-embed-v2 (1024-dim)] 
       │
       ▼
[Pinecone Upsert (Namespace: user_{userId}_pdf_{pdfId})]
```

```
[User Asks Question] 
       │
       ▼
[Embed Question Vector via Pinecone Inference] 
       │
       ▼
[Initial Semantic Search in Namespace (Top-10)] 
       │
       ▼
[Pinecone Inference: bge-reranker-v2-m3 (Reranks to Top-4)]
       │
       ▼
[Context Assembly + Chat History Window] 
       │
       ▼
[Google Gemini 2.5 Flash Inference] 
       │
       ▼
[Strictly Grounded Response + Sources]
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

### 2. Running with Docker (Recommended)
You can run the entire application (Frontend + Backend) locally with a single command using Docker. First, ensure you create the `.env` files inside both `server/` and `frontend/` as described below.

```bash
docker compose up --build -d
```
Your frontend will be instantly available at `http://localhost:3000` and backend at `http://localhost:8000`.

---

### 3. Manual Setup: Server (`server/`)
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

### 4. Manual Setup: Frontend (`frontend/`)
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

## ☁️ CI/CD Deployment

This project uses a fully automated **GitHub Actions CI/CD Pipeline** to seamlessly deploy updates to **AWS EC2**.

1. Every push to the `main` branch triggers the `.github/workflows/deploy.yml` workflow.
2. The pipeline validates the code and securely transfers the files to the EC2 server using SCP.
3. It dynamically links secure environment variables on the server.
4. **Docker Compose** handles rebuilding and gracefully restarting the application containers.
5. **Nginx** on the host server acts as a reverse proxy, instantly routing traffic to the updated application.

*(For detailed local infrastructure notes, see `deploy.md` locally).*

---

## 📂 Project Structure

```
chatpdf/
├── .github/workflows/                # CI/CD pipelines
│   └── deploy.yml                    # Automated EC2 deployment script
├── frontend/                         # React Frontend Application
│   ├── src/                          # React source code
│   ├── Dockerfile                    # Multi-stage Docker build for frontend
│   └── nginx.conf                    # Nginx config for frontend container
│
├── server/                           # Express.js Backend Application
│   ├── config/                       # DB and Cloud configs
│   ├── controller/                   # RAG, Pinecone, and Gemini logic
│   ├── routes/                       # Express routes
│   └── server.js                     # Server entry point
│
├── nginx/                            # Host Nginx configuration
│   └── chatpdf.conf                  # Reverse proxy config for EC2
├── docker-compose.yml                # Multi-container orchestration
├── dockerfile                        # Backend Dockerfile
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
