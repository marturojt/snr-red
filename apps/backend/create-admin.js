#!/usr/bin/env node

/**
 * Script to create an admin user for SNR.red
 * Usage: node create-admin.js <email> <name> <password>
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// User schema (copied from model)
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  plan: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free',
    index: true
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isAdmin: {
    type: Boolean,
    default: false,
    index: true
  },
  subscription: {
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired'],
      default: 'active'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: null
    },
    stripeCustomerId: {
      type: String,
      default: null
    },
    stripeSubscriptionId: {
      type: String,
      default: null
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      return ret;
    }
  }
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);
    if (args.length < 3) {
      console.error('Usage: node create-admin.js <email> <name> <password>');
      process.exit(1);
    }

    const [email, name, password] = args;

    // Validate inputs
    if (!email || !email.includes('@')) {
      console.error('Invalid email address');
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('Password must be at least 6 characters long');
      process.exit(1);
    }

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/snr-red';
    console.log('Connecting to MongoDB:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists. Updating to admin...');
      existingUser.isAdmin = true;
      existingUser.plan = 'premium'; // Give premium plan to admin
      await existingUser.save();
      console.log(`✅ User ${email} has been made an admin`);
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create admin user
      const adminUser = new User({
        email,
        name,
        password: hashedPassword,
        plan: 'premium', // Give premium plan to admin
        isAdmin: true,
        isActive: true
      });

      await adminUser.save();
      console.log(`✅ Admin user created successfully: ${email}`);
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdmin();
