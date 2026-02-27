# 📰 NewsTRNT

**Your world. Your interests. Your news.**

NewsTRNT is a modular, multi‑service news platform built for scale and experimentation. The repository contains three cooperating subsystems with separated concerns:

1. **User‑facing** – a Next.js/TypeScript frontend (`apps/user-frontend`) backed by an Express&nbsp;API (`services/user-backend`).
2. **Admin tools** – a dedicated Next.js dashboard (`apps/admin-frontend`) with its own Express&nbsp;API (`services/admin-backend`) for managing content, scheduling, market data, and configuration.
3. **Content Engine** – a standalone Python/FastAPI microservice (`services/content-engine`) responsible for scraping feeds, running AI pipelines, and delivering processed articles back to the admin backend.

The platform uses a shared Neon/PostgreSQL database accessed via Prisma in the Node services, while the Content Engine communicates exclusively over HTTP with API keys. Authentication is handled with JWTs for user/admin flows and service‑to‑service bearer tokens.

---

## 📦 Project Layout

```
news-platform/
├── apps/
│   ├── user-frontend/        # public Next.js website
│   └── admin-frontend/       # internal administration UI
├── services/
│   ├── user-backend/         # Express API for user features
│   ├── admin-backend/        # Express API for admin & ingest
│   └── content-engine/       # FastAPI Python scraping/AI microservice
├── docs/                     # design docs, architecture, guides
├── .github/                  # Copilot instructions (current file)
├── prisma/                   # shared Prisma schema & migrations
└── ...                       # misc (scripts, legacy, data)
```

Each service has its own dependency manifest (`package.json` or `requirements.txt`) and should be developed/installed independently. The root `node_modules` and `.venv` directories are not used and can be deleted.

---

## 🛠️ Setup & Development

Most work happens inside the service folder you care about. Typical workflow:

```bash
# frontend or backend service
cd apps/user-frontend       # or apps/admin-frontend
npm install
npm run dev

# backend API
cd services/user-backend
npm install
npm run dev

# content engine
cd services/content-engine
python -m venv .venv        # or use configure_python_environment tool
pip install -r requirements.txt
python main.py
```

> **Tip:** you can also start every project with a single command via the helper scripts added to the repo root. On Windows run:
>
> ```powershell
> .\dev.ps1
> ```
>
> and on macOS/Linux/WSL:
>
> ```bash
> bash dev.sh
> ```
>
> Each service opens in its own terminal window (PowerShell) or background process (bash) so you can watch logs separately.


Copy and fill `.env`/`.env.local` from the provided examples in each service directory.

For database work, run migrations from any Node service that includes Prisma: `npx prisma migrate dev`.

Dockerfiles exist for all services if you prefer containerised development.

---

## 📚 Documentation

The `docs/` folder contains detailed architecture notes, API reference, feature guides, and other long‑form documentation. See `docs/SERVICE_ARCHITECTURE.md` for an overview of inter‑service communication.

---

## 🧭 Useful Links

- **Content Engine README**: `services/content-engine/README.md`  (scraper & AI pipeline details)
- **Admin UI pages**: `/content-engine`, `/market-data`, `/system`, etc.
- **API references**: search for `router.get` in `services/*/src/routes`.

---

## ✅ Contribution Notes

- Keep TypeScript in Node services; use Python 3.11+ in Content Engine.
- Follow existing patterns when adding new features (see examples in each service).
- Always update environment variable docs in `.env.example` files.
- Add new admin‑backend endpoints through the proxy if the frontend needs them.

Happy hacking!


## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Frontend                         │
│              (React 19 + TypeScript + Tailwind)             │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
   ┌────────────┐  ┌─────────────┐  ┌──────────────┐
   │  Next.js   │  │   Express   │  │    Python    │
   │ API Routes │  │   Backend   │  │  AI Services │
   │ (Port 3000)│  │ (Port 5000) │  │   (Scraper)  │
   └──────┬─────┘  └──────┬──────┘  └──────────────┘
          │               │
          └───────┬───────┘
                  │
          ┌───────▼───────┐
          │  PostgreSQL   │
          │  + Prisma ORM │
          └───────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 12+ (or use Neon/Supabase free tier)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/lahaseshrikant/NewsNerve.git
cd NewsNerve

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your database and API credentials

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed
```

### Development

```bash
# Start frontend (http://localhost:3000)
npm run dev

# In another terminal, start backend (http://localhost:5000)
npm run backend:dev
```

### Production Build

```bash
# Build frontend
npm run build

