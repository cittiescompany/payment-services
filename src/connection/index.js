import { Sequelize } from 'sequelize';
import 'dotenv/config';
import mysql2 from 'mysql2';

const database_config = {
  HOST: process.env.DATABASE_HOST || '',
  USER: process.env.DATABASE_USER || '',
  PASSWORD: process.env.DATABASE_PASSWORD || '',
  DATABASENAME: process.env.DATABASE_NAME || 'payment',
  DIALECT: process.env.DATABASE_DIALECT || '',
  STORAGEBUCKET: process.env.STORAGEBUCKET || '',
};

export const sequelize = new Sequelize(
  database_config.DATABASENAME,
  database_config.USER,
  database_config.PASSWORD,
  {
    host: database_config.HOST,
    dialect: database_config.DIALECT,
    logging: false,
    dialectModule: mysql2,
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
    dialectOptions: {
      charset: 'utf8mb4',
      connectTimeout: 60000,
    },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    },
  }
);
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log(
      'Connection to the database has been established successfully.'
    );
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    throw error;
  }
};