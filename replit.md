# Atlantic Weizard - Luxury E-commerce Platform

## Overview

Atlantic Weizard is a full-stack luxury men's fashion e-commerce platform built with React, TypeScript, Express.js, and PostgreSQL. The application enables customers to browse premium products (cashmere overcoats, silk shirts, luxury accessories), add items to cart, and complete purchases through PayU payment gateway integration. The platform supports both guest checkout and registered user accounts with order history tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript and Vite bundler

**UI System**: Tailwind CSS with shadcn/ui component library (Radix UI primitives)
- Custom theming with CSS variables for dark/light mode support
- Luxury brand aesthetic with Playfair Display serif font for headings
- Responsive design with mobile-first approach

**State Management**:
- TanStack Query (React Query) for server state caching and synchronization
- React Context API for cart state and authentication state
- LocalStorage persistence for shopping cart items

**Routing**: Wouter - lightweight client-side routing library

**Form Handling**: React Hook Form with Zod schema validation

**Key Design Patterns**:
- Context providers for cross-cutting concerns (cart, auth, theme)
- Custom hooks for encapsulating business logic (useAuth, useCart, useToast)
- Component composition with shadcn/ui patterns
- Optimistic UI updates with React Query mutations

### Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js

**API Design**: RESTful API with JSON payloads
- `/api/products` - Product catalog operations
- `/api/orders` - Order creation and retrieval
- `/api/user` - Authentication and user management
- `/api/payment/*` - Payment processing endpoints

**Session Management**: Express-session with PostgreSQL-backed session store (connect-pg-simple)
- Cookie-based sessions with 30-day expiration
- Trust proxy configuration for deployment behind reverse proxies

**Authentication**: Passport.js with LocalStrategy
- Scrypt-based password hashing with random salts
- Username/password authentication
- Optional authentication (guests can checkout without accounts)

**Data Access**: Drizzle ORM for type-safe database operations
- Schema-first approach with shared TypeScript types
- Neon serverless PostgreSQL driver with WebSocket support

**Build System**: 
- Vite for frontend bundling
- esbuild for backend compilation
- Single production build script generates both client and server bundles

### Database Schema

**PostgreSQL Database** (required - enforced at startup)

**Tables**:
- `products` - Product catalog (id, name, description, price, category, image, stock)
- `users` - Customer accounts (id, username, password)
- `orders` - Order records with embedded JSON (customerInfo, items, payment status)
- `admins` - Admin user accounts (id, email, password)
- `session` - Session storage (auto-created by connect-pg-simple)

**Design Decisions**:
- JSONB columns for flexible nested data (customer info, cart items, PayU responses)
- UUID primary keys for products, orders, admins
- Auto-incrementing integer IDs for users
- Decimal type for monetary values to prevent floating-point errors

### Payment Integration

**PayU Payment Gateway** (India-focused)

**Implementation**:
- Server-side hash generation using merchant key and salt
- Redirect-based payment flow (user redirected to PayU, returns via callback)
- Hash verification on payment response to prevent tampering
- Support for multiple payment methods (cards, UPI, net banking, wallets)

**Payment Flow**:
1. Order created with "pending" status
2. Payment form generated with hash
3. User redirected to PayU
4. PayU processes payment and redirects back
5. Server verifies hash and updates order status
6. User redirected to success/failure page

**Security**: 
- Transaction IDs generated server-side
- Hash-based request signing
- Response verification prevents tampering

### Email Service

**Resend API Integration** (optional)

**Purpose**: Send transactional emails (order confirmations, payment receipts)

**Graceful Degradation**: Service disabled if API key not configured - application continues functioning without email capability

**Email Types**:
- Order confirmation emails with item details
- Payment success notifications

## External Dependencies

### Third-Party Services

**PayU Payment Gateway**:
- Merchant account required (TEST and LIVE modes)
- Environment variables: `PAYU_MERCHANT_KEY`, `PAYU_MERCHANT_SALT`, `PAYU_MODE`
- Payment processing for Indian market (INR currency)

**Resend Email Service** (optional):
- Environment variable: `RESEND_API_KEY`
- Transactional email delivery
- Falls back gracefully if not configured

**Neon PostgreSQL**:
- Serverless PostgreSQL with WebSocket support
- Environment variable: `DATABASE_URL`
- Application will not start without database connection

