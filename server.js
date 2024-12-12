const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;

async function fetchCourses() {
  let client;

  try {
    client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,
    });

    const db = client.db('MyLibrary');
    const coursesCollection = db.collection('courses');

    const courses = await coursesCollection.find().toArray();
    return courses;
  } catch (error) {
    console.error("Error retrieving courses:", error.message);
    throw error;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

async function saveToCart(cartItem) {
  let client;

  try {
    client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,
    });

    const db = client.db('MyLibrary');
    const cartCollection = db.collection('cart');

    const result = await cartCollection.insertOne(cartItem);
    return result;
  } catch (error) {
    console.error("Error saving to cart:", error.message);
    throw error;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

app.post('/api/cart', async (req, res) => {
  const cartItem = req.body;

  try {
    cartItem.addedAt = new Date();

    const result = await saveToCart(cartItem);

    res.status(201).json({
      message: 'Item added to cart',
      cartItemId: result.insertedId,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error saving to cart',
      error: error.message,
    });
  }
});

app.get('/api/courses', async (req, res) => {
  try {
    const courses = await fetchCourses();
    if (!courses || courses.length === 0) {
      return res.status(404).json({ message: 'No courses found.' });
    }
    return res.status(200).json(courses);
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving courses',
      error: error.message,
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
