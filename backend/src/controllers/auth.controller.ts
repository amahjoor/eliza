import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Controller for user login
 */
export const login = async (
  req: Request,
  res: Response
): Promise<Response | undefined> => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // This would be replaced with actual user authentication
    // For now, return a mock token
    const token = jwt.sign(
      { id: 'user-123', email },
      process.env.JWT_SECRET || 'eliza-secret-key',
      { expiresIn: '24h' }
    );
    
    return res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: 'user-123',
          email,
          name: 'Test User'
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login',
      error: (error as Error).message
    });
  }
};

/**
 * Controller for user registration
 */
export const register = async (
  req: Request,
  res: Response
): Promise<Response | undefined> => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }
    
    // This would be replaced with actual user registration
    // For now, return a mock token
    const token = jwt.sign(
      { id: 'user-123', email },
      process.env.JWT_SECRET || 'eliza-secret-key',
      { expiresIn: '24h' }
    );
    
    return res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: 'user-123',
          email,
          name
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during registration',
      error: (error as Error).message
    });
  }
};

/**
 * Controller for refreshing JWT token
 */
export const refreshToken = async (
  req: Request,
  res: Response
): Promise<Response | undefined> => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'eliza-secret-key') as { id: string; email: string };
    
    // Generate a new token
    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_SECRET || 'eliza-secret-key',
      { expiresIn: '24h' }
    );
    
    return res.status(200).json({
      success: true,
      data: {
        token: newToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: (error as Error).message
    });
  }
};

/**
 * Controller for user logout
 */
export const logout = async (
  req: Request,
  res: Response
): Promise<Response | undefined> => {
  try {
    // This would be replaced with actual logout logic
    // For now, just return a success message
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during logout',
      error: (error as Error).message
    });
  }
};
