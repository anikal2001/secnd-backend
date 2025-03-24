import { NextFunction, Request, Response } from "express";
import { QueryFailedError } from "typeorm";
import jwt from "jsonwebtoken";

// Define custom error types for better handling
export interface AppError extends Error {
  statusCode: number;
  code: string;
  data?: any;
  isOperational: boolean;
}

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Set up default error values
  let statusCode = 500;
  let message = "Internal server error";
  let errorCode = "INTERNAL_ERROR";
  let stack: string | undefined;
  let errorData: any = undefined;
  
  console.error(`Error occurred: ${error.message}`);
  console.error(error.stack);

  // Handle specific error types
  if (error instanceof QueryFailedError) {
    // Database errors
    statusCode = 400;
    message = "Database operation failed";
    errorCode = "DB_ERROR";
    
    // Check for common database errors
    if (error.message.includes("duplicate key")) {
      message = "A record with this information already exists";
      errorCode = "DUPLICATE_ENTRY";
    } else if (error.message.includes("foreign key constraint")) {
      message = "Referenced record does not exist";
      errorCode = "FOREIGN_KEY_VIOLATION";
    }
    
  } else if (error instanceof jwt.JsonWebTokenError) {
    // JWT errors
    statusCode = 401;
    message = "Authentication failed";
    errorCode = "INVALID_TOKEN";
    
  } else if (error instanceof jwt.TokenExpiredError) {
    statusCode = 401;
    message = "Your session has expired. Please login again.";
    errorCode = "TOKEN_EXPIRED";
    
  } else if ((error as AppError).statusCode) {
    // Handle custom application errors that have statusCode
    statusCode = (error as AppError).statusCode;
    message = error.message;
    errorCode = (error as AppError).code || "APP_ERROR";
    errorData = (error as AppError).data;
  } else if (error.name === "ValidationError") {
    // Handle validation errors (e.g., from class-validator)
    statusCode = 400;
    message = "Validation failed";
    errorCode = "VALIDATION_ERROR";
    errorData = error.message;
  } else if (error.message.includes("ECONNREFUSED")) {
    // Service connection errors
    statusCode = 503;
    message = "Service temporarily unavailable";
    errorCode = "SERVICE_UNAVAILABLE";
  }
  
  // Determine if we should expose the stack trace
  // Only in development environment
  if (process.env.NODE_ENV === "development") {
    stack = error.stack;
  }

  // Log detailed error information for monitoring
  const logData = {
    timestamp: new Date().toISOString(),
    statusCode,
    errorCode,
    message,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: (req as any).currentUser?.id || "unauthenticated",
    stack: error.stack,
    requestBody: req.body
  };
  
  // Log error details (consider using a proper logging service in production)
  console.error(JSON.stringify(logData));
  
  // Return appropriate error response
  return res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      ...(errorData && { details: errorData }),
      ...(stack && { stack })
    }
  });
};

// Custom error creator for application errors
export class AppError extends Error implements AppError {
  constructor(
    message: string, 
    public statusCode: number = 500, 
    public code: string = "APP_ERROR",
    public data?: any,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware to handle 404 errors - place this AFTER all routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404, "NOT_FOUND");
  next(error);
};

// Middleware to handle async errors - wrap your async route handlers with this
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};