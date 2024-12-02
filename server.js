// Import required modules
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb'); // Added ObjectId to handle MongoDB IDs
require('dotenv').config(); // Load environment variables
const path = require('path');

// Create an instance of Express
const app = express();

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());

// MongoDB connection string from environment variables
const uri = process.env.MONGO_URI;

// Function to fetch courses from the MongoDB collection
async function fetchCourses() {
  let client;

  try {
    client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,
    });

    console.log("Connected to MongoDB Atlas");

    const db = client.db('MyLibrary'); // Your MongoDB database name
    const coursesCollection = db.collection('courses'); // Your courses collection

    const courses = await coursesCollection.find().toArray();
    return courses;
  } catch (error) {
    console.error("Error retrieving courses:", error.message); // Enhanced error logging
    throw error;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Define a route to fetch courses
app.get('/api/courses', async (req, res) => {
  console.log('Received request for /api/courses');
  try {
    const courses = await fetchCourses();
    if (!courses || courses.length === 0) {
      return res.status(404).json({ message: 'No courses found.' });
    }
    return res.status(200).json(courses);
  } catch (error) {
    console.error("Error in /api/courses route:", error.message); // Log specific route errors
    return res.status(500).json({ message: 'Error retrieving courses', error: error.message });
  }
});

// Catch-all route for undefined endpoints
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Serve static files if necessary
app.use(express.static(path.join(__dirname, 'public')));

// Set the server to listen on a specific port (default is 5000)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

