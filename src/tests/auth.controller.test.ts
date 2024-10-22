import { signup, login, getAllUsers } from '../controllers/auth.controller';
import { UserModel } from '../models/user.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../models/user.model');
jest.mock('express-validator');

describe('AuthController - Signup', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            body: { email: 'test@test.com', password: 'password', fullname: 'Test User', role: 'user' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return validation errors if validation fails', async () => {
        (validationResult as unknown as jest.Mock).mockReturnValue({
            isEmpty: () => false,
            array: () => [{ msg: 'Invalid email' }]
        });

        await signup(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ errors: [{ msg: 'Invalid email' }] });
    });

    it('should return an error if email already exists', async () => {
        (validationResult as unknown as jest.Mock).mockReturnValue({
            isEmpty: () => true
        });
        (UserModel.findOne as jest.Mock).mockResolvedValue({ email: 'test@test.com' });

        await signup(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(new Error('Email already exists.'));
    });

    // Updated signup test case to handle password properly
    it('should create a new user and return a token if successful', async () => {
        (validationResult as unknown as jest.Mock).mockReturnValue({
            isEmpty: () => true,
        });
        (UserModel.findOne as jest.Mock).mockResolvedValue(null);
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');

        // Mock save function to resolve with the expected user object, including the password
        (UserModel.prototype.save as jest.Mock).mockResolvedValue({
            _id: 'userId',
            email: 'test@test.com',
            fullname: 'Test User',
            password: 'hashedpassword', // Ensure password is included here
            role: 'user',
        });

        (jwt.sign as jest.Mock).mockReturnValue('token');

        await signup(req as Request, res as Response, next);

        expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
        expect(UserModel.prototype.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201); // Check if status 201 is called
        expect(res.json).toHaveBeenCalledWith({
            statusCode: '00',
            message: 'Signup successful',
            data: {
                user: {
                    _id: 'userId',
                    email: 'test@test.com',
                    fullname: 'Test User',
                    role: 'user',
                },
                accessToken: 'token',
            },
        });
    });
});



describe('AuthController - Login', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            body: { email: 'test@test.com', password: 'password' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return validation errors if validation fails', async () => {
        (validationResult as unknown as jest.Mock).mockReturnValue({
            isEmpty: () => false,
            array: () => [{ msg: 'Invalid email' }]
        });

        await login(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ errors: [{ msg: 'Invalid email' }] });
    });

    it('should return an error if user not found or password is incorrect', async () => {
        (validationResult as unknown as jest.Mock).mockReturnValue({
            isEmpty: () => true
        });
        (UserModel.findOne as jest.Mock).mockResolvedValue(null);

        await login(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(new Error('Invalid credentials.'));
    });

    // For login test case
    it('should return a token if login is successful', async () => {
        (validationResult as unknown as jest.Mock).mockReturnValue({
          isEmpty: () => true,
        });
        (UserModel.findOne as jest.Mock).mockResolvedValue({
          _id: 'userId',
          email: 'test@test.com',
          fullname: 'Test User',
          role: 'user',
          password: 'hashedpassword',
        });
      
        (bcrypt.compare as jest.Mock).mockResolvedValue(true); // Mock compare to return true
        (jwt.sign as jest.Mock).mockReturnValue('token');
      
        await login(req as Request, res as Response, next);
      
        expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedpassword');
        expect(res.status).toHaveBeenCalledWith(200); // Check if status 200 is called
        expect(res.json).toHaveBeenCalledWith({
          statusCode: '00',
          message: 'Login successful',
          data: {
            user: {
              _id: 'userId',
              email: 'test@test.com',
              fullname: 'Test User',
              role: 'user',
            },
            accessToken: 'token',
          },
        });
      });
      

});



describe('AuthController - Get All Users', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return all users', async () => {
        (UserModel.find as jest.Mock).mockResolvedValue([
            { _id: 'userId1', email: 'user1@example.com', fullname: 'User One', role: 'user' },
            { _id: 'userId2', email: 'user2@example.com', fullname: 'User Two', role: 'user' },
        ]);

        await getAllUsers(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            statusCode: '00',
            message: 'Users retrieved successfully',
            data: [
                { _id: 'userId1', email: 'user1@example.com', fullname: 'User One', role: 'user' },
                { _id: 'userId2', email: 'user2@example.com', fullname: 'User Two', role: 'user' },
            ],
        });
    });
});
