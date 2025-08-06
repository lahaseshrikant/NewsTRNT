"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).max(100),
    fullName: zod_1.z.string().min(2).max(100),
    username: zod_1.z.string().min(3).max(50).optional()
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1)
});
const resetPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email()
});
const changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1),
    newPassword: zod_1.z.string().min(8).max(100)
});
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};
router.post('/register', async (req, res) => {
    try {
        const validatedData = registerSchema.parse(req.body);
        const existingUser = await database_1.default.user.findFirst({
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
        const saltRounds = 12;
        const passwordHash = await bcryptjs_1.default.hash(validatedData.password, saltRounds);
        let username = validatedData.username;
        if (!username) {
            username = validatedData.email.split('@')[0];
            let counter = 1;
            let baseUsername = username;
            while (await database_1.default.user.findUnique({ where: { username } })) {
                username = `${baseUsername}${counter}`;
                counter++;
            }
        }
        const user = await database_1.default.user.create({
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
                interests: ['Technology', 'Politics']
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
        const token = generateToken(user.id);
        return res.status(201).json({
            message: 'User registered successfully',
            user,
            token
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors
            });
        }
        return res.status(500).json({ error: 'Registration failed' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const validatedData = loginSchema.parse(req.body);
        const user = await database_1.default.user.findUnique({
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
        const isValidPassword = await bcryptjs_1.default.compare(validatedData.password, user.passwordHash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        await database_1.default.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
        });
        const token = generateToken(user.id);
        const { passwordHash, ...userResponse } = user;
        return res.json({
            message: 'Login successful',
            user: userResponse,
            token
        });
    }
    catch (error) {
        console.error('Login error:', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors
            });
        }
        return res.status(500).json({ error: 'Login failed' });
    }
});
router.post('/logout', auth_1.authenticateToken, async (req, res) => {
    try {
        return res.json({ message: 'Logout successful' });
    }
    catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({ error: 'Logout failed' });
    }
});
router.get('/me', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = await database_1.default.user.findUnique({
            where: { id: req.user.id },
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
    }
    catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});
router.put('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        const updateSchema = zod_1.z.object({
            fullName: zod_1.z.string().min(2).max(100).optional(),
            username: zod_1.z.string().min(3).max(50).optional(),
            bio: zod_1.z.string().max(500).optional(),
            avatarUrl: zod_1.z.string().url().optional(),
            interests: zod_1.z.array(zod_1.z.string()).optional(),
            preferences: zod_1.z.object({
                theme: zod_1.z.enum(['light', 'dark']).optional(),
                notifications: zod_1.z.object({
                    email: zod_1.z.boolean().optional(),
                    push: zod_1.z.boolean().optional(),
                    breaking: zod_1.z.boolean().optional()
                }).optional()
            }).optional(),
            language: zod_1.z.string().optional(),
            timezone: zod_1.z.string().optional()
        });
        const validatedData = updateSchema.parse(req.body);
        if (validatedData.username) {
            const existingUser = await database_1.default.user.findFirst({
                where: {
                    AND: [
                        { username: validatedData.username },
                        { id: { not: req.user.id } }
                    ]
                }
            });
            if (existingUser) {
                return res.status(400).json({ error: 'Username already taken' });
            }
        }
        const updatedUser = await database_1.default.user.update({
            where: { id: req.user.id },
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
    }
    catch (error) {
        console.error('Error updating profile:', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors
            });
        }
        return res.status(500).json({ error: 'Failed to update profile' });
    }
});
router.post('/change-password', auth_1.authenticateToken, async (req, res) => {
    try {
        const validatedData = changePasswordSchema.parse(req.body);
        const user = await database_1.default.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                passwordHash: true
            }
        });
        if (!user || !user.passwordHash) {
            return res.status(404).json({ error: 'User not found' });
        }
        const isValidPassword = await bcryptjs_1.default.compare(validatedData.currentPassword, user.passwordHash);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }
        const saltRounds = 12;
        const newPasswordHash = await bcryptjs_1.default.hash(validatedData.newPassword, saltRounds);
        await database_1.default.user.update({
            where: { id: req.user.id },
            data: { passwordHash: newPasswordHash }
        });
        return res.json({ message: 'Password changed successfully' });
    }
    catch (error) {
        console.error('Error changing password:', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors
            });
        }
        return res.status(500).json({ error: 'Failed to change password' });
    }
});
router.post('/forgot-password', async (req, res) => {
    try {
        const validatedData = resetPasswordSchema.parse(req.body);
        const user = await database_1.default.user.findUnique({
            where: { email: validatedData.email },
            select: { id: true, email: true, fullName: true }
        });
        if (!user) {
            return res.json({
                message: 'If your email is registered, you will receive a reset link'
            });
        }
        const resetToken = jwt.sign({ userId: user.id, type: 'password_reset' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log(`Password reset link for ${user.email}: /reset-password?token=${resetToken}`);
        return res.json({
            message: 'If your email is registered, you will receive a reset link'
        });
    }
    catch (error) {
        console.error('Error processing password reset:', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors
            });
        }
        return res.status(500).json({ error: 'Failed to process password reset' });
    }
});
router.post('/reset-password', async (req, res) => {
    try {
        const resetSchema = zod_1.z.object({
            token: zod_1.z.string(),
            newPassword: zod_1.z.string().min(8).max(100)
        });
        const validatedData = resetSchema.parse(req.body);
        let decoded;
        try {
            decoded = jwt.verify(validatedData.token, process.env.JWT_SECRET);
        }
        catch (error) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }
        if (decoded.type !== 'password_reset') {
            return res.status(400).json({ error: 'Invalid token type' });
        }
        const saltRounds = 12;
        const passwordHash = await bcryptjs_1.default.hash(validatedData.newPassword, saltRounds);
        await database_1.default.user.update({
            where: { id: decoded.userId },
            data: { passwordHash }
        });
        return res.json({ message: 'Password reset successfully' });
    }
    catch (error) {
        console.error('Error resetting password:', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors
            });
        }
        return res.status(500).json({ error: 'Failed to reset password' });
    }
});
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        }
        catch (error) {
            return res.status(400).json({ error: 'Invalid or expired verification token' });
        }
        if (decoded.type !== 'email_verification') {
            return res.status(400).json({ error: 'Invalid token type' });
        }
        await database_1.default.user.update({
            where: { id: decoded.userId },
            data: {
                emailVerified: true,
                isVerified: true
            }
        });
        return res.json({ message: 'Email verified successfully' });
    }
    catch (error) {
        console.error('Error verifying email:', error);
        return res.status(500).json({ error: 'Failed to verify email' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map