# Build backend
npm run backend:build

# Start production
npm run start
```

---

## 📁 Project Structure

```
NewsNerve/
├── src/                    # Frontend source
│   ├── app/               # Next.js App Router pages
│   │   ├── api/          # API route handlers
│   │   ├── admin/        # Admin portal pages
│   │   ├── article/      # Article pages
│   │   ├── category/     # Category pages
│   │   └── ...           # Other pages
│   ├── components/        # Reusable React components
│   ├── lib/              # Utilities and API clients
│   ├── hooks/            # Custom React hooks
│   ├── contexts/         # React Context providers
│   └── types/            # TypeScript type definitions
│
├── backend/               # Express.js backend
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth, error handling
│   │   └── config/       # Database config
│   └── prisma/           # Backend-specific Prisma
│
├── prisma/                # Database schema
│   └── schema.prisma     # Prisma schema definition
│
├── scraper-ai/           # Python AI services
│   ├── ai/               # AI processing modules
│   └── scraping/         # News scraping scripts
│
├── docs/                  # Documentation
│   ├── ARCHITECTURE.md   # System design
│   ├── API.md            # API reference
│   └── ...               # Other docs
│
├── deprecated/database/  # SQL migrations & seeds (deprecated)
├── data/                 # Static data files
└── public/               # Static assets
```

---

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
# Database (Neon PostgreSQL recommended for free tier)
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
JWT_SECRET="your-jwt-secret"

# Site Configuration
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="NewsNerve"

# News APIs (optional, for live data)
NEWS_API_KEY="your-newsapi-key"
GNEWS_API_KEY="your-gnews-key"
```

See [docs/CONFIGURATION.md](docs/CONFIGURATION.md) for complete configuration guide.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/ARCHITECTURE.md) | System design and patterns |
| [API Reference](docs/API.md) | Complete API documentation |
| [Database Schema](docs/DATABASE.md) | Database models and relationships |
| [Deployment](docs/DEPLOYMENT.md) | Production deployment guide |
| [Security](docs/SECURITY.md) | Security implementation details |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.4.5 | React framework with SSR |
| React | 19.1.0 | UI library |
| TypeScript | 5.0+ | Type safety |
| Tailwind CSS | 4.0 | Utility-first styling |
| TipTap | 3.6+ | Rich text editor |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Express.js | 4.18+ | REST API framework |
| Prisma | 6.13+ | Database ORM |
| PostgreSQL | 15+ | Relational database |
| JWT | - | Authentication tokens |
| bcryptjs | 3.0+ | Password hashing |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Neon/Supabase | Managed PostgreSQL |
| Vercel | Frontend deployment |

---

## 📊 Project Statistics

- **15,000+** lines of TypeScript code
- **40+** pages and API endpoints
- **15** database models with relationships
- **50+** implemented features
- **100%** TypeScript coverage

---

## 🔒 Security Features

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT token authentication with expiration
- ✅ Email verification requirement
- ✅ Role-based access control
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection

---

## 🚧 Roadmap & Improvements

### Completed ✅
- [x] User authentication system
- [x] Article CRUD with rich editor
- [x] Category management
- [x] Admin portal
- [x] Responsive design
- [x] Market data integration
- [x] Search functionality

### Planned 📋
- [ ] Add comprehensive test suite (Jest + React Testing Library)
- [ ] Implement CI/CD pipeline (GitHub Actions)
- [ ] Add Redis caching layer
- [ ] Implement WebSocket for real-time updates
- [ ] Add GraphQL API option
- [ ] Mobile app (React Native)
- [ ] Multi-language support (i18n)
- [ ] Email notification service
- [ ] Social login (Google, GitHub)
- [ ] Article comments system

---

## 🧪 Testing

```bash
# Run unit tests (planned)
npm test

# Run e2e tests (planned)
npm run test:e2e

# Run linting
npm run lint
```

---

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run backend:dev` | Start Express backend (dev) |
| `npm run backend:build` | Build backend |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed database |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

## 👤 Author

**Shrikant Lahase**

- GitHub: [@lahaseshrikant](https://github.com/lahaseshrikant)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Prisma](https://prisma.io/) - Next-generation ORM
- [TipTap](https://tiptap.dev/) - Rich text editor
- [Neon](https://neon.tech/) - Serverless PostgreSQL

---

<p align="center">
  Made with ❤️ using Next.js, React, and TypeScript
</p>
