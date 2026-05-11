require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const fixAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const res = await User.findOneAndUpdate(
      { email: process.env.ADMIN_EMAIL },
      { $set: { role: 'admin', name: 'DYNAVUE Admin' } },
      { new: true }
    );

    if (res) {
      console.log('Admin role fixed successfully for:', res.email);
    } else {
      console.log('Admin user not found. Run npm run seed instead.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error fixing admin:', err);
    process.exit(1);
  }
};

fixAdmin();
