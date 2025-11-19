# Atlantic Weizard

**A luxury e-commerce platform for high-end men's fashion and accessories.**

---

## Overview

Atlantic Weizard is a full-stack web application showcasing premium products including cashmere overcoats, silk shirts, tailored blazers, leather shoes, luxury watches, and fine accessories.

### Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js, TypeScript  
- **Database**: PostgreSQL (required)
- **Payment**: PayU Payment Gateway (India)
- **Email**: Resend
- **Currency**: Indian Rupee (₹)

### Key Features

- Product catalog with categories
- Shopping cart and checkout
- PayU payment integration (multiple payment methods)
- Customer authentication (optional guest checkout)
- Order history for registered users
- Admin panel for product and order management
- Email notifications (order confirmation, payment success)
- Dark/light theme support

---

## Quick Start

### Prerequisites

- **Node.js**: 20.x or higher
- **PostgreSQL**: 14 or higher
- **PayU Account**: For payment gateway
- **Resend Account**: For email service (optional)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/yourusername/atlantic-weizard.git
cd atlantic-weizard

# 2. Install dependencies
npm install

# 3. Configure environment variables
nano .env
```

**Minimal `.env` configuration:**

```env
# Database (REQUIRED - no fallback)
DATABASE_URL=postgresql://user:password@localhost:5432/atlantic_weizard

# PayU Payment Gateway (REQUIRED)
PAYU_MERCHANT_KEY=your_merchant_key
PAYU_MERCHANT_SALT=your_merchant_salt
PAYU_MODE=TEST  # or LIVE for production

# Email Service (OPTIONAL)
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=noreply@yourdomain.com

# Security (REQUIRED)
SESSION_SECRET=your_random_secret_here

# Environment
NODE_ENV=production
PORT=5000
```

```bash
# 4. Setup database
npm run db:push    # Create tables
npm run db:seed    # Seed initial data

# 5. Build and start
npm run build
npm start
```

**Access the application:**
- **Website**: http://localhost:5000
- **Admin Panel**: http://localhost:5000/admin
  - Email: `admin@atlantic.com`
  - Password: `admin123` (⚠️ change immediately)

---

## Deployment

**For complete step-by-step deployment instructions**, including:
- Server setup (VPS, AWS EC2, etc.)
- PostgreSQL configuration
- PayU payment gateway integration
- Email service setup (Resend)
- Nginx reverse proxy
- SSL certificates
- Process management (PM2/systemd)
- Security best practices
- Troubleshooting

**👉 See [DEPLOYMENT.md](DEPLOYMENT.md)**

---

## Project Structure

```
atlantic-weizard/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   └── lib/         # Utilities and context
│   └── public/          # Static assets
├── server/              # Express.js backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API endpoints
│   ├── storage-pg.ts    # PostgreSQL storage layer
│   ├── auth.ts          # Authentication
│   ├── payu.ts          # Payment gateway
│   └── email.ts         # Email service
├── shared/              # Shared TypeScript schemas
│   └── schema.ts        # Database schema (Drizzle)
└── DEPLOYMENT.md        # Complete deployment guide
```

---

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `POST /api/payment/initiate` - Initiate payment
- `GET /api/orders` - Get all orders (admin)
- `GET /api/orders/my` - Get user's orders (authenticated)

### Authentication
- `POST /api/register` - Register customer
- `POST /api/login` - Login customer
- `POST /api/logout` - Logout customer
- `GET /api/user` - Get current user
- `POST /api/admin/login` - Admin login

---

## Development

```bash
# Start development server
npm run dev

# TypeScript type checking
npm run check

# Push database schema changes
npm run db:push

# Seed database
npm run db:seed

# Build for production
npm run build

# Start production server
npm start
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | **Yes** | PostgreSQL connection string |
| `PAYU_MERCHANT_KEY` | **Yes** | PayU merchant key |
| `PAYU_MERCHANT_SALT` | **Yes** | PayU merchant salt |
| `PAYU_MODE` | **Yes** | PayU mode (TEST or LIVE) |
| `SESSION_SECRET` | **Yes** | Session encryption secret |
| `RESEND_API_KEY` | No | Resend email API key |
| `EMAIL_FROM` | No | Email sender address |
| `NODE_ENV` | No | Environment (development/production) |
| `PORT` | No | Application port (default: 5000) |

---

## Security Notes

⚠️ **Important Security Reminders:**

1. **Change default admin password immediately**
   - Default credentials are for initial setup only
   - Access admin panel and change password

2. **Use strong passwords**
   - Database user password
   - Session secret (use `openssl rand -base64 32`)

3. **Never commit `.env` to version control**
   - `.env` contains sensitive credentials
   - Ensure `.env` is in `.gitignore`

4. **Use HTTPS in production**
   - Configure SSL certificate (Let's Encrypt)
   - See [DEPLOYMENT.md](DEPLOYMENT.md) for SSL setup

5. **Configure firewall**
   - Only expose necessary ports (80, 443)
   - Block PostgreSQL port from internet

---

## License

MIT

---

## Support

For detailed deployment instructions, troubleshooting, and best practices, see **[DEPLOYMENT.md](DEPLOYMENT.md)**.

For issues or questions:
- Review application logs
- Check database connectivity
- Verify environment variables
- Test PayU credentials in TEST mode first

---

**Built with care for luxury e-commerce** ✨
