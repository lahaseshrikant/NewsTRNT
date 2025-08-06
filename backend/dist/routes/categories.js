"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(50),
    description: zod_1.z.string().max(200).optional(),
    color: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    icon: zod_1.z.string().max(10).optional(),
    isActive: zod_1.z.boolean().optional().default(true)
});
const updateCategorySchema = createCategorySchema.partial();
router.get('/', async (req, res) => {
    try {
        const { includeStats = 'false' } = req.query;
        const categories = await database_1.default.category.findMany({
            where: {
                isActive: true
            },
            orderBy: {
                sortOrder: 'asc'
            },
            ...(includeStats === 'true' && {
                include: {
                    _count: {
                        select: {
                            articles: true
                        }
                    }
                }
            })
        });
        const transformedCategories = categories.map((category) => ({
            ...category,
            ...(includeStats === 'true' && {
                articleCount: category._count?.articles || 0
            })
        }));
        return res.json(transformedCategories);
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        return res.status(500).json({ error: 'Failed to fetch categories' });
    }
});
router.get('/:slug', auth_1.optionalAuth, async (req, res) => {
    try {
        const { slug } = req.params;
        const { page = '1', limit = '20', sortBy = 'publishedAt', sortOrder = 'desc' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const category = await database_1.default.category.findUnique({
            where: { slug }
        });
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        const [articles, total] = await Promise.all([
            database_1.default.article.findMany({
                where: {
                    categoryId: category.id,
                    isPublished: true
                },
                skip,
                take: limitNum,
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            color: true
                        }
                    },
                    createdByUser: {
                        select: {
                            id: true,
                            fullName: true,
                            avatarUrl: true
                        }
                    },
                    tags: {
                        include: {
                            tag: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            comments: true,
                            savedByUsers: true,
                            interactions: true
                        }
                    }
                },
                orderBy: {
                    [sortBy]: sortOrder
                }
            }),
            database_1.default.article.count({
                where: {
                    categoryId: category.id,
                    isPublished: true
                }
            })
        ]);
        const transformedArticles = articles.map((article) => ({
            ...article,
            author: article.createdByUser,
            tags: article.tags.map((t) => t.tag),
            commentCount: article._count.comments,
            saveCount: article._count.savedByUsers,
            interactionCount: article._count.interactions
        }));
        return res.json({
            category,
            articles: transformedArticles,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
                hasNext: pageNum < Math.ceil(total / limitNum),
                hasPrev: pageNum > 1
            }
        });
    }
    catch (error) {
        console.error('Error fetching category:', error);
        return res.status(500).json({ error: 'Failed to fetch category' });
    }
});
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user?.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const validatedData = createCategorySchema.parse(req.body);
        const slug = validatedData.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-');
        const existingCategory = await database_1.default.category.findUnique({
            where: { slug }
        });
        if (existingCategory) {
            return res.status(400).json({ error: 'A category with this name already exists' });
        }
        const category = await database_1.default.category.create({
            data: {
                name: validatedData.name,
                description: validatedData.description,
                color: validatedData.color || '#000000',
                icon: validatedData.icon,
                isActive: validatedData.isActive !== false,
                slug
            }
        });
        return res.status(201).json(category);
    }
    catch (error) {
        console.error('Error creating category:', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        return res.status(500).json({ error: 'Failed to create category' });
    }
});
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user?.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const { id } = req.params;
        const validatedData = updateCategorySchema.parse(req.body);
        const existingCategory = await database_1.default.category.findUnique({
            where: { id }
        });
        if (!existingCategory) {
            return res.status(404).json({ error: 'Category not found' });
        }
        const updateData = { ...validatedData };
        if (validatedData.name && validatedData.name !== existingCategory.name) {
            updateData.slug = validatedData.name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-');
        }
        const category = await database_1.default.category.update({
            where: { id },
            data: updateData
        });
        return res.json(category);
    }
    catch (error) {
        console.error('Error updating category:', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        return res.status(500).json({ error: 'Failed to update category' });
    }
});
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user?.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const { id } = req.params;
        const category = await database_1.default.category.findUnique({
            where: { id }
        });
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        const articleCount = await database_1.default.article.count({
            where: { categoryId: id }
        });
        if (articleCount > 0) {
            return res.status(400).json({
                error: 'Cannot delete category with existing articles. Please reassign or delete articles first.'
            });
        }
        await database_1.default.category.delete({
            where: { id }
        });
        return res.json({ message: 'Category deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting category:', error);
        return res.status(500).json({ error: 'Failed to delete category' });
    }
});
exports.default = router;
//# sourceMappingURL=categories.js.map