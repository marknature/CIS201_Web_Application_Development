const { Sequelize } = require('sequelize');
const env = require('./env');

const sequelize = new Sequelize(
  env.PG_DB_NAME || 'ffims_scheduling',
  env.PG_DB_USER || 'postgres',
  env.PG_DB_PASSWORD || 'postgres',
  {
    host: env.PG_DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false, // Set to console.log to see SQL queries
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL database connected successfully via Sequelize.');
  } catch (error) {
    console.error('Unable to connect to the PostgreSQL database:', error);
  }
};

module.exports = { sequelize, connectPostgres };
