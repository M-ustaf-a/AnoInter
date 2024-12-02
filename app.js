if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const { storage } = require("./cloudConfig");
const Post = require("./models/post");
const Community = require("./models/community");
const methodOverride = require("method-override");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

// Import chat routes and socket initialization
const { router: chatRoutes, initializeSocket } = require("./routes/chat");

const app = express();
const MONGO_URL = process.env.ATLAS;

// Multer configuration for file uploads
const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'post[image]' || file.fieldname === 'community[thumbnail]') {
            // Allow image files
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Only image files are allowed!'), false);
            }
        } else if (file.fieldname === 'post[video]') {
            // Allow video files
            if (file.mimetype.startsWith('video/')) {
                cb(null, true);
            } else {
                cb(new Error('Only video files are allowed!'), false);
            }
        } else {
            cb(new Error('Invalid file type'), false);
        }
    }
});

// Database Connection
mongoose
    .connect(MONGO_URL)
    .then(() => console.log("Connected to the database"))
    .catch((err) => console.error("Database connection error:", err));

// Middleware Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

// Session Store Configuration
const store = MongoStore.create({
    mongoUrl: MONGO_URL,
    crypto: {
        secret: process.env.SESSION_SECRET,
    },
    touchAfter: 24*3600,
});

store.on("error", (err) => {
    console.log('Error in MONGO session store', err);
});

// Session Middleware
app.use(session({
    store,
    secret: process.env.SESSION_SECRET || 'defaultsecret',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        httpOnly: true, 
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

// Flash Messages Middleware
app.use(flash());

// Global Middleware for Flash Messages
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Home Route
app.get("/", (req, res) => {
    res.render("home.ejs");
});

// Community Routes
// List all communities
app.get("/community", async (req, res) => {
    try {
        const Communities = await Community.find({});
        res.render("community.ejs", { Communities });
    } catch (error) {
        console.error("Error fetching communities:", error);
        res.status(500).send("An error occurred while fetching communities");
    }
});

// Community Creation Form
app.get("/commForm", (req, res) => {
    res.render("commForm.ejs");
});

// Create New Community
app.post("/communityForm", upload.single("community[thumbnail]"), async (req, res) => {
    try {
        const url = req.file.path;
        const filename = req.file.filename;
        const newCommunity = new Community(req.body.community);
        
        newCommunity.thumbnail = { url: url, filename: filename };
        await newCommunity.save();
        
        req.flash('success', 'Community created successfully!');
        res.redirect('/community');
    } catch (error) {
        console.error("Community creation error:", error);
        req.flash('error', 'Failed to create community');
        res.redirect('/commForm');
    }
});

// Community-Specific Posts Routes
// View Posts for a Specific Community
app.get("/community/:communityId/posts", async (req, res) => {
    const { communityId } = req.params;
    try {
        // Find the specific community
        const currentCommunity = await Community.findById(communityId);
        
        // Find posts specific to this community
        const communityPosts = await Post.find({ community: communityId });
        
        res.render("community-posts.ejs", { 
            community: currentCommunity, 
            posts: communityPosts 
        });
    } catch (error) {
        console.error("Error fetching community posts:", error);
        res.status(500).send("An error occurred while fetching community posts");
    }
});

  
// Show New Post Form for a Specific Community
app.get("/community/:communityId/posts/new", async (req, res) => {
    const { communityId } = req.params;
    try {
        // Find the specific community to pass to the view
        const currentCommunity = await Community.findById(communityId);
        res.render("new-community-post.ejs", { community: currentCommunity });
    } catch (error) {
        console.error("Error loading new post form:", error);
        res.status(500).send("An error occurred");
    }
});

// Create New Post for a Specific Community
app.post("/community/:communityId/posts", upload.fields([
    { name: 'post[image]', maxCount: 10 }, 
    { name: 'post[video]', maxCount: 1 }
]), async (req, res) => {
    const { communityId } = req.params;
    try {
        const newPost = new Post(req.body.post);
        
        // Set the community for this post
        newPost.community = communityId;

        // Process image uploads
        if (req.files['post[image]']) {
            const imageUrls = req.files['post[image]'].map(file => file.path);
            const imageFilenames = req.files['post[image]'].map(file => file.filename);
            
            newPost.image = {
                url: imageUrls,
                filename: imageFilenames
            };
        }

        // Process video upload
        if (req.files['post[video]']) {
            const videoFile = req.files['post[video]'][0];
            newPost.video = {
                url: videoFile.path,
                filename: videoFile.filename
            };
        }

        await newPost.save();
        req.flash('success', 'Post created successfully!');
        res.redirect(`/community/${communityId}/posts`);
    } catch (error) {
        console.error("Post creation error:", error);
        req.flash('error', 'Failed to create post');
        res.redirect(`/community/${communityId}/posts/new`);
    }
});

// Individual Post Details Route
app.get("/community/:communityId/posts/:postId", async (req, res) => {
    const { communityId, postId } = req.params;
    try {
        const community = await Community.findById(communityId);
        const post = await Post.findById(postId);
        
        if (!post || !community) {
            return res.status(404).send("Post or Community not found");
        }
        
        res.render("show.ejs", { post, community });
    } catch (error) {
        console.error("Error fetching post details:", error);
        res.status(500).send("An error occurred");
    }
});

// Suggestion Route
app.post("/community/:communityId/posts/:postId/suggestion", async (req, res) => {
    const { communityId, postId } = req.params;
    const { username1, suggestion } = req.body;
    try {
        const post = await Post.findById(postId);
        if (!post) return res.status(404).send("Post not found");
        
        post.suggestions.push({ username1, suggestion });
        await post.save();
        
        req.flash('success', 'Suggestion added successfully!');
        res.redirect(`/community/${communityId}/posts/${postId}`);
    } catch (error) {
        console.error("Suggestion error:", error);
        req.flash('error', 'Failed to add suggestion');
        res.redirect(`/community/${communityId}/posts/${postId}`);
    }
});

app.get("/community/:communityId/feeds", (req,res)=>{
    res.render("feeds.ejs");
})

// Use chat routes
app.use(chatRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start Server
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));

// Initialize Socket.IO
const io = initializeSocket(server);

module.exports = app;