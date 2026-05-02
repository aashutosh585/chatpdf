# 📄 ChatPDF - AI-Powered Document Q&A Platform

**ChatPDF is an AI-powered platform that lets you upload PDF documents and interact with them using natural language. Leveraging Google's Gemini AI and Pinecone vector search, the platform provides accurate, context-aware answers to your questions about document content.**

---

## 🌐 Live Demo

- **Live URL**: [Add your live URL here](your-live-url)
- **Backend API**: [Add your backend URL here](your-backend-url)

---

## ✨ Features

- ✅ **Secure JWT Authentication** - Email/password registration & login with JWT-based session management
- ✅ **PDF Upload & Management** - Upload, store, and manage PDF documents securely via Cloudinary  
- ✅ **AI-Powered Chat** - Natural language Q&A powered by Google's Gemini AI
- ✅ **Semantic Search** - Pinecone vector database for intelligent information retrieval
- ✅ **Interactive Dashboard** - Central hub for managing PDFs and viewing chat history
- ✅ **Real-time Chat Interface** - Smooth, responsive chat experience with typing indicators
- ✅ **Responsive Design** - Mobile-friendly UI built with Tailwind CSS

## 🎬 Demo / Screenshots

*Add screenshots of the application here*

- Landing Page / Hero Section
- Dashboard with PDF uploads
- Chat interface in action
- Authentication flow

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|:-----------|:--------|
| **React 19** | Modern UI library with hooks and concurrent features |
| **Vite** | Lightning-fast build tool and dev server |
| **Tailwind CSS 4** | Utility-first CSS framework |
| **React Router 7** | Client-side routing and navigation |
| **Axios** | HTTP client for API communication |

### Backend
| Technology | Purpose |
|:-----------|:--------|
| **Python 3.10+** | Programming language |
| **FastAPI** | Modern, fast web framework for building APIs |
| **MongoDB** | NoSQL database for user & document metadata |
| **Pymongo** | MongoDB driver for Python |
| **bcrypt** | Password hashing & authentication |
| **Google Gemini** | Large Language Model for embeddings & chat |
| **Pinecone** | Vector database for semantic search |
| **Cloudinary** | Cloud storage for PDF files |

### AI & Cloud Services
| Service | Purpose |
|:--------|:--------|
| **Google Gemini** | Large Language Model for embeddings & chat |
| **Pinecone** | Vector database for semantic search |
| **Cloudinary** | Cloud storage for PDF files |

---

## � Quick Start

Get ChatPDF running locally in minutes!

### Prerequisites

