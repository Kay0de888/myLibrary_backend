const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
require('dotenv').config();
const fs = require('fs');
const app = express();

// Middleware to log all requests
const logMessage = (message) => {
  const logFilePath = path.join(__dirname, 'logger.txt');
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} - ${message}\n`;

  fs.appendFileSync(logFilePath, logEntry, (err) => {
    if (err) {
      console.error("Failed to write log:", err);
    }
  });
};

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;

// Function to fetch courses from MongoDB
async function fetchCourses() {
  let client;

  try {
    client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, ssl: true });
    const db = client.db('MyLibrary');
    const coursesCollection = db.collection('courses');
    const courses = await coursesCollection.find().toArray();
    return courses;
  } catch (error) {
    logMessage(`Error in fetchCourses: ${error.message}`);
    console.error(error);
    throw error;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Log each request
app.use((req, res, next) => {
  logMessage(`Request to ${req.originalUrl} with method ${req.method}`);
  next();
});

// Fetch courses
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await fetchCourses();
    if (!courses || courses.length === 0) {
      logMessage('No courses found');
      return res.status(404).json({ message: 'No courses found.' });
    }
    logMessage('Fetched courses successfully');
    return res.status(200).json(courses);
  } catch (error) {
    logMessage(`Error fetching courses: ${error.message}`);
    return res.status(500).json({ message: 'Error retrieving courses', error: error.message });
  }
});

// Catch-all route for undefined endpoints
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Serve static files if necessary
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logMessage(`Server running on port ${PORT}`);
  console.log(`Server running on port ${PORT}`);
});
