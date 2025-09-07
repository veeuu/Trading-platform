const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors()); 
app.use(express.json()); 


const uri = "mongodb://localhost:27017/pre-registration";
mongoose.connect(uri)
  .then(() => console.log('Successfully connected to MongoDB!'))
  .catch(err => console.error('Connection error:', err));


const preRegistrationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true 
  },
  phone: {
    type: String,
    required: false
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

const PreRegistration = mongoose.model('PreRegistration', preRegistrationSchema);


app.post('/join-waitlist', async (req, res) => {
  const { name, email, phone } = req.body;


  if (!name || !email) {
    return res.status(400).send('Name and email are required.');
  }

  try {
    const newRegistration = new PreRegistration({
      name,
      email,
      phone
    });

    await newRegistration.save();
    console.log('New registration saved:', newRegistration);


    res.status(201).send({ message: 'Successfully joined the waitlist!', data: newRegistration });

  } catch (err) {
    if (err.code === 11000) { // MongoDB duplicate key error code
      res.status(409).send('This email is already on the waitlist.');
    } else {
      console.error('Error saving data:', err);
      res.status(500).send('Internal server error.');
    }
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});