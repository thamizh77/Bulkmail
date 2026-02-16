/**
 * Seed Admin User Script
 * Run: node server/scripts/seedAdmin.js
 * Always recreates admin user with correct credentials
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@bulkmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // 🔥 DELETE existing admin if present
    await User.deleteOne({ email: adminEmail });
    console.log('Old admin removed (if existed)');

    // 🔥 CREATE fresh admin
    const admin = await User.create({
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });

    console.log('Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Password:', adminPassword);
    console.log('\nYou can now login with these credentials.');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
