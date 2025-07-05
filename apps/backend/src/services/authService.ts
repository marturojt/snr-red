import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = '30d'; // 30 days

export interface AuthResult {
  user: IUser;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  plan?: 'free' | 'premium';
}

export class AuthService {
  static async register(data: RegisterRequest): Promise<AuthResult> {
    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    // Create user
    const user = new User({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      plan: data.plan || 'free',
      lastLoginAt: new Date()
    });

    await user.save();

    // Generate token
    const token = this.generateToken(user);

    return { user, token };
  }

  static async login(data: LoginRequest): Promise<AuthResult> {
    // Find user
    const user = await User.findOne({ email: data.email, isActive: true });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate token
    const token = this.generateToken(user);

    return { user, token };
  }

  static generateToken(user: IUser): string {
    const payload = {
      userId: user._id,
      email: user.email,
      plan: user.plan
    };
    
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  static verifyToken(token: string): jwt.JwtPayload | string {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static async getUserById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  static async updateUserPlan(userId: string, plan: 'free' | 'premium'): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { plan },
      { new: true }
    );
  }

  static async deactivateUser(userId: string): Promise<boolean> {
    const result = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );
    return !!result;
  }
}
