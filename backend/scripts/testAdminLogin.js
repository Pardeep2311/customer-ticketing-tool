/**
 * Test Admin Login Script
 * Run this to test if admin login works
 */

const bcrypt = require('bcryptjs');
const { query } = require('../src/config/db');
require('dotenv').config();

const testAdminLogin = async () => {
  try {
    console.log('Testing admin login...\n');

    // Check if admin user exists
    const admins = await query('SELECT * FROM users WHERE role = ?', ['admin']);
    
    if (admins.length === 0) {
      console.log('❌ No admin user found in database!');
      console.log('\nTo create an admin user, run:');
      console.log('node scripts/createAdmin.js');
      process.exit(1);
    }

    console.log(`✅ Found ${admins.length} admin user(s):\n`);
    
    admins.forEach((admin, index) => {
      console.log(`Admin ${index + 1}:`);
      console.log(`  ID: ${admin.id}`);
      console.log(`  Name: ${admin.name}`);
      console.log(`  Email: ${admin.email}`);
      console.log(`  Role: ${admin.role}`);
      console.log(`  Active: ${admin.is_active}`);
      console.log(`  Has Password: ${admin.password ? 'Yes' : 'No'}`);
      console.log(`  Password Length: ${admin.password?.length || 0}`);
      console.log('');
    });

    // Test password
    const testEmail = 'admin@cantik.com';
    const testPassword = 'admin123';
    
    const user = await query('SELECT * FROM users WHERE email = ?', [testEmail]);
    
    if (user.length === 0) {
      console.log(`❌ User with email ${testEmail} not found!`);
      console.log('\nAvailable admin emails:');
      admins.forEach(admin => console.log(`  - ${admin.email}`));
      process.exit(1);
    }

    const adminUser = user[0];
    console.log(`Testing login for: ${testEmail}`);
    
    if (!adminUser.password) {
      console.log('❌ User has no password set!');
      process.exit(1);
    }

    const isValid = await bcrypt.compare(testPassword, adminUser.password);
    
    if (isValid) {
      console.log('✅ Password is correct!');
      console.log('\nYou can login with:');
      console.log(`  Email: ${testEmail}`);
      console.log(`  Password: ${testPassword}`);
    } else {
      console.log('❌ Password is incorrect!');
      console.log('\nThe password hash in database does not match "admin123"');
      console.log('You may need to:');
      console.log('  1. Delete the existing admin user');
      console.log('  2. Run: node scripts/createAdmin.js');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nMake sure:');
    console.error('  1. Database is running');
    console.error('  2. .env file is configured correctly');
    console.error('  3. Database connection is working');
    process.exit(1);
  }
};

testAdminLogin();

