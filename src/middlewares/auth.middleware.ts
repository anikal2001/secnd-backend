// src/middlewares/auth.middleware.ts
import { NextFunction, Response } from "express";
import { customRequest } from "../interfaces/request.interface";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const { JWT_SECRET = "" } = process.env;

export class AuthMiddleware {
  static async isAuthenticated(
    req: customRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.headers.authorization) {
        return res.status(401).json({ error: "Access denied" });
      }
      
      const token = req.headers.authorization.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "Access denied" });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      req.currentUser = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: "Invalid token" });
    }
  }

  // New method to check if user is a seller
  static async isSellerAuthorized(
    req: customRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      // First authenticate
      await AuthMiddleware.isAuthenticated(req, res, async () => {
        // Then check if user is a seller
        if (!req.currentUser || !req.currentUser.is_seller) {
          return res.status(403).json({ error: "Access denied. Seller privileges required." });
        }
        next();
      });
    } catch (error) {
      return res.status(401).json({ error: "Authentication failed" });
    }
  }

  // Method to verify resource ownership
  static async isResourceOwner(resourceType: string) {
    return async (req: customRequest, res: Response, next: NextFunction) => {
      try {
        // First authenticate
        await AuthMiddleware.isAuthenticated(req, res, async () => {
          const userId = req.currentUser?.id;
          let resourceId;
          
          // Determine which ID to check based on resource type
          switch (resourceType) {
            case 'product':
              resourceId = req.params.id || req.body.product_id;
              // Query to check if user owns the product
              // For example: const product = await ProductRepository.findOne(...);
              break;
            case 'seller':
              resourceId = req.params.id;
              // Query to check if user is the seller
              break;
            default:
              return res.status(400).json({ error: "Invalid resource type" });
          }
          
          // This is a placeholder - you'll need to implement the actual ownership check
          const isOwner = true; // Replace with actual check
          
          if (!isOwner) {
            return res.status(403).json({ error: "Access denied. You don't own this resource." });
          }
          
          next();
        });
      } catch (error) {
        return res.status(401).json({ error: "Authentication failed" });
      }
    };
  }
}