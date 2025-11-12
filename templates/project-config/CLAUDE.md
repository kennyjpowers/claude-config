# Project Name

## Architecture

- **Frontend**: [Tech stack, e.g., React 18 with TypeScript]
- **Backend**: [Tech stack, e.g., Node.js Express API]
- **Database**: [Database system, e.g., PostgreSQL]
- **Infrastructure**: [Deployment platform, e.g., AWS, Vercel]

## Development Commands

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Build for production
npm run build

# Type check
npm run type-check
```

## Coding Standards

- Use [style guide name, e.g., Airbnb style guide]
- Write unit tests for all business logic
- Minimum [X]% code coverage required
- See `examples/` directory for reference implementations
- Follow conventional commits format

## Testing Requirements

- **Unit Tests**: Jest/Vitest for component and utility testing
- **Integration Tests**: Test API endpoints and service integrations
- **E2E Tests**: Playwright/Cypress for critical user flows
- All new features must include tests
- Minimum 80% coverage on business logic

## Git Workflow

- **Branch Naming**:
  - Features: `feature/description`
  - Fixes: `fix/description`
  - Hotfixes: `hotfix/description`
- **Commit Messages**: Use conventional commits (feat, fix, docs, style, refactor, test, chore)
- **Pull Requests**:
  - Require 1+ approvals
  - All CI checks must pass
  - Update relevant documentation
  - Link to related issues

## File Organization

- `/src` - Source code
- `/tests` - Test files
- `/docs` - Documentation
- `/public` - Static assets
- `/scripts` - Build and utility scripts

## Environment Setup

Copy `.env.example` to `.env` and configure:
- Database connection strings
- API keys (never commit these!)
- Feature flags

## Additional Context

[Add any project-specific context, constraints, or guidelines]
