import { Request, Response, NextFunction } from 'express';

/**
 * Global error handling middleware
 */
const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);
  
  const status = 500;
  const message = error.message || 'Something went wrong';
  
  res.status(status).json({
    success: false,
    status,
    message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
};

export default errorMiddleware;
