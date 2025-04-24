const { User, Role } = require('../models');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

async function createTestUser() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');

    // Create customer role if it doesn't exist
    const [role] = await Role.findOrCreate({
      where: { name: 'customer' },
      defaults: {
        name: 'customer',
        description: 'Regular customer role'
      }
    });

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const [user] = await User.findOrCreate({
      where: { username: 'testuser' },
      defaults: {
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
        RoleId: role.id,
        isActive: true
      }
    });

    console.log('Test user created successfully:');
    console.log('Username: testuser');
    console.log('Password: password123');
    console.log('Email: test@example.com');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestUser(); 