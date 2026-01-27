# Contributing to NewsNerve

Thank you for your interest in contributing to NewsNerve! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 12+ (or Neon/Supabase account)
- Git
- npm or yarn

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/lahaseshrikant/NewsNerve.git
   cd NewsNerve
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Set up database**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed  # Optional
   ```

5. **Start development servers**
   ```bash
   # Terminal 1: Frontend
   npm run dev
   
   # Terminal 2: Backend
   npm run backend:dev
   ```

---

## 📝 Code Style

### TypeScript
- Use TypeScript for all new code
- Enable strict mode
- Define interfaces for all data structures
- Avoid `any` type

### React/Next.js
- Use functional components with hooks
- Follow Next.js App Router conventions
- Use server components where appropriate
- Keep components small and focused

### Naming Conventions
- **Files**: `kebab-case.ts` or `PascalCase.tsx` for components
- **Variables**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`

### Formatting
- Use Prettier with default settings
- Run `npm run lint` before committing

---

## 🔀 Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

### Branch Naming
```
feature/add-user-comments
fix/auth-token-expiry
docs/update-api-reference
```

---

## 📨 Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make your changes**
   - Write clean, documented code
   - Add tests if applicable
   - Update documentation

3. **Test your changes**
   ```bash
   npm run lint
   npm run build
   # npm test (when available)
   ```

4. **Commit with clear messages**
   ```bash
   git commit -m "feat: add user comments feature"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature
   ```

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance

---

## 📁 Project Structure

```
NewsNerve/
├── src/                 # Frontend source
│   ├── app/            # Next.js pages
│   ├── components/     # React components
│   ├── lib/            # Utilities
│   └── types/          # TypeScript types
├── backend/            # Express backend
│   └── src/            # Backend source
├── prisma/             # Database schema
├── docs/               # Documentation
└── public/             # Static assets
```

### Where to Add Code

| Type | Location |
|------|----------|
| New page | `src/app/[route]/page.tsx` |
| Component | `src/components/` |
| API route | `src/app/api/` or `backend/src/routes/` |
| Utility | `src/lib/` |
| Type definition | `src/types/` |
| Database change | `prisma/schema.prisma` |

---

## 🧪 Testing (Planned)

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

---

## 📚 Documentation

- Update documentation for any user-facing changes
- Add JSDoc comments for public functions
- Update README if adding new features
- Add inline comments for complex logic

---

## 🔒 Security

- Never commit secrets or credentials
- Use environment variables for sensitive data
- Validate all user input
- Follow OWASP guidelines

### Reporting Security Issues

Please report security vulnerabilities privately to the maintainers.

---

## ❓ Questions?

- Check existing [documentation](docs/)
- Open a GitHub issue
- Contact the maintainers

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing! 🎉
