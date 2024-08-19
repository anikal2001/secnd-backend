import express from 'express';
import RateLimit from 'express-rate-limit';
import userRouter from './api/user.apis';
import sellerRouter from './api/seller.apis';
import productRouter from './api/product.apis';

const router = express.Router();

const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
});

// apply rate limiter to all requests
router.use(limiter);

router.use('/sellers', sellerRouter);
router.use('/users', userRouter);
router.use('/products', productRouter);

export default router;
