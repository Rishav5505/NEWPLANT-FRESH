const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/Plant";

async function promoteAdmin() {
  try {
    await mongoose.connect(MONGO_URI, { autoIndex: true });
    console.log('Connected to MongoDB');
    
    const User = require('./models/User');
    
    const result = await User.updateOne(
      { email: 'rishavkumar33372@gmail.com' },
      { $set: { role: 'admin' } }
    );
    
    console.log('Update result:', result);
    
    const user = await User.findOne({ email: 'rishavkumar33372@gmail.com' });
    console.log('User after update:', user);
    
    await mongoose.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

promoteAdmin();
