const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/Plant";

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI, { autoIndex: true });
    console.log('Connected to MongoDB');
    
    const User = require('./models/User');
    
    // Check if user exists
    let user = await User.findOne({ email: 'rishavkumar33372@gmail.com' });
    
    if (user) {
      console.log('User exists, promoting to admin...');
      user.role = 'admin';
      await user.save();
      console.log('User promoted to admin!', user);
    } else {
      console.log('User does not exist, creating new admin account...');
      const hashed = await bcrypt.hash('admin123', 10);
      user = new User({
        name: 'Rishav Admin',
        email: 'rishavkumar33372@gmail.com',
        password: hashed,
        role: 'admin'
      });
      await user.save();
      console.log('Admin account created!', { id: user._id, name: user.name, email: user.email, role: user.role });
    }
    
    await mongoose.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

createAdmin();
