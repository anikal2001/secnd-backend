import express from "express";
import dotenv from "dotenv";
import "reflect-metadata";
import bodyParser from "body-parser";
import { AppDataSource } from "./database/config";
import { Router as userRouter } from "./routers/user.routes";
import { Router as productRouter } from "./routers/product.routes";
import { Router as SellerRouter } from "./routers/seller.routes";
import { Router as cartRouter } from "./routers/cart.routes";
import rateLimit from "express-rate-limit";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

dotenv.config();
const cors = require('cors')
const app = express();

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in the headers
  legacyHeaders: false, // Disable X-RateLimit headers
});



app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json());   


const port = process.env.PORT || 3000;

app.use(express.json());
app.use(generalLimiter);
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/sellers", SellerRouter);
app.use('/api/cart', cartRouter)

app.use(notFoundHandler);

// Global error handler (must be the last middleware)
app.use(errorHandler);

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
