import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { GoogleGenerativeAI } from "@google/generative-ai"; 
import rateLimit from 'express-rate-limit';

// Initialize AI and App
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const app = express();

// --- 1. CLEAN MIDDLEWARE SETUP ---
app.use(cors()); // Allow all connections (Fixes the blocking issue)
app.use(express.json());

// --- 2. DEFINE RATE LIMITER ---
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, 
    message: { message: "Too many login attempts, please try again after 15 minutes." }
});

// --- 3. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log(`MongoDB Atlas : connected`))
    .catch((err) => console.error(`MongoDB Atlas : not connected`, err));

// --- 4. MODELS ---
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    savedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book', default: [] }] 
});
const User = mongoose.model('User', userSchema);

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String }, 
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    views: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});
const Book = mongoose.model('Book', bookSchema);

const chapterSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' }, 
    createdAt: { type: Date, default: Date.now }
});
const Chapter = mongoose.model('Chapter', chapterSchema);

const commentSchema = new mongoose.Schema({
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
    createdAt: { type: Date, default: Date.now }
});
const Comment = mongoose.model('Comment', commentSchema);

// --- 5. AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Access Denied" });

    jwt.verify(token, process.env.JWT_SECRET || "mysecretkey", (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid Token" });
        req.user = user;
        next();
    });
};

// --- 6. ROUTES ---

// REGISTER
app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: "User already exists" });
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "User created!" });
    } catch (error) { res.status(500).json({ message: "Error registering" }); }
});

// LOGIN (The ONLY one - with Rate Limiter & UserID)
app.post('/api/auth/login', loginLimiter, async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        // Generate Token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "mysecretkey", { expiresIn: "1h" });
        
        // Send back Token AND userId (Fixes Profile Link)
        res.json({ token, username: user.username, userId: user._id });
    } catch (error) { res.status(500).json({ message: "Error logging in" }); }
});

// --- BOOK ROUTES ---
app.get('/api/books', async (req, res) => {
    try {
        const { author } = req.query; 
        const filter = author ? { author } : {}; 
        const books = await Book.find(filter).populate('author', 'username');
        res.json(books);
    } catch (error) { res.status(500).json({ message: "Error fetching books" }); }
});

app.get('/api/books/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('author', 'username');
        if (!book) return res.status(404).json({ message: "Book not found" });
        const chapters = await Chapter.find({ book: book._id });
        res.json({ book, chapters }); 
    } catch (error) { res.status(500).json({ message: "Error fetching book" }); }
});

app.post('/api/books', authenticateToken, async (req, res) => {
    try {
        const newBook = new Book({
            title: req.body.title,
            description: req.body.description,
            author: req.user.id
        });
        await newBook.save();
        res.status(201).json(newBook);
    } catch (error) { res.status(500).json({ message: "Error creating book" }); }
});

// --- CHAPTER ROUTES ---
app.get('/api/chapters/:id', async (req, res) => {
    try {
        const chapter = await Chapter.findById(req.params.id).populate('book');
        res.json(chapter);
    } catch (error) { res.status(500).json({ message: "Error fetching chapter" }); }
});

app.post('/api/books/:bookId/chapters', authenticateToken, async (req, res) => {
    try {
        const newChapter = new Chapter({
            title: req.body.title,
            content: req.body.content,
            book: req.params.bookId 
        });
        await newChapter.save();
        res.status(201).json(newChapter);
    } catch (error) { res.status(500).json({ message: "Error creating chapter" }); }
});

app.put('/api/chapters/:id', authenticateToken, async (req, res) => {
    try {
        const chapter = await Chapter.findById(req.params.id).populate('book');
        if (!chapter) return res.status(404).json({ message: "Chapter not found" });
        if (chapter.book.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "You can only edit your own chapters!" });
        }
        chapter.title = req.body.title;
        chapter.content = req.body.content;
        await chapter.save();
        res.json(chapter);
    } catch (error) { res.status(500).json({ message: "Error updating chapter" }); }
});

app.delete('/api/chapters/:id', authenticateToken, async (req, res) => {
    try {
        const chapter = await Chapter.findById(req.params.id).populate('book');
        if (!chapter) return res.status(404).json({ message: "Chapter not found" });
        if (chapter.book.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "You can only delete your own chapters!" });
        }
        await Chapter.findByIdAndDelete(req.params.id);
    } catch (error) { res.status(500).json({ message: "Error deleting chapter" }); }
});

