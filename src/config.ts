import dotenv from 'dotenv';
import AppDataSource from './infrastructure/db/database';
import '@shopify/shopify-api/adapters/node';
import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';
const sdk = require('node-appwrite');

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

const shopifyEnv = {
  apiKey: '3a0bbb6c01530af6e1edbf1243561147',
  apiSecretKey: 'a4b2a019f5a630f163def7c77c2e04b3',
  scopes: ['read_products'],
  shopName: 'secnd.myshopify.com',
  hostName: 'ngrok-tunnel-address',
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
};
const shopify = shopifyApi(shopifyEnv);


let AppwriteClient = new sdk.Client()
    .setEndpoint('https://cloud.appwrite.io/v1') // Your API Endpoint
    .setProject('667a3f9c001646d9ef73') // Your project ID
    .setKey('4670a6679d62b5a75dc7e508821ee7932f83b810f3a33ed32c32f2104efeefe17c93682382c11650a01ba70af93f5c2d4e5afa78cb03c17571d7d4c82e15025281d8a4ab55981d1de30a19b9bf8ab5a841176e2fa341672709c1a7dc2312d5d496dcbf810088e7a69004fec1045d020e87001e92e9c0e58077398418e5baf15a') // Your secret API key
    .setSelfSigned() // Use only on dev mode with a self-signed SSL cert
;

export default {
  connect: DBconnection,
  port: PORT,
  JWT_SECERT: JWT_SECERT,
  EXPIRES_IN: EXPIRES_IN,
  shopify: shopify,
  AppwriteClient: AppwriteClient,
  sdk: sdk
};