### NPM Dependencies

**Frontend**:
- `react`, `react-dom` - UI framework
- `@tanstack/react-query` - Server state management
- `wouter` - Routing
- `react-hook-form` + `@hookform/resolvers` - Form handling
- `zod` - Schema validation
- `tailwindcss` - Styling
- `@radix-ui/*` - Headless UI components (30+ packages)
- `lucide-react` - Icon library

**Backend**:
- `express` - Web server
- `passport`, `passport-local` - Authentication
- `express-session`, `connect-pg-simple` - Session management
- `drizzle-orm` - Database ORM
- `@neondatabase/serverless` - PostgreSQL driver
- `resend` - Email service
- `zod` - Runtime validation

**Build Tools**:
- `vite` - Frontend bundler
- `esbuild` - Backend compiler
- `drizzle-kit` - Database migrations
- `tsx` - TypeScript execution for development

### Environment Configuration

**Required**:
- `DATABASE_URL` - PostgreSQL connection string

**Payment Gateway** (required for checkout):
- `PAYU_MERCHANT_KEY`
- `PAYU_MERCHANT_SALT`
- `PAYU_MODE` (TEST or LIVE)

**Optional**:
- `SESSION_SECRET` - Session encryption key (auto-generated if missing)
- `RESEND_API_KEY` - Email service API key
- `EMAIL_FROM` - Sender email address (defaults to noreply@atlanticweizard.com)
- `NODE_ENV` - Environment mode (development/production)
- `VITE_HOST`, `VITE_PORT` - Development server configuration

### Deployment Architecture

**Production Stack**:
- Node.js 20.x runtime
- PostgreSQL 14+ database
- Nginx reverse proxy (recommended)
- PM2 process manager (recommended)
- SSL/TLS certificates (Let's Encrypt via certbot)

**Build Output**:
- `dist/public/` - Compiled frontend assets
- `dist/index.js` - Compiled backend server

**Startup Checks**:
- Database connection validation on launch
- Automatic session table creation
- Environment variable validation with helpful error messages

## Recent Changes

### November 19, 2025 - Replit Setup Complete

**Initial Setup**:
- ✅ Installed all npm dependencies
- ✅ Configured PostgreSQL database with Drizzle ORM
- ✅ Pushed database schema and seeded initial data
- ✅ Configured PayU payment gateway credentials (TEST mode)
- ✅ Created `.gitignore` file for proper version control
- ✅ Set up development workflow on port 5000
- ✅ Configured deployment settings (autoscale with build)

**Environment Configuration**:
- DATABASE_URL: Connected to Replit PostgreSQL
- SESSION_SECRET: Auto-configured
- PAYU_MERCHANT_KEY: Configured for TEST mode
- PAYU_MERCHANT_SALT: Configured for TEST mode
- PAYU_MODE: Set to TEST
- RESEND_API_KEY: Not configured (email service disabled, optional)

**Application Status**:
- Frontend: Running on port 5000 with Vite HMR
- Backend: Express.js API integrated on same port
- Database: Seeded with luxury products and admin account
- Admin credentials: admin@atlantic.com / admin123 (change immediately)

**Key Features Working**:
- Product catalog browsing
- Shopping cart functionality
- PayU payment gateway integration
- User authentication and registration
- Admin panel access
- Dark/light theme support

### November 19, 2025 - Critical Payment Bug Fix

**Problem Identified**:
The payment checkout was failing with "Payment URL is missing" error. Root cause: The `apiRequest()` utility function returns a `Response` object, but multiple places in the codebase were treating it as if it returned already-parsed JSON data.

**Files Fixed**:
1. `client/src/lib/cart-context.tsx` - Cart validation was calling `.map()` on Response instead of parsed products array
2. `client/src/pages/checkout.tsx` - Payment mutation wasn't parsing JSON response before validation
3. `client/src/pages/admin.tsx` - Admin mutations weren't parsing JSON responses

**Technical Details**:
- Added `await response.json()` after all `apiRequest()` calls that need the response data
- Fixed TypeScript type errors where Response was incorrectly typed as data
- Verified all apiRequest usages across the entire codebase

**Result**: Payment flow now works end-to-end correctly. Users can add items to cart, proceed to checkout, and be redirected to PayU payment gateway without errors.