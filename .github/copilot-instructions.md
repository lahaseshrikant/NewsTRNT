# Copilot Instructions for NewsTRNT Platform

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a comprehensive AI-powered news platform called NewsTRNT with the tagline "Your world. Your interests. Your news."

## Architecture
- **Frontend**: Next.js 14+ with TypeScript, Tailwind CSS, App Router
- **Backend**: Node.js with Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **AI Services**: Python-based scraping and AI summarization
- **Authentication**: NextAuth.js with multiple providers
- **Deployment**: Docker containers

## Key Features to Implement
1. Trending News Dashboard with real-time updates
2. Personalized AI-curated news feeds
3. Short news summaries (60-100 words) with audio
4. Deep dive articles and fact-checking
5. Multimedia content support
6. Push notifications system
7. AI chatbot assistant
8. Save for later functionality
9. Admin CMS with analytics
10. User accounts and social features

## Code Style Guidelines
- Use TypeScript for all JavaScript/Node.js code
- Follow Next.js 14+ App Router conventions
- Use Tailwind CSS for styling
- Implement proper error handling and validation
- Use Prisma for database operations
- Follow RESTful API design patterns
- Implement proper authentication and authorization
- Use environment variables for configuration

## Database Schema
- Users (authentication, preferences, reading history)
- Articles (content, metadata, categories, tags)
- Categories (news categories like Politics, Tech, etc.)
- Comments (user interactions)
- Saved Articles (reading list)
- Analytics (user behavior tracking)

## API Routes Structure
- `/api/auth/*` - Authentication endpoints
- `/api/articles/*` - Article CRUD operations
- `/api/categories/*` - Category management
- `/api/users/*` - User management
- `/api/admin/*` - Admin operations
- `/api/ai/*` - AI services integration

## Security Considerations
- Implement proper CORS policies
- Use JWT tokens for authentication
- Sanitize all user inputs
- Rate limiting for APIs
- HTTPS in production
