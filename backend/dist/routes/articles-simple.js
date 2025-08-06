"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.optionalAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const [articles, total] = await Promise.all([
            database_1.default.article.findMany({
                skip: offset,
                take: limit,
                where: {
                    isPublished: true
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
                    _count: {
                        select: {
                            comments: true,
                            savedByUsers: true,
                            interactions: true
                        }
                    }
                },
                orderBy: {
                    publishedAt: 'desc'
                }
            }),
            database_1.default.article.count({
                where: {
                    isPublished: true
                }
            })
        ]);
        const transformedArticles = articles.map((article) => ({
            id: article.id,
            title: article.title,
            slug: article.slug,
            summary: article.summary,
            excerpt: article.excerpt,
            imageUrl: article.imageUrl,
            publishedAt: article.publishedAt,
            readingTime: article.readingTime,
            viewCount: article.viewCount,
            likeCount: article.likeCount,
            shareCount: article.shareCount,
            isBreaking: article.isBreaking,
            isFeatured: article.isFeatured,
            isTrending: article.isTrending,
            category: article.category,
            author: article.createdByUser,
            tags: article.tags.map((t) => t.tag),
            commentCount: article._count.comments,
            saveCount: article._count.savedByUsers,
            interactionCount: article._count.interactions
        }));
        return res.json({
            articles: transformedArticles,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
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
        const transformedArticle = {
            id: article.id,
            title: article.title,
            slug: article.slug,
            content: article.content,
            summary: article.summary,
            excerpt: article.excerpt,
            imageUrl: article.imageUrl,
            publishedAt: article.publishedAt,
            readingTime: article.readingTime,
            viewCount: article.viewCount + 1,
            likeCount: article.likeCount,
            shareCount: article.shareCount,
            isBreaking: article.isBreaking,
            isFeatured: article.isFeatured,
            isTrending: article.isTrending,
            category: article.category,
            author: article.createdByUser,
            tags: article.tags.map((t) => t.tag),
            comments: article.comments,
            commentCount: article._count.comments,
            saveCount: article._count.savedByUsers,
            interactionCount: article._count.interactions
        };
        return res.json(transformedArticle);
    }
    catch (error) {
        console.error('Error fetching article:', error);
        return res.status(500).json({ error: 'Failed to fetch article' });
    }
});
exports.default = router;
//# sourceMappingURL=articles-simple.js.map