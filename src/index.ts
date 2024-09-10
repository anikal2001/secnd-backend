import express from "express";
import dotenv from "dotenv";
import "reflect-metadata";
import { AppDataSource } from "./database/config";
import { Router as userRouter } from "./routers/user.routes";
import { Router as productRouter } from "./routers/product.routes";
import { Router as SellerRouter} from "./routers/seller.routes";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/sellers", SellerRouter);
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