- **Node.js** v16+ ([Download](https://nodejs.org/))
- **MongoDB** local or cloud ([Get Started](https://www.mongodb.com/))
- **Google Gemini API** key ([Free tier](https://cloud.google.com/))
- **Pinecone** account ([Free tier](https://www.pinecone.io/))
- **Cloudinary** account ([Free tier](https://cloudinary.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aashutosh585/chatpdf.git
   cd chatpdf
   ```

2. **Setup Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   cp .env.example .env
   # Update .env with your API keys
   uvicorn main:app --reload  # Runs on http://localhost:8000
   ```

3. **Setup Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Update .env with backend URL
   npm run dev  # Runs on http://localhost:5173
   ```

4. **Open your browser**
   ```
   http://localhost:5173
   ```

---

## 📋 Environment Variables

### Backend `.env`

```env
# Server Configuration
PORT=8000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# JWT Authentication
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

# File Upload
MAX_FILE_SIZE=5000000
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:8000
```

---

## 🎮 Development Commands

### Backend
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Start dev server (with auto-reload)
uvicorn main:app --reload

# For production, use a production server
# Example: gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🧪 Testing & Data Management

To clear all data from databases (MongoDB + Pinecone) for testing:

```bash
cd backend
npm run test
```

⚠️ **WARNING**: This command permanently deletes:
- All user accounts
- All PDF metadata
- All vector embeddings from Pinecone

---

## 📖 Usage Guide

### Step 1: Create Account
- Visit the application homepage
- Click "Sign Up"
- Enter your email and password
- Account created successfully!

### Step 2: Upload PDF
- Log in to your dashboard
- Click "Upload New PDF" button
- Select a PDF file from your computer
- Wait for processing (file vectorized & stored)

### Step 3: Chat with PDF
- Click on any PDF from your list
- Ask questions in the chat box
- AI analyzes document and responds with relevant answers

### Step 4: Manage Documents
- View all PDFs in your dashboard
- Delete documents you no longer need
- Access full chat history for each document

---

## 📂 Project Structure

```
chatpdf/
│
├── backend/                          # FastAPI Backend
│   ├── .env
│   ├── .gitignore
│   ├── main.py                       # Entry point for the FastAPI app
│   ├── README.md                     # Backend-specific documentation
│   ├── requirements.txt              # Python dependencies
│   ├── app/                          # Application package
│   │   ├── __init__.py
│   │   ├── database.py               # Database connection and setup
│   │   ├── config/
│   │   │   └── __init__.py           # Configuration
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── pdf.py                # PDF model
│   │   │   └── user.py               # User model
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py               # Authentication routes
│   │   │   └── users.py              # User management routes
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── auth.py               # Authentication utilities
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
│   ├── package-lock.json
│   ├── package.json                 # Frontend dependencies
│   └── vite.config.js               # Vite configuration
│
└── README.md                        # Project documentation (you are here)
```

---

## 🔗 API Endpoints

### Authentication
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login with credentials |
| GET | `/api/auth/me` | Get current authenticated user |

### PDF Management
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| GET | `/api/pdfs` | Get all user's PDFs |
| POST | `/api/pdfs/upload` | Upload & process new PDF |
| GET | `/api/pdfs/{id}` | Get specific PDF details |
| DELETE | `/api/pdfs/{id}` | Delete PDF and associated data |

### Chat & AI
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| POST | `/api/chat` | Send message to PDF AI |
| GET | `/api/chat/{pdfId}` | Get chat history for PDF |

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
- Verify `MONGO_URI` in `.env` is correct
- Ensure MongoDB server is running locally or cloud
- Check network/firewall settings

### API Keys Invalid
```
Error: Invalid or missing API key
```
**Solution:**
- Verify all API keys in `.env` file
- Ensure services are active (Gemini, Pinecone, Cloudinary)
- Re-generate keys if needed

### PDF Upload Fails
```
Error: File size exceeds maximum
```
**Solution:**
- Check file size (default max: 5MB)
- Verify Cloudinary credentials in `.env`
- Check Pinecone index exists and is accessible

### Chat Returns Empty Responses
```
Error: Unable to generate response
```
**Solution:**
- Verify Gemini API key is valid & active
- Check PDF was properly vectorized in Pinecone
- Ensure PDF text is extractable (not image-based)

---

## 🔒 Security Best Practices

- ✅ Never commit `.env` files (add to `.gitignore`)
- ✅ Use strong, unique `SECRET_KEY` for JWT
- ✅ Enable HTTPS in production
- ✅ Validate all user inputs on backend
- ✅ Use CORS properly to restrict API access
- ✅ Regularly update dependencies
- ✅ Use environment-specific API endpoints

---

## 🤝 Contributing

Contributions are welcome! Help us improve ChatPDF.

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Make** your changes
4. **Commit** your changes (`git commit -m 'Add some amazing feature'`)
5. **Push** to the branch (`git push origin feature/AmazingFeature`)
6. **Open** a Pull Request

### Guidelines
- Follow existing code style and structure
- Update documentation for new features
- Test changes thoroughly before submitting PR
- Be respectful and constructive in discussions

---



## 👤 Author & Support

**Ashutosh Maurya** - Full-stack Developer

Building AI-powered applications with modern web technologies.

**Connect with me:**
- 🌐 Portfolio: [aashutosh.me](https://aashutosh.me)
- 💻 GitHub: [@aashutosh585](https://github.com/aashutosh585)
- 💼 LinkedIn: [ashutosh585](https://www.linkedin.com/in/ashutosh585)
- 📧 Email: [Get in touch](mailto:ashutoshmaurya585@gmail.com)

---

<div align="center">

### 🌟 If you found this project helpful, please give it a star!

Built with ❤️ 

</div>
