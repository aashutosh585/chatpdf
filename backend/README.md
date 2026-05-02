# ChatPDF FastAPI Backend

This is a FastAPI implementation of the ChatPDF backend, migrated from Node.js/Express.

## Features

- User authentication (register, login, logout)
- JWT-based authorization
- PDF upload and text extraction
- Vector embeddings using Google Gemini
- Vector storage in Pinecone
- AI-powered chat functionality
- MongoDB for user and PDF metadata storage

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file with the required environment variables (see `.env` file for reference)

3. Run the server:
```bash
python main.py
```

The server will start on `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user info
- `POST /auth/logout` - Logout user

### User Management
- `GET /user/profile` - Get user profile
- `POST /user/uploadpdf` - Upload and process PDF
- `GET /user/pdfs` - Get user's PDFs
- `POST /user/chat` - Chat with PDF content

## Dependencies

- FastAPI - Web framework
- Motor - Async MongoDB driver
- PyJWT - JWT token handling
- PassLib - Password hashing
- LangChain - Document processing
- Google Generative AI - Embeddings and chat
- Pinecone - Vector database
- PyPDF2 - PDF text extraction