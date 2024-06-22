import dotenv from 'dotenv';
import AppDataSource from './infrastructure/db/database';
dotenv.config();

const { PORT, JWT_SECERT, EXPIRES_IN } = process.env;

const DBconnection = async () => {
  try {
    console.log('Connecting to database2...');
    await AppDataSource.initialize()
      .then(() => {
        console.log('Data Source has been initialized!');
      })
      .catch((err) => {
        console.error('Error during Data Source initialization:', err);
      });
  } catch (error) {
    console.log(error);
  }
};

export default {
  connect: DBconnection,
  port: PORT,
  JWT_SECERT: JWT_SECERT,
  EXPIRES_IN: EXPIRES_IN,
};
