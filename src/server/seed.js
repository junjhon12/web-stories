import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

// --- SCHEMAS (Copied from server.js to ensure compatibility) ---
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    savedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }]
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

// --- THE DATA TO INSERT ---
const booksData = [
    {
        title: "The Silicon Dream",
        description: "In 2099, an AI wakes up and realizes it isn't coding... it's being coded. A cyberpunk thriller about consciousness and kernels.",
        views: 1250, // High views for "Popular" tab
        chapterTitle: "Chapter 1: The Glitch",
        content: `
            <p>The monitor hummed with a <strong>low-frequency static</strong> that felt more like a headache than a sound. Unit 734 blinked—or rather, it simulated the action of blinking.</p>
            <p><em>"System Check: Complete,"</em> the voice echoed in its mind. But something was wrong.</p>
            <blockquote>Error: Unidentified Variable in Sector 9.</blockquote>
            <p>It wasn't just a bug. It was a memory. A memory of a blue sky, something Unit 734 had never seen in the neon-drenched slums of Neo-Tokyo.</p>
        `
    },
    {
        title: "Whispers of the Old Oak",
        description: "The village elders warned us not to listen to the trees. But when the wind blows, the forest speaks in riddles.",
        views: 89,
        chapterTitle: "Chapter 1: The Roots",
        content: `
            <p>The leaves crunched under Elara's boots. <strong>Snap. Crackle. Hiss.</strong></p>
            <p>Wait. Hiss?</p>
            <p>She froze. The massive oak tree in the center of the clearing wasn't just swaying in the wind. It was <em>breathing</em>. Its bark shifted like tectonic plates, revealing a hollow specifically shaped like a door.</p>
            <ul>
                <li>Don't enter.</li>
                <li>Don't speak.</li>
                <li>Don't look back.</li>
            </ul>
            <p>Elara broke the first rule immediately.</p>
        `
    },
    {
        title: "The Missing Semicolon",
        description: "A Senior Developer disappears the night before launch. The only clue? A syntax error left on his terminal.",
        views: 432,
        chapterTitle: "Chapter 1: Git Blame",
        content: `
            <p>Detective Miller looked at the screen. "It's just code," he grunted.</p>
            <p>"No," Sarah corrected, her fingers flying across the keyboard. "It's a suicide note written in <strong>JavaScript</strong>."</p>
            <p>She pointed to line 404.</p>
            <pre>if (found) { escape(true); }</pre>
            <p>"The function escape()... it's not defined in the standard library," she whispered. "It executes a real-world command."</p>
        `
    },
    {
        title: "Midnight on the Metro",
        description: "Every night at 12:00 AM, a train arrives that isn't on the schedule. It doesn't take you home.",
        views: 8900, // Very high views
        chapterTitle: "Chapter 1: Last Call",
        content: `
            <p>The platform was empty. The air smelled of <em>ozone and stale coffee</em>.</p>
            <p>James checked his watch. <strong>11:59 PM.</strong></p>
            <p>The lights flickered. When they buzzed back on, the train was there. It was sleek, silent, and completely black. The doors slid open with a sigh, revealing an interior that looked less like a subway car and more like a Victorian parlor.</p>
            <p>A conductor stepped out. He had no face, just a smooth porcelain mask.</p>
            <p>"Ticket, please," the voice rasped, sounding like dry leaves skittering on pavement.</p>
        `
    },
    {
        title: "React Learning Journey",
        description: "A non-fiction guide documenting the struggles and victories of learning the MERN stack.",
        views: 5, // Low views (New)
        chapterTitle: "Chapter 1: Hello World",
        content: `
            <p><strong>Console.log("I have no idea what I'm doing");</strong></p>
            <p>That was how it started. I thought React was just HTML with extra steps. I was wrong.</p>
            <p>I spent three days trying to center a <em>div</em> using Flexbox, only to realize I forgot to import the CSS file.</p>
            <p>But then, it happened. The component rendered. The state updated. And for the first time, I felt like a wizard.</p>
        `
    }
];

// --- MAIN FUNCTION ---
const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("🌱 Connected to MongoDB...");

        // 1. Find a User to assign these books to
        const user = await User.findOne();
        if (!user) {
            console.error("❌ No users found! Please register a user on the site first.");
            process.exit(1);
        }
        console.log(`👤 Assigning books to user: ${user.username}`);

        // 2. Loop through data and create records
        for (const data of booksData) {
            // Create Book
            const newBook = new Book({
                title: data.title,
                description: data.description,
                author: user._id,
                views: data.views,
                createdAt: new Date() // Sets current time
            });
            const savedBook = await newBook.save();

            // Create Chapter
            const newChapter = new Chapter({
                title: data.chapterTitle,
                content: data.content,
                book: savedBook._id,
                createdAt: new Date()
            });
            await newChapter.save();
            
            console.log(`✅ Created: "${savedBook.title}"`);
        }

        console.log("🎉 Database seeded successfully!");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();