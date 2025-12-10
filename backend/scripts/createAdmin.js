/**
 * Script to create an admin user
 * Run this with: node scripts/createAdmin.js
 */

const bcrypt = require('bcryptjs');
const { query } = require('../src/config/db');
require('dotenv').config();

const createAdmin = async () => {
  try {
    const name = process.argv[2] || 'Admin User';
    const email = process.argv[3] || 'admin@cantik.com';
    const password = process.argv[4] || 'admin123';

    console.log('Creating admin user...');
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

    // Check if admin already exists
    const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
    
    if (existing.length > 0) {
      console.log(`\n⚠️  User with email ${email} already exists!`);
      console.log('To update the password, delete the user first or use a different email.');
      process.exit(1);
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert admin user
    const result = await query(
      `INSERT INTO users (name, email, password, role) 
       VALUES (?, ?, ?, 'admin')`,
      [name, email, hashedPassword]
    );

    console.log('\n✅ Admin user created successfully!');
    console.log(`User ID: ${result.insertId}`);
    console.log(`\nYou can now login with:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('\n⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

// Run the script
createAdmin();

