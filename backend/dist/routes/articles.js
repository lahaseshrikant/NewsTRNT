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
const createArticleSchema = zod_1.z.object({
    title: zod_1.z.string().min(10).max(200),
    content: zod_1.z.string().min(100),
    summary: zod_1.z.string().min(50).max(500),
    categoryId: zod_1.z.string().uuid(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    imageUrl: zod_1.z.string().url().optional(),
    isBreaking: zod_1.z.boolean().optional().default(false),
    isPublished: zod_1.z.boolean().optional().default(true)
});
const updateArticleSchema = createArticleSchema.partial();
router.get('/', auth_1.optionalAuth, async (req, res) => {
    try {
        const { page = '1', limit = '20', category, tags, search, breaking, trending, sortBy = 'publishedAt', sortOrder = 'desc' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where = {
            isPublished: true
        };
        if (category) {
            where.category = {
                slug: category
            };
        }
        if (tags) {
            const tagArray = tags.split(',');
            where.tags = {
                some: {
                    tag: {
                        slug: {
                            in: tagArray
                        }
                    }
                }
            };
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
                { summary: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (breaking === 'true') {
            where.isBreaking = true;
        }
        let orderBy = {};
        if (trending === 'true') {
            orderBy = [
                { viewCount: 'desc' },
                { publishedAt: 'desc' }
            ];
        }
        else {
            orderBy[sortBy] = sortOrder;
        }
        const [articles, total] = await Promise.all([
            database_1.default.article.findMany({
                where,
                orderBy,
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
                }
            }),
            database_1.default.article.count({ where })
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
        console.error('Error fetching articles:', error);
        return res.status(500).json({ error: 'Failed to fetch articles' });
    }
});
router.get('/:id', auth_1.optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const article = await database_1.default.article.findUnique({
            where: { id },
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
                        username: true,
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
                comments: {
                    take: 10,
                    where: {
                        isApproved: true,
                        parentId: null
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                username: true,
                                avatarUrl: true
                            }
                        },
                        replies: {
                            take: 5,
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        fullName: true,
                                        username: true,
                                        avatarUrl: true
                                    }
                                }
                            },
                            orderBy: {
                                createdAt: 'asc'
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                _count: {
                    select: {
                        comments: true,
                        savedByUsers: true,
                        interactions: true
                    }
                }
            }
        });
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }
        if (!article.isPublished && (!req.user || !req.user.isAdmin)) {
            return res.status(404).json({ error: 'Article not found' });
        }
        if (req.user) {
            await database_1.default.userInteraction.upsert({
                where: {
                    userId_articleId_interactionType: {
                        userId: req.user.id,
                        articleId: article.id,
                        interactionType: 'VIEW'
                    }
                },
                update: {},
                create: {
                    userId: req.user.id,
                    articleId: article.id,
                    interactionType: 'VIEW'
                }
            });
            await database_1.default.readingHistory.upsert({
                where: {
                    userId_articleId: {
                        userId: req.user.id,
                        articleId: article.id
                    }
                },
                update: {
                    readAt: new Date(),
                    scrollPercentage: 100
                },
                create: {
                    userId: req.user.id,
                    articleId: article.id,
                    readingTime: 0,
                    scrollPercentage: 0
                }
            });
        }
        await database_1.default.article.update({
            where: { id },
            data: {
                viewCount: {
                    increment: 1
                }
            }
        });
        const relatedArticles = await database_1.default.article.findMany({
            take: 5,
            where: {
                AND: [
                    { id: { not: article.id } },
                    { isPublished: true },
                    {
                        OR: [
                            { categoryId: article.categoryId },
                            {
                                tags: {
                                    some: {
                                        tag: {
                                            slug: {
                                                in: article.tags.map((t) => t.tag.slug)
                                            }
                                        }
                                    }
                                }
                            }
                        ]
                    }
                ]
            },
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
                }
            },
            orderBy: {
                publishedAt: 'desc'
            }
        });
        const transformedArticle = {
            ...article,
            author: article.createdByUser,
            tags: article.tags.map((t) => t.tag),
            commentCount: article._count.comments,
            saveCount: article._count.savedByUsers,
            interactionCount: article._count.interactions,
            relatedArticles
        };
        return res.json(transformedArticle);
    }
    catch (error) {
        console.error('Error fetching article:', error);
        return res.status(500).json({ error: 'Failed to fetch article' });
    }
});
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user?.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const validatedData = createArticleSchema.parse(req.body);
        const { tags, ...articleData } = validatedData;
        const slug = validatedData.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 100);
        const existingArticle = await database_1.default.article.findUnique({
            where: { slug }
        });
        if (existingArticle) {
            return res.status(400).json({ error: 'An article with this title already exists' });
        }
        const article = await database_1.default.article.create({
            data: {
                title: articleData.title,
                content: articleData.content,
                summary: articleData.summary,
                slug,
                categoryId: articleData.categoryId,
                imageUrl: articleData.imageUrl,
                isBreaking: articleData.isBreaking || false,
                isPublished: articleData.isPublished !== false,
                createdBy: req.user.id,
                readingTime: Math.ceil(validatedData.content.length / 1000),
                publishedAt: articleData.isPublished !== false ? new Date() : null
            },
            include: {
                category: true,
                createdByUser: {
                    select: {
                        id: true,
                        fullName: true,
                        avatarUrl: true
                    }
                }
            }
        });
        if (tags && tags.length > 0) {
            for (const tagName of tags) {
                const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-');
                const tag = await database_1.default.tag.upsert({
                    where: { slug: tagSlug },
                    update: {
                        usageCount: {
                            increment: 1
                        }
                    },
                    create: {
                        name: tagName,
                        slug: tagSlug,
                        usageCount: 1
                    }
                });
                await database_1.default.articleTag.create({
                    data: {
                        articleId: article.id,
                        tagId: tag.id
                    }
                });
            }
        }
        return res.status(201).json(article);
    }
    catch (error) {
        console.error('Error creating article:', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        return res.status(500).json({ error: 'Failed to create article' });
    }
});
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user?.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const { id } = req.params;
        const validatedData = updateArticleSchema.parse(req.body);
        const existingArticle = await database_1.default.article.findUnique({
            where: { id }
        });
        if (!existingArticle) {
            return res.status(404).json({ error: 'Article not found' });
        }
        const updateData = {
            ...validatedData,
            updatedBy: req.user.id
        };
        if (validatedData.title && validatedData.title !== existingArticle.title) {
            updateData.slug = validatedData.title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .substring(0, 100);
        }
        if (validatedData.content) {
            updateData.readingTime = Math.ceil(validatedData.content.length / 1000);
        }
        const article = await database_1.default.article.update({
            where: { id },
            data: updateData,
            include: {
                category: true,
                createdByUser: {
                    select: {
                        id: true,
                        fullName: true,
                        avatarUrl: true
                    }
                }
            }
        });
        return res.json(article);
    }
    catch (error) {
        console.error('Error updating article:', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        return res.status(500).json({ error: 'Failed to update article' });
    }
});
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user?.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const { id } = req.params;
        const article = await database_1.default.article.findUnique({
            where: { id }
        });
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }
        await database_1.default.article.delete({
            where: { id }
        });
        return res.json({ message: 'Article deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting article:', error);
        return res.status(500).json({ error: 'Failed to delete article' });
    }
});
router.post('/:id/save', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const article = await database_1.default.article.findUnique({
            where: { id, isPublished: true }
        });
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }
        const existingSave = await database_1.default.savedArticle.findUnique({
            where: {
                userId_articleId: {
                    userId,
                    articleId: id
                }
            }
        });
        if (existingSave) {
            await database_1.default.savedArticle.delete({
                where: {
                    userId_articleId: {
                        userId,
                        articleId: id
                    }
                }
            });
            return res.json({ saved: false, message: 'Article removed from saved list' });
        }
        else {
            await database_1.default.savedArticle.create({
                data: {
                    userId,
                    articleId: id
                }
            });
            return res.json({ saved: true, message: 'Article saved successfully' });
        }
    }
    catch (error) {
        console.error('Error saving/unsaving article:', error);
        return res.status(500).json({ error: 'Failed to save/unsave article' });
    }
});
router.post('/:id/interact', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.body;
        const userId = req.user.id;
        if (!['LIKE', 'SHARE', 'COMMENT'].includes(type)) {
            return res.status(400).json({ error: 'Invalid interaction type' });
        }
        const article = await database_1.default.article.findUnique({
            where: { id, isPublished: true }
        });
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }
        await database_1.default.userInteraction.upsert({
            where: {
                userId_articleId_interactionType: {
                    userId,
                    articleId: id,
                    interactionType: type
                }
            },
            update: {},
            create: {
                userId,
                articleId: id,
                interactionType: type
            }
        });
        return res.json({ message: 'Interaction recorded successfully' });
    }
    catch (error) {
        console.error('Error recording interaction:', error);
        return res.status(500).json({ error: 'Failed to record interaction' });
    }
});
exports.default = router;
//# sourceMappingURL=articles.js.map