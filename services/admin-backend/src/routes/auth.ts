import { Router } from 'express';
import prisma from '../config/database';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { z } from 'zod';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  fullName: z.string().min(2).max(100),
  username: z.string().min(3).max(50).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const resetPasswordSchema = z.object({
  email: z.string().email()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100)
});

// Helper function to generate JWT token
const generateToken = (userId: string) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          ...(validatedData.username ? [{ username: validatedData.username }] : [])
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'User already exists with this email or username' 
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(validatedData.password, saltRounds);

    // Generate username if not provided
    let username = validatedData.username;
    if (!username) {
      username = validatedData.email.split('@')[0];
      // Ensure username is unique
      let counter = 1;
      let baseUsername = username;
      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        username,
        fullName: validatedData.fullName,
        passwordHash,
        preferences: {
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            breaking: true
          }
        },
        interests: ['Technology', 'Politics'] // Default interests
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        isVerified: true,
        preferences: true,
        interests: true,
        createdAt: true
      }
    });

    // Generate token
    const token = generateToken(user.id);

    return res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        passwordHash: true,
        isVerified: true,
        isAdmin: true,
        preferences: true,
        interests: true,
        lastLoginAt: true
      }
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(validatedData.password, user.passwordHash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Generate token
    const token = generateToken(user.id);

    // Remove password hash from response
    const { passwordHash, ...userResponse } = user;

    return res.json({
      message: 'Login successful',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    return res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/logout - Logout user (client-side token removal)
router.post('/logout', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // In a real implementation, you might want to blacklist the token
    // For now, we'll just send a success response
    // The client should remove the token from storage
    
    return res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Logout failed' });
  }
});

// GET /api/auth/me - Get current user profile
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        bio: true,
        isVerified: true,
        isAdmin: true,
        preferences: true,
        interests: true,
        readingHistory: true,
        language: true,
        timezone: true,
        notificationSettings: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            articles: true,
            comments: true,
            savedArticles: true,
            readingHistoryRecords: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      user: {
        ...user,
        stats: {
          articlesPublished: user._count.articles,
          commentsPosted: user._count.comments,
          articlesSaved: user._count.savedArticles,
          articlesRead: user._count.readingHistoryRecords
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const updateSchema = z.object({
      fullName: z.string().min(2).max(100).optional(),
      username: z.string().min(3).max(50).optional(),
      bio: z.string().max(500).optional(),
      avatarUrl: z.string().url().optional(),
      interests: z.array(z.string()).optional(),
      preferences: z.object({
        theme: z.enum(['light', 'dark']).optional(),
        notifications: z.object({
          email: z.boolean().optional(),
          push: z.boolean().optional(),
          breaking: z.boolean().optional()
        }).optional()
      }).optional(),
      language: z.string().optional(),
      timezone: z.string().optional()
    });

    const validatedData = updateSchema.parse(req.body);
    
    // Check if username is unique (if being updated)
    if (validatedData.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          AND: [
            { username: validatedData.username },
            { id: { not: req.user!.id } }
          ]
        }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: validatedData,
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        bio: true,
        isVerified: true,
        isAdmin: true,
        preferences: true,
        interests: true,
        language: true,
        timezone: true,
        notificationSettings: true,
        updatedAt: true
      }
    });

    return res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/auth/change-password - Change password
router.post('/change-password', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const validatedData = changePasswordSchema.parse(req.body);
    
    // Get current user with password hash
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        passwordHash: true
      }
    });

    if (!user || !user.passwordHash) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      validatedData.currentPassword, 
      user.passwordHash
    );
    
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(validatedData.newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { passwordHash: newPasswordHash }
    });

    return res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    return res.status(500).json({ error: 'Failed to change password' });
  }
});

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const validatedData = resetPasswordSchema.parse(req.body);
    
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: { id: true, email: true, fullName: true }
    });

    if (!user) {
      // Don't reveal if email exists for security
      return res.json({ 
        message: 'If your email is registered, you will receive a reset link' 
      });
    }

    // Generate reset token (in production, use crypto.randomBytes)
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password_reset' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // TODO: Send email with reset link
    // const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    // await sendEmail(user.email, 'Password Reset', resetLink);

    console.log(`Password reset link for ${user.email}: /reset-password?token=${resetToken}`);

    return res.json({ 
      message: 'If your email is registered, you will receive a reset link' 
    });
  } catch (error) {
    console.error('Error processing password reset:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    return res.status(500).json({ error: 'Failed to process password reset' });
  }
});

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const resetSchema = z.object({
      token: z.string(),
      newPassword: z.string().min(8).max(100)
    });

    const validatedData = resetSchema.parse(req.body);
    
    // Verify reset token
    let decoded: any;
    try {
      decoded = jwt.verify(validatedData.token, process.env.JWT_SECRET!);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    if (decoded.type !== 'password_reset') {
      return res.status(400).json({ error: 'Invalid token type' });
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(validatedData.newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { passwordHash }
    });

    return res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    return res.status(500).json({ error: 'Failed to reset password' });
  }
});

// POST /api/auth/verify-email - Verify email address
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    if (decoded.type !== 'email_verification') {
      return res.status(400).json({ error: 'Invalid token type' });
    }

    // Update user verification status
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { 
        emailVerified: true,
        isVerified: true 
      }
    });

    return res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error verifying email:', error);
    return res.status(500).json({ error: 'Failed to verify email' });
  }
});

export default router;
