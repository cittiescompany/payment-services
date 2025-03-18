import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import routes from './routes.js';

import { testConnection,sequelize } from './connection/index.js';


const APP = express();

APP.use(express.json({ limit: '5000mb' }));
APP.use(express.urlencoded({ extended: true, limit: '5000mb' }));

APP.use(
  cors({
    credentials: true,
    methods: ['POST', 'GET', 'DELETE', 'PATCH', 'PUT'],
    origin: '*',
    optionsSuccessStatus: 200,
  })
);

(async () => {
  try {
    await testConnection();
    console.log("connect to databse successfully");
  } catch (err) {
    console.log(err.message);
  }
})();



APP.get('/', (req, res, next) => {
  try {
    res.status(200).json({
      message: 'Welcome to payment service',
      status: true,
    });
  } catch (ex) {
    next(ex);
  }
});

APP.use("/payment", routes);


const PORT = process.env.PORT || 9000;
const SERVER=APP.listen(PORT, () => {
  console.log(`APP is Listen On Port ${PORT} user service`);
});

const graceful = async () => {
  await sequelize.close();
  console.log('💀 Database connection closed, goodbye!');
  SERVER.close(() => {
    console.log('💀 Server closed, goodbye!');
    process.exit(0);
  });
};

process.on('SIGTERM', graceful);
process.on('SIGINT', graceful);