// --- COMMENT ROUTES ---
app.get('/api/chapters/:chapterId/comments', async (req, res) => {
    try {
        const comments = await Comment.find({ chapter: req.params.chapterId })
            .populate('author', 'username') 
            .sort({ createdAt: -1 }); 
        res.json(comments);
    } catch (error) { res.status(500).json({ message: "Error fetching comments" }); }
});

app.post('/api/chapters/:chapterId/comments', authenticateToken, async (req, res) => {
    try {
        const newComment = new Comment({
            content: req.body.content,
            author: req.user.id,
            chapter: req.params.chapterId
        });
        await newComment.save();
        const populatedComment = await newComment.populate('author', 'username');
        res.status(201).json(populatedComment);
    } catch (error) { res.status(500).json({ message: "Error posting comment" }); }
});

app.delete('/api/comments/:id', authenticateToken, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: "Comment not found" });
        if (comment.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "You can only delete your own comments!" });
        }
        await Comment.findByIdAndDelete(req.params.id);
    } catch (error) { res.status(500).json({ message: "Error deleting comment" }); }
});

// --- USER & PROFILE ROUTES ---
app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) { res.status(500).json({ message: "Error fetching user" }); }
});

// --- BOOKSHELF ROUTES ---
app.post('/api/books/:id/save', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const bookId = req.params.id;
        if (user.savedBooks.includes(bookId)) {
            user.savedBooks.pull(bookId);
            await user.save();
        } else {
            user.savedBooks.push(bookId);
            await user.save();
        }
    } catch (error) { res.status(500).json({ message: "Error updating bookshelf" }); }
});

app.get('/api/bookshelf', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'savedBooks',
            populate: { path: 'author', select: 'username' }
        });
        res.json(user.savedBooks);
    } catch (error) { res.status(500).json({ message: "Error fetching bookshelf" }); }
});

app.post('/api/books/:id/view', async (req, res) => {
    try {
        await Book.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    } catch (error) { res.status(500).json({ message: "Error" }); }
});

// --- AI CRITIQUE ROUTE ---
app.post('/api/ai/critique', authenticateToken, async (req, res) => {
    const { content, bookTitle } = req.body;
    if (!content || content.length < 100) {
        return res.status(400).json({ message: "Write at least 100 characters for a quality review!" });
    }
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
            You are a professional narrative editor. Analyze this chapter for a book titled "${bookTitle}".
            STRICT RULES:
            - DO NOT rewrite or write any content.
            - Provide feedback, tips, and suggestions ONLY.
            - Return the response as a JSON object.
            ANALYSIS CRITERIA:
            1. Grade (A through F) for: Structure, Goal, Characters, Details, Pacing, Connective, Resolution.
            2. List plot-holes or inconsistencies.
            3. Provide 3 specific "Tips for Growth".
            Return ONLY this JSON:
            {
              "grades": { "structure": "Grade", "goal": "Grade", "characters": "Grade", "details": "Grade", "pacing": "Grade", "connective": "Grade", "resolution": "Grade" },
              "plotHoles": ["string"],
              "tips": ["string"]
            }
            CHAPTER CONTENT:
            ${content.replace(/<[^>]*>?/gm, '')} 
        `;
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            res.json(JSON.parse(jsonMatch[0]));
        } else {
            throw new Error("Invalid AI format");
        }
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ message: "The assistant is currently unavailable." });
    }
});

//
// DELETE Book (and all its Chapters + Comments)
app.delete('/api/books/:id', authenticateToken, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: "Book not found" });

        // 1. Check Ownership
        if (book.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "You can only delete your own books!" });
        }

        // 2. Find all chapters to get their IDs
        const chapters = await Chapter.find({ book: book._id });
        const chapterIds = chapters.map(c => c._id);

        // 3. Cascade Delete: Remove Comments first, then Chapters
        await Comment.deleteMany({ chapter: { $in: chapterIds } });
        await Chapter.deleteMany({ book: book._id });

        // 4. Finally, Delete the Book
        await Book.findByIdAndDelete(req.params.id);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting book" });
    }
});
// --- START SERVER ---
app.listen(5000, () => console.log("Server running on port 5000"));