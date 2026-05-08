require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    const email = 'admin@dynavue.com';
    const password = 'admin123';
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log('Admin already exists. Updating role and name...');
      existingAdmin.role = 'admin';
      existingAdmin.name = existingAdmin.name || 'DYNAVUE Admin';
      await existingAdmin.save();
      console.log('Admin role updated.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const admin = new User({
      name: 'DYNAVUE Admin',
      email,
      passwordHash,
      role: 'admin',
      phone: '1234567890'
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding admin:', err);
    process.exit(1);
  }
}

seedAdmin();
