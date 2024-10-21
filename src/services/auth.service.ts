import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import { CreateUserDto } from '../dto/create-user.dto';


export class AuthService {
    async signup(createUserDto: CreateUserDto) {
        const { email, password, role, fullname } = createUserDto;

        // Check if user already exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return { statusCode: 409, message: 'User already exists' };
        }

        // Hash password and create a new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({
            email,
            password: hashedPassword,
            role,
            fullname
        });

        await newUser.save();
        return {
            statusCode: 201,
            message: 'Signup successful',
            data: {
                user: newUser,
            },
        };
    }

    async login(userData: any) {
        const { email, password } = userData;
        const user = await UserModel.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return { statusCode: 401, message: 'Invalid credentials' };
        }

        const jwtSecret = process.env.JWT_SECRET || 'default_secret';

        // Generate JWT token
        const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, {
            expiresIn: '1d',
        });

        return {
            statusCode: 200,
            message: 'Login successful',
            data: {
                user,
                accessToken: token,
            },
        };
    }
}
