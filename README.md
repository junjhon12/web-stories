# 📖 WebStories

A full-stack web application where users can read, write, and share original stories. Built with React, Vite, Express, and MongoDB.

---

## 🔗 Live Site

> 🚧 **Coming Soon** — Live site link will be added here once deployed.

---

## 📸 Screenshots

> *(Add screenshots here)*

---

## 🛠️ Tech Stack

**Frontend**
- React 19
- React Router DOM v7
- React Quill New (rich text editor)
- Recharts (radar chart visualization)
- DOMPurify (HTML sanitization)
- Vite 7

**Backend**
- Express 5
- MongoDB + Mongoose
- JSON Web Tokens (JWT) for authentication
- bcryptjs for password hashing
- express-rate-limit
- CORS
- dotenv

**AI**
- Google Generative AI (`@google/generative-ai`)

---

## ✨ Features

### 📚 Library
- Browse all published books on the home page
- Sort books by **Newest** or **Most Popular** (by view count)
- Each book card shows the author, view count, title, and a description preview

### 🔐 Authentication
- Register a new account with a username and password
- Log in and receive a JWT stored in localStorage
- Guest login option (demo mode) available on the login page
- Logout clears all session data

### ✍️ Writing
- Create a new book with a title and description ("Create Jacket")
- Write chapters using a **rich text editor** (React Quill) with support for headings, bold, italic, underline, blockquote, ordered/unordered lists, and links
- Edit existing chapters
- Only the book's author can write, edit, or delete content

### 📖 Reading
- View a book's table of contents listing all chapters in order
- Read individual chapters with sanitized HTML rendering
- View count increments once per visit per book

### 🤖 AI Writing Feedback
- While writing a chapter, click **"Get AI Feedback"** to receive a critique from Google's Generative AI
- The AI grades the chapter across 7 dimensions: **Structure, Goal, Characters, Details, Pacing, Connective Tissue, and Resolution**
- Grades are visualized as a **radar chart** (MoodMap)
- The report also includes a top 3 actionable tips list

### ❤️ Bookshelf
- Logged-in users can save any book to their personal bookshelf using the heart button on a book's detail page
- The Bookshelf page displays all saved books
- Saving/unsaving toggles the heart icon in real time

### 👤 User Profiles
- Each user has a profile page showing their username, member-since date, and all their published books
- Profile is accessible via the navbar when logged in

### 💬 Comments
- Readers can leave comments on individual chapters
- Logged-in users can delete their own comments
- Comments display the author's username and the date posted

### 🗑️ Content Management
- Book authors can delete an entire book (including all chapters and comments) from the book's detail page
- Authors can access the chapter edit flow directly from the table of contents

---

## 📁 Project Structure

```
web-stories/
├── public/
├── src/
│   └── components/
│       ├── App.jsx              # Root component, route definitions
│       ├── Navbar.jsx           # Navigation bar with auth-aware links
│       ├── BookList.jsx         # Home page / library view
│       ├── BookDetail.jsx       # Book page with table of contents
│       ├── CreateBook.jsx       # Form to create a new book
│       ├── WriteChapter.jsx     # Rich text editor + AI feedback panel
│       ├── ReadChapter.jsx      # Chapter reading view
│       ├── CommentsSection.jsx  # Chapter comments (post & delete)
│       ├── Bookshelf.jsx        # User's saved books
│       ├── UserProfile.jsx      # Public user profile
│       ├── Login.jsx            # Login form
│       ├── Register.jsx         # Registration form
│       ├── MoodMap.jsx          # Radar chart for AI critique grades
│       └── CreateNovel.jsx      # Legacy novel form component
├── index.html
├── vite.config.js
├── eslint.config.js
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js
- MongoDB (local instance or MongoDB Atlas URI)
- A Google Generative AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/junjhon12/web-stories.git
   cd web-stories
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Set up the backend**

   The backend server runs separately on `http://localhost:5000`. Create a `.env` file in your server directory with the following:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_google_generative_ai_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

---

## 🔌 API Endpoints (Expected)

The frontend connects to a backend at `http://localhost:5000` with the following routes:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in and receive a JWT |
| GET | `/api/books` | Get all books (supports `?author=userId`) |
| POST | `/api/books` | Create a new book |
| GET | `/api/books/:id` | Get a book and its chapters |
| DELETE | `/api/books/:id` | Delete a book and all its content |
| POST | `/api/books/:id/save` | Toggle save/unsave a book |
| POST | `/api/books/:id/view` | Increment book view count |
| POST | `/api/books/:bookId/chapters` | Create a new chapter |
| GET | `/api/chapters/:id` | Get a single chapter |
| PUT | `/api/chapters/:chapterId` | Edit a chapter |
| GET | `/api/chapters/:chapterId/comments` | Get comments for a chapter |
| POST | `/api/chapters/:chapterId/comments` | Post a comment |
| DELETE | `/api/comments/:commentId` | Delete a comment |
| GET | `/api/bookshelf` | Get the current user's saved books |
| GET | `/api/users/:userId` | Get a user's profile |
| POST | `/api/ai/critique` | Get AI feedback on chapter content |

---

## 👤 Author

**junjhon12** — [GitHub](https://github.com/junjhon12)
