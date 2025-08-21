# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Development
- `npm run build` - Build the application and copy assets
- `npm run start:dev` - Start development server with watch mode
- `npm run start:debug` - Start with debugging enabled
- `npm run start:prod` - Start production server

### Testing
- `npm run test` - Run unit tests
- `npm run test:watch` - Run unit tests in watch mode
- `npm run test:cov` - Run tests with coverage
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:e2e:watch` - Run e2e tests in watch mode

### Code Quality
- `npm run lint` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier

### Database Operations
- `npm run mg:generate` - Generate migration from entity changes
- `npm run mg:create` - Create empty migration file
- `npm run mg:run` - Run pending migrations
- `npm run mg:revert` - Revert last migration
- `npm run mg:show` - Show migration status

### Background Jobs
- `npm run job:interest` - Run daily interest calculation job
- `npm run job:overduePayments` - Check overdue payments
- `npm run job:overdue-notifier` - Send WhatsApp notifications for overdue loans
- `npm run job:employees-notifier` - Send Telegram notifications to employees
- `npm run job:loan-snapshots` - Create loan balance snapshots

## Architecture Overview

This is a NestJS-based financial management API for a loan company (Grupo Avanza) that handles loans, payments, customers, employees, and financial reporting.

### Core Domain Modules

**Loans Module** (`src/loans/`)
- Central business logic for loan management
- Sub-modules: installments, payments, refinancing, loan-history, loans-management
- Handles loan states, interest calculations, and payment processing
- Contains background jobs for notifications and interest calculations

**Customers Module** (`src/customers/`)
- Customer management and financial activity tracking
- Handles customer profiles and financial history

**Employees Module** (`src/employees/`)
- Employee management with positions and commission tracking
- Commission calculations tied to loan installments

**Wallets Module** (`src/wallets/`)
- Transaction management system
- Handles wallet balances and transaction categories
- Recently refactored to remove transaction types in favor of categories

### Supporting Modules

**Auth Module** (`src/auth/`)
- JWT-based authentication with refresh tokens
- Role-based access control
- API key authentication guard

**Database Module** (`src/database/`)
- TypeORM configuration with MySQL
- Migration management
- Uses environment-specific entity/migration paths

**Notifications Module** (`src/notifications/`)
- WhatsApp and Telegram integration
- Automated notifications for overdue payments

**Reports Module** (`src/reports/`)
- Financial reporting and analytics
- Profit calculations and loan performance metrics

### Key Technical Details

**Database Strategy:**
- Uses TypeORM with MySQL
- Migration-first approach (synchronize: false)
- Entities follow the pattern: `*.entity.ts`
- Database migrations in `src/database/migrations/`

**Testing Setup:**
- Unit tests: Jest with `*.spec.ts` pattern in `src/`
- E2E tests: Separate Jest config in `test/` directory
- Test database teardown and mocks provided

**Background Jobs:**
- Standalone job runners in `src/jobs/runners/`
- Daily interest calculations
- Overdue payment checking
- Notification systems (WhatsApp/Telegram)

**Payment Processing:**
- Complex installment-based payment system
- Support for partial payments, refinancing, and pay-offs
- Payment types and installment states tracking

### Recent Changes
- Transaction types removed in favor of transaction categories
- Installment filtering enhanced to exclude paid/refinanced installments
- New fields added to installments table for better tracking
- Payment system refactored to support multiple payment types

## Development Notes

**Environment Configuration:**
- Uses different configs per environment via `src/environments.ts`
- Database connection via `DATABASE_URL` environment variable
- CORS origins configurable via `CORS_ORIGINS`

**Validation:**
- Global validation pipe with whitelist enabled
- Class-transformer and class-validator for DTOs
- Custom transformers for number columns

**PDF Generation:**
- Handlebars templates for contract generation
- Puppeteer integration for PDF creation

**Telegram Bot Integration:**
- Webhook-based in production
- Employee notifications and management features