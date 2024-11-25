// Import required modules
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

// Create an instance of Express
const app = express();

// Enable CORS for all routes
app.use(cors());

// MongoDB Atlas connection string with database name
const uri = "mongodb+srv://oo1139:XPcbzMtkuGaFXexG@cluster7.rli7i.mongodb.net/MyLibrary?retryWrites=true&w=majority&appName=Cluster7&ssl=true";


// Function to fetch courses from the MongoDB collection
async function fetchCourses() {
  let client;

  try {
    // Connect to MongoDB Atlas with the URI
    client = await MongoClient.connect(uri, {
      useNewUrlParser: true,        // Use the new URL parser
      useUnifiedTopology: true,    // Use the new server discovery and monitoring engine
      ssl: true,                    // Ensure SSL is enabled
    });

    console.log("Connected to MongoDB Atlas");

    // Get the database and collection
    const db = client.db('MyLibrary'); // Ensure this matches your MongoDB database name
    const coursesCollection = db.collection('courses'); // Ensure this matches your collection name

    // Fetch all courses from the collection
    const courses = await coursesCollection.find().toArray();

    return courses; // Return courses for API response

  } catch (error) {
    console.error("Error retrieving courses:", error);
    throw error; // Throw error so it can be caught in the route
  } finally {
    if (client) {
      await client.close(); // Close the database connection after fetching
    }
  }
}

// Define a route to fetch courses
app.get('/courses', async (req, res) => {
  try {
    const courses = await fetchCourses();
    if (courses.length === 0) {
      res.status(404).json({ message: 'No courses found.' });
    } else {
      res.status(200).json(courses);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving courses', error: error.message });
  }
});

// Set the server to listen on a specific port (default is 5000)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
