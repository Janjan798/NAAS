// config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  'naas_db',          // your database name
  'postgres',        // your real Postgres username
  'toor',    // your real Postgres password
  {
    host: 'localhost',
    dialect: 'postgres',
    logging: false
  }
);

module.exports = sequelize;

