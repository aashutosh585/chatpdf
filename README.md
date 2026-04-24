# ChatPDF - AI-Powered Document Q&A

**ChatPDF** is a full-stack web application that revolutionizes how you interact with documents. Upload any PDF and engage in natural conversations with its content using cutting-edge AI. Built with a modern React frontend, Node.js/Express backend, and powered by Google's Gemini AI with vector search capabilities.

---


## 🚀 Features

- **Secure JWT Authentication**: Email/password registration & login with JWT-based session management
- **PDF Upload & Management**: Upload, store, and manage PDF documents securely via Cloudinary
- **AI-Powered Chat**: Natural language Q&A powered by Google's Gemini AI
- **Semantic Search**: Pinecone vector database for intelligent information retrieval
- **Interactive Dashboard**: Central hub for managing PDFs and viewing chat history
- **Real-time Chat Interface**: Smooth, responsive chat experience with typing indicators
- **Responsive Design**: Mobile-friendly UI built with Tailwind CSS

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | Modern UI library with hooks and concurrent features |
| **Vite** | Lightning-fast build tool and dev server |
| **Tailwind CSS 4** | Utility-first CSS framework |
| **React Router 7** | Client-side routing and navigation |
| **Axios** | HTTP client for API communication |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime environment |
| **Express 5** | Web application framework |
| **MongoDB** | NoSQL database for user & document metadata |
| **Mongoose** | MongoDB object modeling |
| **bcryptjs** | Password hashing & authentication |
| **Multer** | Middleware for file upload handling |
| **LangChain** | Framework for LLM-powered applications |

### AI & Infrastructure
| Service | Purpose |
|---------|---------|
| **Google Gemini** | Large Language Model for embeddings & chat |
| **Pinecone** | Vector database for semantic search |
| **Cloudinary** | Cloud storage for PDF files |

---

## 📋 Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (Local or Atlas) - [Download](https://www.mongodb.com/try/download/community)
- **Google Cloud Account** (for Gemini API) - [Get Started](https://cloud.google.com/)
- **Pinecone Account** - [Sign Up](https://www.pinecone.io/)
- **Cloudinary Account** - [Sign Up](https://cloudinary.com/)

---

## ⚙️ Environment Setup

### Backend Environment

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=8000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# JWT Authentication (Change these in production!)
SECRET_KEY=your_super_secret_jwt_key_minimum_32_chars_long

# MongoDB
MONGO_URI=your_mongodb_connection_string

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Pinecone Vector Database
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_pinecone_index_name

# multer
MAX_FILE_SIZE=5000000
```

### Frontend Environment

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:8000
```

---

## 🚀 Installation & Running

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server (with nodemon)
npm run dev

# Or start production server
npm start
```

**Server runs at**: `http://localhost:8000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Application runs at**: `http://localhost:5173`

---

## 🧪 Testing & Data Management

To clear all data from databases (MongoDB + Pinecone) for testing:

```bash
cd backend
npm run test
```

**WARNING**: This command permanently deletes ALL data including:
- All user accounts
- All PDF metadata
- All vector embeddings from Pinecone

---

## 📖 Usage Guide

### 1. **Account Creation**
- Visit the application and click "Sign Up"
- Enter your email and desired password
- Receive confirmation of successful registration

### 2. **Upload PDF**
- Log in to your dashboard
- Click "Upload New PDF"
- Select a PDF file from your computer
- Wait for processing completion

### 3. **Chat with PDF**
- Click on any uploaded PDF from your list
- Type questions in the chat interface
- Receive AI-generated answers based on document content

### 4. **Manage Documents**
- View all uploaded PDFs in dashboard
- Delete documents you no longer need
- Access chat history for each document

---

## 📂 Project Structure

```
chatpdf/
│
├── backend/                          # Node.js/Express Backend
│   ├── config/                       # Configuration files
│   │   ├── cloud.js                 # Cloudinary setup
│   │   ├── db.js                    # MongoDB connection
│   │   ├── gemini.js                # Google Gemini setup
│   │   ├── multer.js                # File upload configuration
│   │   └── pinecone.js              # Pinecone vector DB setup
│   ├── controller/                   # Request handlers
│   │   ├── chatController.js        # Chat & AI endpoints
│   │   └── store.js                 # File upload & PDF processing
│   ├── middleware/                   # Custom middleware
│   │   └── isAuth.js                # JWT authentication middleware
│   ├── models/                       # Mongoose models
│   │   ├── user.js                  # User schema
│   │   └── pdf.js                   # PDF document schema
│   ├── routes/                       # API route definitions
│   │   ├── auth.js                  # Authentication routes
│   │   ├── chat.js                  # Chat API routes
│   │   └── pdf.js                   # PDF management routes
│   ├── .env.example                 # Environment template
│   ├── package.json                 # Backend dependencies
│   ├── server.js                    # Express server entry point
│   └── test.js                      # Database clearing utility
│
├── frontend/                         # React Frontend
│   ├── public/                       # Static assets
│   │   ├── logoPDF.svg
│   │   └── vite.svg
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── ChatInterface.jsx    # Chat UI component
│   │   │   ├── Navbar.jsx           # Navigation bar
│   │   │   ├── PdfTable.jsx         # PDF list table
│   │   │   ├── ProtectedRoute.jsx   # Auth guard component
│   │   │   └── UploadPdf.jsx        # File upload component
│   │   ├── hooks/                   # Custom React hooks
│   │   │   └── useAuth.js           # Authentication hook
│   │   ├── pages/                   # Page components
│   │   │   ├── Dashboard.jsx        # User dashboard
│   │   │   ├── LandingPage.jsx      # Landing/Home page
│   │   │   ├── ChatPage.jsx         # PDF chat interface
│   │   │   ├── LoginPage.jsx        # Login page
│   │   │   └── PdfListPage.jsx      # PDF listing page
│   │   ├── App.jsx                  # Main React component
│   │   ├── index.css                # Global styles
│   │   └── main.jsx                 # React entry point
│   ├── .env.example                 # Environment template
│   ├── index.html                   # HTML template
│   ├── package.json                 # Frontend dependencies
│   └── vite.config.js               # Vite configuration
│
└── README.md                        # Project documentation (you are here)
```

---

## 🔗 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |

### PDF Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pdfs` | Get all user PDFs |
| POST | `/api/pdfs/upload` | Upload new PDF |
| GET | `/api/pdfs/:id` | Get specific PDF details |
| DELETE | `/api/pdfs/:id` | Delete PDF |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message to PDF AI |

---

## 🤝 Contributing

Contributions are welcome! Follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



---

## 👤 Author

**Ashutosh Maurya**

Full-stack developer passionate about building AI-powered applications.

- **Portfolio**: [aashutosh.me](https://aashutosh.me)
- **GitHub**: [github.com/AshutoshMaurya](https://github.com/aashutosh585)
- **LinkedIn**: [linkedin.com/in/aashutosh-maurya](https://www.linkedin.com/in/ashutosh585)

---

*Built with ❤️ using React, Node.js, and Google Gemini AI*
