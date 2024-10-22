import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator'; // Import validation result to handle errors
import { UserModel } from '../models/user.model';

// Signup function for both Admin and User accounts
export const signup = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  console.log("reach here")
    const { email, password, fullname, role } = req.body;
    
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return next(new Error('Email already exists.'));
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new UserModel({
      fullname,
      email,
      password: hashedPassword,
      role
    });

    await newUser.save();

    // Generate JWT token
    const accessToken = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        fullname: newUser.fullname,
        role: newUser.role
      },
      process.env.JWT_SECRET!, 
      {
        expiresIn: '1d', 
      }
    );

    // Respond with the newly created user (excluding the password) and token
    const { password: passwordHash, ...userResponse } = newUser.toObject();
    return res.status(201).json({
      statusCode: '00',
      message: 'Signup successful',
      data: {
        user: userResponse,
        accessToken,
      },
    });
  } catch (error) {
    return next(error); // Pass the error to Express's error handler
  }
};

// Login function for both Admin and User accounts
export const login = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find the user by email
    const user = await UserModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new Error('Invalid credentials.'));
    }

    // Generate JWT token
    const accessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        fullname: user.fullname,
        role: user.role
      },
      process.env.JWT_SECRET!, // Ensure JWT_SECRET is defined in your .env file
      {
        expiresIn: '1d', // Token expiration time
      }
    );

    // Exclude passwordHash from the response
    const { password: passwordHash, ...userResponse } = user.toObject();

    return res.status(200).json({
      statusCode: '00',
      message: 'Login successful',
      data: {
        user: userResponse,
        accessToken,
      },
    });
  } catch (error) {
    return next(error); // Pass the error to Express's error handler
  }
};

// Get all users (Admin only)
export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const users = await UserModel.find({}, '-password'); // Exclude passwords
    return res.status(200).json({
      statusCode: '00',
      message: 'Users retrieved successfully',
      data: users,
    });
  } catch (error) {
    return next(error);
  }
};
