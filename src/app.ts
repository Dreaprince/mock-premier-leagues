import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors'; // Import CORS
import router from './routes/routes'; // Import your routes

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3130;

// Middleware to parse JSON and URL-encoded data
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Set CORS headers to allow cross-origin requests
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI!)
    .then(() => {
        console.log('MongoDB connected');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

// Set the routes with API prefix
app.use('/api/v1', router);

// Return a plain text response
app.get("/", (req, res) => {
    res.send("Welcome to the Mock Premier League!");
});

// Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack); // Log error stack for debugging
    res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
