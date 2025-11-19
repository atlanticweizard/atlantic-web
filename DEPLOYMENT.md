# Atlantic Weizard - Complete Deployment Guide

**Comprehensive step-by-step guide for deploying Atlantic Weizard luxury e-commerce platform on any private server.**

---

## Table of Contents

1. [Overview & Architecture](#overview--architecture)
2. [Prerequisites](#prerequisites)
3. [Server Setup](#server-setup)
4. [Application Installation](#application-installation)
5. [PostgreSQL Database Setup](#postgresql-database-setup)
6. [Environment Configuration](#environment-configuration)
7. [Database Initialization](#database-initialization)
8. [PayU Payment Gateway Integration](#payu-payment-gateway-integration)
9. [Email Service Setup (Resend)](#email-service-setup-resend)
10. [Building for Production](#building-for-production)
11. [Process Management](#process-management)
12. [Nginx Reverse Proxy](#nginx-reverse-proxy)
13. [SSL Certificate Setup](#ssl-certificate-setup)
14. [Domain Configuration](#domain-configuration)
15. [Monitoring & Logging](#monitoring--logging)
16. [Troubleshooting](#troubleshooting)
17. [Security Best Practices](#security-best-practices)
18. [Updating the Application](#updating-the-application)
19. [Backup & Recovery](#backup--recovery)
20. [Appendices](#appendices)

---

## Overview & Architecture

**Atlantic Weizard** is a luxury men's fashion e-commerce platform featuring:

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (required)
- **Payment Gateway**: PayU (India)
- **Email Service**: Resend
- **Session Management**: PostgreSQL-backed sessions
- **Authentication**: Passport.js with scrypt password hashing

### Key Features
- Product catalog with categories
- Shopping cart and checkout
- PayU payment integration (Cards, UPI, Net Banking, Wallets)
- Customer authentication (optional - guests can also checkout)
- Order history for registered users
- Admin panel for product and order management
- Email notifications (order confirmation, payment success)
- Dark/light theme support
- Indian Rupee (₹) currency

### Architecture
- **Single-server deployment**: Frontend and backend run on same server
- **Port 5000**: Application serves both React frontend and Express API
- **PostgreSQL required**: No in-memory fallback (data persistence enforced)
- **Reverse proxy ready**: Nginx recommended for production

---

## Prerequisites

### Required Software
- **Linux Server**: Ubuntu 22.04 LTS or similar (CentOS, Debian)
- **Node.js**: Version 20.x or higher
- **PostgreSQL**: Version 14 or higher
- **Git**: For cloning repository
- **Nginx**: For reverse proxy (recommended)
- **Domain Name**: Configured DNS pointing to your server

### Required Accounts
- **PayU Account**: For payment gateway (https://payu.in)
- **Resend Account**: For email service (https://resend.com)

### Server Resources (Minimum)
- **CPU**: 2 cores
- **RAM**: 2GB minimum (4GB recommended)
- **Storage**: 20GB available
- **Network**: Public IP address, ports 80/443/5000 accessible

---

## Server Setup

### 1. Initial Server Configuration

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential

# Configure firewall (UFW on Ubuntu)
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw allow 5000    # Node.js app (temporary - will proxy via Nginx)
sudo ufw enable
```

### 2. Create Application User (Optional but Recommended)

```bash
# Create dedicated user for the application
sudo adduser atlantic --disabled-password --gecos ""

# Add to sudo group if needed for deployment tasks
sudo usermod -aG sudo atlantic

# Switch to application user
sudo su - atlantic
```

---

## Application Installation

### 1. Install Node.js 20.x

```bash
# Add NodeSource repository for Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js and npm
sudo apt install -y nodejs

# Verify installation
node --version   # Should show v20.x.x
npm --version    # Should show 10.x.x
```

### 2. Clone Repository

```bash
# Navigate to home directory
cd ~

# Clone the repository
git clone https://github.com/yourusername/atlantic-weizard.git
cd atlantic-weizard

# Or upload files via SCP if not using git
# scp -r atlantic-weizard/ user@your-server:/home/user/
```

### 3. Install Dependencies

```bash
# Install all npm packages
npm install

# This installs ~486 packages
# Takes 1-2 minutes depending on server speed
```

---

## PostgreSQL Database Setup

### 1. Install PostgreSQL

```bash
# Install PostgreSQL 14
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify PostgreSQL is running
sudo systemctl status postgresql
```

### 2. Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# Inside PostgreSQL prompt, execute:
```

```sql
-- Create database
CREATE DATABASE atlantic_weizard;

-- Create user with secure password
CREATE USER atlantic_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE atlantic_weizard TO atlantic_user;

-- Grant schema privileges (PostgreSQL 15+)
\c atlantic_weizard
GRANT ALL ON SCHEMA public TO atlantic_user;

-- Exit PostgreSQL
\q
```

### 3. Configure PostgreSQL Access

```bash
# Edit pg_hba.conf to allow local password authentication
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Add this line after other local entries:
# local   atlantic_weizard    atlantic_user                md5

# Restart PostgreSQL to apply changes
sudo systemctl restart postgresql
```

### 4. Test Database Connection

```bash
# Test connection from command line
psql -U atlantic_user -d atlantic_weizard -h localhost

# Enter the password you set above
# If successful, you'll see the PostgreSQL prompt:
# atlantic_weizard=>

# Exit with \q
```

---

## Environment Configuration

### 1. Create Environment File

```bash
# Navigate to application directory
cd ~/atlantic-weizard

# Create .env file (there's no .env.example, so create from scratch)
nano .env
```

### 2. Configure Environment Variables

**Copy this complete configuration and customize:**

```env
# ===========================================
# DATABASE CONFIGURATION (REQUIRED)
# ===========================================
DATABASE_URL=postgresql://atlantic_user:your_secure_password_here@localhost:5432/atlantic_weizard

# ===========================================
# PAYU PAYMENT GATEWAY (REQUIRED)
# ===========================================
# For testing, use these TEST credentials:
PAYU_MERCHANT_KEY=cLHbnq
PAYU_MERCHANT_SALT=gAATiDecGQBQbSmQnl2yViES9dsEI050
PAYU_MODE=TEST

# For production, replace with your LIVE credentials:
# PAYU_MERCHANT_KEY=your_live_merchant_key
# PAYU_MERCHANT_SALT=your_live_merchant_salt
# PAYU_MODE=LIVE

# ===========================================
# EMAIL SERVICE (OPTIONAL - Resend)
# ===========================================
# Sign up at https://resend.com to get API key
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@yourdomain.com

# ===========================================
# SESSION & SECURITY
# ===========================================
# Generate random secret with: openssl rand -base64 32
SESSION_SECRET=your_random_session_secret_here

# ===========================================
# APPLICATION SETTINGS
# ===========================================
NODE_ENV=production
PORT=5000

# ===========================================
# VITE CONFIGURATION (OPTIONAL)
# ===========================================
# Only needed if you want custom host/port for development
# VITE_HOST=0.0.0.0
# VITE_PORT=5000
# VITE_HMR_CLIENT_PORT=443
```

### 3. Generate Secure Session Secret

```bash
# Generate a random session secret
openssl rand -base64 32

# Copy the output and paste it as SESSION_SECRET in .env
```

### 4. Secure .env File

```bash
# Set proper permissions (readable only by owner)
chmod 600 .env

# Verify permissions
ls -l .env
# Should show: -rw------- 1 user user
```

---

## Database Initialization

### 1. Push Database Schema

This creates all necessary tables (products, orders, users, admins, sessions):

```bash
cd ~/atlantic-weizard
npm run db:push
```

**Expected output:**
```
✓ Pulling schema from database...
✓ Changes applied
```

### 2. Seed Initial Data

This adds 9 luxury products and admin account:

```bash
npm run db:seed
```

**Expected output:**
```
🌱 Seeding database...
📦 Inserting products...
✅ Products seeded successfully
👤 Creating admin account...
✅ Admin created successfully
```

### 3. Verify Database Setup

```bash
# Connect to database
psql -U atlantic_user -d atlantic_weizard -h localhost

# List tables
\dt

# Check products
SELECT name, price, category FROM products;

# Check admin
SELECT email FROM admins;

# Exit
\q
```

**You should see:**
- 9 products (cashmere overcoats, silk shirts, blazers, shoes, watches, etc.)
- 1 admin account (admin@atlantic.com)

---

## PayU Payment Gateway Integration

### Test Mode Setup (For Development/Testing)

**Already configured in .env** with test credentials:
```env
PAYU_MERCHANT_KEY=cLHbnq
PAYU_MERCHANT_SALT=gAATiDecGQBQbSmQnl2yViES9dsEI050
PAYU_MODE=TEST
```

- **Test URL**: https://test.payu.in/_payment
- **No real money charged**
- **Test cards available** in PayU documentation

### Live Mode Setup (For Production)

#### 1. Sign Up for PayU

1. Visit https://payu.in
2. Click "Get Started" / "Sign Up"
3. Complete business verification
4. Wait for approval (1-3 business days)

#### 2. Get Merchant Credentials

1. Login to PayU Dashboard
2. Navigate to **Settings → API Keys**
3. Copy your **Merchant Key** (similar to: ABC123XYZ)
4. Copy your **Merchant Salt** (similar to: aBcD1234...)

#### 3. Update Environment Variables

```bash
nano .env
```

Update these lines:
```env
PAYU_MERCHANT_KEY=your_actual_live_merchant_key
PAYU_MERCHANT_SALT=your_actual_live_merchant_salt
PAYU_MODE=LIVE
```

#### 4. Configure Callback URLs

PayU will automatically use these callback URLs:
- **Success**: `https://yourdomain.com/api/payment/success`
- **Failure**: `https://yourdomain.com/api/payment/failure`

**Important**: These URLs must be publicly accessible from PayU's servers.

#### 5. Test Payment Flow

1. Start application: `npm start`
2. Place a test order
3. Check admin panel `/admin` for order status
4. Verify payment appears in PayU dashboard

### Payment Methods Supported

- **Credit/Debit Cards**: Visa, Mastercard, Amex, RuPay
- **UPI**: Google Pay, PhonePe, Paytm
- **Net Banking**: 50+ banks
- **Wallets**: Paytm, Mobikwik, Freecharge
- **EMI Options**: Available for cards

---

## Email Service Setup (Resend)

### 1. Sign Up for Resend

1. Visit https://resend.com
2. Create account with your email
3. Verify your email address

### 2. Get API Key

1. Login to Resend Dashboard
2. Navigate to **API Keys** section
3. Click **Create API Key**
4. Name it (e.g., "Atlantic Weizard Production")
5. Copy the API key (starts with `re_`)

### 3. Verify Domain

**Important**: Emails will only send if your domain is verified.

1. In Resend Dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain: `yourdomain.com`
4. Resend will provide DNS records to add
5. Add these records to your DNS provider:
   - **TXT record** for verification
   - **CNAME records** for DKIM
6. Click **Verify** in Resend dashboard
7. Wait for verification (usually 5-15 minutes)

### 4. Update Environment Variables

```bash
nano .env
```

Add these lines:
```env
RESEND_API_KEY=re_your_actual_api_key_here
EMAIL_FROM=noreply@yourdomain.com
```

**Note**: `EMAIL_FROM` must use your verified domain.

### 5. Test Email Service

```bash
# Start application and check logs
npm start

# Look for this message:
# ✅ Email service enabled (Resend)

# If you see warning instead, check API key and domain verification
```

### 6. Email Notifications

The application sends emails for:
- **Order Confirmation**: When order is created
- **Payment Success**: When payment is successful
- **Payment Failure**: When payment fails

**Graceful Degradation**: If email service is not configured, the application will continue working but skip sending emails (no errors thrown).

---

## Building for Production

### 1. Build Application

```bash
cd ~/atlantic-weizard

# Build frontend (React + Vite) and backend (Express)
npm run build
```

**This creates:**
- `dist/public/` - Frontend static files
- `dist/index.js` - Backend server bundle

**Expected output:**
```
vite v5.x.x building for production...
✓ built in 15s
Build complete!
```

### 2. Test Production Build

```bash
# Start production server
npm start

# You should see:
# 🔍 Connecting to PostgreSQL...
# ✅ PostgreSQL storage initialized
# serving on port 5000
```

### 3. Test Application

```bash
# From server terminal
curl http://localhost:5000

# Should return HTML content

# Test API endpoint
curl http://localhost:5000/api/products

# Should return JSON array of products
```

---

## Process Management

Keep the application running 24/7 using a process manager.

### Option 1: PM2 (Recommended)

PM2 is a production-grade process manager with auto-restart, logging, and monitoring.

#### Install PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

#### Start Application

```bash
cd ~/atlantic-weizard

# Start application with PM2
pm2 start npm --name "atlantic-weizard" -- start

# Or start the built file directly:
pm2 start dist/index.js --name "atlantic-weizard"
```

#### Configure Auto-Restart on Boot

```bash
# Save PM2 process list
pm2 save

# Generate startup script
pm2 startup

# PM2 will output a command to run, execute it
# Example: sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

#### Useful PM2 Commands

```bash
# Check status
pm2 status

# View logs (live)
pm2 logs atlantic-weizard

# View logs (last 100 lines)
pm2 logs atlantic-weizard --lines 100

# Restart application
pm2 restart atlantic-weizard

# Stop application
pm2 stop atlantic-weizard

# Delete from PM2
pm2 delete atlantic-weizard

# Monitor resources
pm2 monit
```

### Option 2: systemd (Alternative)

systemd is the native Linux service manager.

#### Create Service File

```bash
sudo nano /etc/systemd/system/atlantic-weizard.service
```

**Paste this configuration:**

```ini
[Unit]
Description=Atlantic Weizard E-commerce Platform
After=network.target postgresql.service

[Service]
Type=simple
User=atlantic
WorkingDirectory=/home/atlantic/atlantic-weizard
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### Enable and Start Service

```bash
# Reload systemd daemon
sudo systemctl daemon-reload

# Enable service (start on boot)
sudo systemctl enable atlantic-weizard

# Start service
sudo systemctl start atlantic-weizard

# Check status
sudo systemctl status atlantic-weizard
```

#### Useful systemd Commands

```bash
# View logs (live)
sudo journalctl -u atlantic-weizard -f

# View logs (last 100 lines)
sudo journalctl -u atlantic-weizard -n 100

# Restart service
sudo systemctl restart atlantic-weizard

# Stop service
sudo systemctl stop atlantic-weizard

# Disable service
sudo systemctl disable atlantic-weizard
```

---

## Nginx Reverse Proxy

Set up Nginx as a reverse proxy for better performance and SSL support.

### 1. Install Nginx

```bash
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify installation
nginx -v
```

### 2. Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/atlantic-weizard
```

**Paste this configuration:**

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Standard proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Prevent caching issues
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Logging
    access_log /var/log/nginx/atlantic-weizard.access.log;
    error_log /var/log/nginx/atlantic-weizard.error.log;
}
```

### 3. Enable Site

```bash
# Create symlink to enable site
sudo ln -s /etc/nginx/sites-available/atlantic-weizard /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 4. Update Firewall

```bash
# Allow Nginx through firewall
sudo ufw allow 'Nginx Full'

# You can now close direct access to port 5000 (optional)
sudo ufw delete allow 5000
```

---

## SSL Certificate Setup

Secure your site with HTTPS using Let's Encrypt (free SSL certificates).

### 1. Install Certbot

```bash
# Install Certbot for Nginx
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Obtain SSL Certificate

```bash
# Get certificate and auto-configure Nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Enter email address
# - Agree to terms of service
# - Choose redirect option (recommended: redirect HTTP to HTTPS)
```

**Certbot will automatically:**
- Obtain SSL certificate
- Configure Nginx for HTTPS
- Set up auto-renewal

### 3. Verify SSL Certificate

```bash
# Test certificate renewal (dry run)
sudo certbot renew --dry-run

# Check certificate status
sudo certbot certificates
```

### 4. Auto-Renewal

Certbot automatically creates a systemd timer for renewal.

```bash
# Check renewal timer status
sudo systemctl status certbot.timer

# Manually renew if needed
sudo certbot renew
```

**Certificates expire after 90 days** but auto-renewal runs twice daily.

---

## Domain Configuration

### 1. Configure DNS

Point your domain to your server's IP address:

```bash
# Get your server's public IP
curl ifconfig.me
```

**DNS Records to Add (via your DNS provider):**

| Type  | Name            | Value              | TTL  |
|-------|-----------------|-------------------|------|
| A     | @               | YOUR_SERVER_IP    | 3600 |
| A     | www             | YOUR_SERVER_IP    | 3600 |

### 2. Wait for DNS Propagation

```bash
# Check DNS propagation (wait 5-30 minutes)
nslookup yourdomain.com

# Or use online tools:
# https://dnschecker.org
```

### 3. Update Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/atlantic-weizard
```

Replace `server_name` with your actual domain:
```nginx
server_name yourdomain.com www.yourdomain.com;
```

Reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Monitoring & Logging

### Application Logs

**With PM2:**
```bash
# Live logs
pm2 logs atlantic-weizard

# Last 200 lines
pm2 logs atlantic-weizard --lines 200

# Error logs only
pm2 logs atlantic-weizard --err

# Save logs to file
pm2 logs atlantic-weizard --lines 1000 > ~/app-logs.txt
```

**With systemd:**
```bash
# Live logs
sudo journalctl -u atlantic-weizard -f

# Last 200 lines
sudo journalctl -u atlantic-weizard -n 200

# Logs from today
sudo journalctl -u atlantic-weizard --since today

# Save logs to file
sudo journalctl -u atlantic-weizard -n 1000 > ~/app-logs.txt
```

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/atlantic-weizard.access.log

# Error logs
sudo tail -f /var/log/nginx/atlantic-weizard.error.log

# All Nginx logs
sudo tail -f /var/log/nginx/*.log
```

### PostgreSQL Logs

```bash
# PostgreSQL logs location
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### System Monitoring

```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check running processes
ps aux | grep node

# Check open ports
sudo netstat -tulpn | grep LISTEN
```

---

## Troubleshooting

### Application Won't Start

**Symptom**: `npm start` exits immediately or shows errors.

```bash
# Check Node.js version
node --version  # Must be v20.x or higher

# Check if port 5000 is in use
sudo lsof -i :5000
sudo netstat -tulpn | grep 5000

# Kill process if needed
sudo kill -9 <PID>

# Check environment variables
cat .env

# Look for missing DATABASE_URL
grep DATABASE_URL .env
```

**Common fixes:**
- Ensure DATABASE_URL is set correctly
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify dependencies installed: `npm install`
- Check for syntax errors in .env file

### Database Connection Errors

**Symptom**: "DATABASE_URL is required" or "connection refused"

```bash
# Test database connection
psql -U atlantic_user -d atlantic_weizard -h localhost

# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL if needed
sudo systemctl restart postgresql

# Check pg_hba.conf for authentication settings
sudo cat /etc/postgresql/14/main/pg_hba.conf | grep atlantic

# Check DATABASE_URL format
# Correct: postgresql://user:password@localhost:5432/database
cat .env | grep DATABASE_URL
```

**Common fixes:**
- Verify password in DATABASE_URL matches PostgreSQL user password
- Ensure `md5` authentication in `pg_hba.conf`
- Check database exists: `sudo -u postgres psql -l`

### PayU Payment Errors

**Symptom**: Payment fails or redirects incorrectly

```bash
# Check PayU credentials
cat .env | grep PAYU

# Verify all three are set:
# PAYU_MERCHANT_KEY
# PAYU_MERCHANT_SALT
# PAYU_MODE (TEST or LIVE)

# Check application logs for PayU errors
pm2 logs atlantic-weizard | grep -i payu

# Test payment in TEST mode first
# Set PAYU_MODE=TEST in .env
```

**Common issues:**
- Incorrect merchant key or salt (double-check from PayU dashboard)
- Using TEST credentials in LIVE mode (or vice versa)
- Callback URLs not accessible from PayU servers (check firewall)
- Domain not verified with PayU

### Email Not Sending

**Symptom**: No emails received, but no errors

```bash
# Check email configuration
cat .env | grep -E 'RESEND|EMAIL'

# Verify Resend API key format (starts with re_)
echo $RESEND_API_KEY

# Check application startup logs
pm2 logs atlantic-weizard | grep -i email

# Should see: "✅ Email service enabled (Resend)"
# If warning appears, email service is disabled
```

**Common fixes:**
- Verify domain in Resend dashboard
- Check API key is correct
- Ensure EMAIL_FROM uses verified domain
- Test API key directly via Resend API

### SSL Certificate Issues

**Symptom**: HTTPS not working or certificate errors

```bash
# Check certificate status
sudo certbot certificates

# Test renewal
sudo certbot renew --dry-run

# Check Nginx SSL configuration
sudo nginx -t

# View Nginx error log
sudo tail -f /var/log/nginx/error.log

# Manually renew certificate
sudo certbot renew --force-renewal

# Restart Nginx
sudo systemctl restart nginx
```

### Website Not Loading

**Symptom**: Domain doesn't resolve or shows Nginx default page

```bash
# Check DNS propagation
nslookup yourdomain.com
dig yourdomain.com

# Check Nginx configuration
sudo nginx -t

# Check if site is enabled
ls -l /etc/nginx/sites-enabled/

# Check Nginx is running
sudo systemctl status nginx

# View Nginx access log
sudo tail -f /var/log/nginx/access.log

# View Nginx error log
sudo tail -f /var/log/nginx/error.log
```

### PM2 Not Starting on Boot

**Symptom**: Application stops after server reboot

```bash
# Check PM2 startup configuration
pm2 startup

# Run the command it outputs (if not done before)

# Save PM2 process list
pm2 save

# Check PM2 status after reboot
pm2 status

# Manually start if needed
pm2 resurrect
```

---

## Security Best Practices

### 1. Change Default Admin Credentials

**CRITICAL**: Change admin password immediately after deployment.

```bash
# Access admin panel at: https://yourdomain.com/admin
# Default credentials:
# Email: admin@atlantic.com
# Password: admin123

# Change via database:
psql -U atlantic_user -d atlantic_weizard -h localhost

# Update password (use scrypt hashed password):
# You'll need to hash the password manually or via app
```

**Better**: Implement password change feature in admin panel.

### 2. Secure PostgreSQL

```bash
# Use strong database password
# Example: openssl rand -base64 24

# Restrict PostgreSQL to localhost only
# In pg_hba.conf, use "127.0.0.1" not "0.0.0.0"

# Never expose PostgreSQL port to internet
sudo ufw deny 5432
```

### 3. Protect .env File

```bash
# Ensure .env is not readable by others
chmod 600 .env

# Never commit .env to git
echo ".env" >> .gitignore

# Verify .env is in .gitignore
git check-ignore .env
```

### 4. Use Strong Session Secret

```bash
# Generate strong random session secret
openssl rand -base64 32

# Update SESSION_SECRET in .env with generated value
```

### 5. Configure Firewall

```bash
# Only allow necessary ports
sudo ufw allow 22      # SSH (change default port for extra security)
sudo ufw allow 80      # HTTP (Nginx)
sudo ufw allow 443     # HTTPS (Nginx)

# Deny all other incoming traffic
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Enable firewall
sudo ufw enable

# Check firewall status
sudo ufw status verbose
```

### 6. Disable SSH Password Authentication

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Set these values:
# PasswordAuthentication no
# PubkeyAuthentication yes
# PermitRootLogin no

# Restart SSH
sudo systemctl restart sshd
```

**Note**: Ensure you have SSH key access before disabling password auth!

### 7. Regular Security Updates

```bash
# Update system packages weekly
sudo apt update && sudo apt upgrade -y

# Update npm packages monthly
cd ~/atlantic-weizard
npm update

# Rebuild after updates
npm run build
pm2 restart atlantic-weizard
```

### 8. Enable Nginx Security Headers

Already included in Nginx config:
- `X-Frame-Options`: Prevent clickjacking
- `X-Content-Type-Options`: Prevent MIME sniffing
- `X-XSS-Protection`: XSS protection

### 9. Setup fail2ban (SSH Protection)

```bash
# Install fail2ban
sudo apt install -y fail2ban

# Create local config
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Enable SSH protection
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Check status
sudo fail2ban-client status sshd
```

### 10. Monitor Logs Regularly

```bash
# Check for suspicious activity in logs
sudo tail -f /var/log/auth.log        # SSH attempts
sudo tail -f /var/log/nginx/access.log # HTTP requests
pm2 logs atlantic-weizard              # Application logs
```

---

## Updating the Application

### Standard Update Process

```bash
# 1. Navigate to application directory
cd ~/atlantic-weizard

# 2. Pull latest code from git
git pull origin main

# 3. Install any new dependencies
npm install

# 4. Run database migrations (if any)
npm run db:push

# 5. Rebuild application
npm run build

# 6. Restart application
pm2 restart atlantic-weizard

# Or with systemd:
sudo systemctl restart atlantic-weizard
```

### Update with Downtime

For major updates requiring downtime:

```bash
# 1. Create maintenance page (optional)
sudo nano /var/www/maintenance.html

# 2. Configure Nginx to show maintenance page
sudo nano /etc/nginx/sites-available/atlantic-weizard

# Add before location /:
# location / {
#     return 503;
# }
# error_page 503 /maintenance.html;
# location = /maintenance.html {
#     root /var/www;
# }

# 3. Reload Nginx
sudo systemctl reload nginx

# 4. Stop application
pm2 stop atlantic-weizard

# 5. Backup database
pg_dump -U atlantic_user -d atlantic_weizard -h localhost > ~/backup_$(date +%Y%m%d).sql

# 6. Update code
git pull origin main
npm install
npm run db:push
npm run build

# 7. Start application
pm2 start atlantic-weizard

# 8. Remove maintenance mode
# (Remove maintenance configuration from Nginx)
sudo systemctl reload nginx
```

### Rollback Process

If update fails:

```bash
# 1. Stop application
pm2 stop atlantic-weizard

# 2. Restore previous version
git reset --hard <previous_commit_hash>

# 3. Restore database (if schema changed)
psql -U atlantic_user -d atlantic_weizard -h localhost < ~/backup_20250119.sql

# 4. Rebuild
npm install
npm run build

# 5. Restart
pm2 restart atlantic-weizard
```

---

## Backup & Recovery

### Database Backup

#### Automated Daily Backups

Create backup script:

```bash
nano ~/backup-database.sh
```

**Paste this script:**

```bash
#!/bin/bash

BACKUP_DIR="$HOME/backups"
DB_NAME="atlantic_weizard"
DB_USER="atlantic_user"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/atlantic_weizard_$DATE.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
pg_dump -U $DB_USER -d $DB_NAME -h localhost > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup created: $BACKUP_FILE.gz"
```

Make executable and schedule:

```bash
# Make executable
chmod +x ~/backup-database.sh

# Add to crontab (run daily at 2 AM)
crontab -e

# Add this line:
0 2 * * * /home/atlantic/backup-database.sh >> /home/atlantic/backup.log 2>&1
```

#### Manual Backup

```bash
# Create backup directory
mkdir -p ~/backups

# Backup database
pg_dump -U atlantic_user -d atlantic_weizard -h localhost > ~/backups/backup_$(date +%Y%m%d).sql

# Compress backup
gzip ~/backups/backup_$(date +%Y%m%d).sql
```

### Database Restore

```bash
# Restore from backup
psql -U atlantic_user -d atlantic_weizard -h localhost < ~/backups/backup_20250119.sql

# Or from compressed backup
gunzip -c ~/backups/backup_20250119.sql.gz | psql -U atlantic_user -d atlantic_weizard -h localhost
```

### Application Files Backup

```bash
# Backup entire application directory
tar -czf ~/backups/atlantic-weizard_$(date +%Y%m%d).tar.gz ~/atlantic-weizard

# Exclude node_modules and dist
tar -czf ~/backups/atlantic-weizard_$(date +%Y%m%d).tar.gz \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.git' \
  ~/atlantic-weizard
```

### Remote Backup (Recommended)

```bash
# Copy backups to remote server via rsync
rsync -avz ~/backups/ user@backup-server:/backups/atlantic-weizard/

# Or use cloud storage (AWS S3, Google Cloud, etc.)
# Install AWS CLI: sudo apt install awscli
# Configure: aws configure
# Upload: aws s3 sync ~/backups/ s3://your-bucket/atlantic-weizard/
```

---

## Appendices

### Appendix A: Environment Variables Reference

| Variable              | Required | Default | Description |
|-----------------------|----------|---------|-------------|
| `DATABASE_URL`        | **Yes**  | -       | PostgreSQL connection string |
| `PAYU_MERCHANT_KEY`   | **Yes**  | -       | PayU merchant key |
| `PAYU_MERCHANT_SALT`  | **Yes**  | -       | PayU merchant salt |
| `PAYU_MODE`           | **Yes**  | TEST    | PayU mode (TEST or LIVE) |
| `RESEND_API_KEY`      | No       | -       | Resend email service API key |
| `EMAIL_FROM`          | No       | -       | Email sender address |
| `SESSION_SECRET`      | **Yes**  | -       | Session encryption secret |
| `NODE_ENV`            | No       | development | Environment (production, development) |
| `PORT`                | No       | 5000    | Application port |
| `VITE_HOST`           | No       | 0.0.0.0 | Vite dev server host |
| `VITE_PORT`           | No       | 5000    | Vite dev server port |
| `VITE_HMR_CLIENT_PORT`| No       | 443     | Vite HMR client port |

### Appendix B: Default Admin Credentials

**⚠️ CHANGE IMMEDIATELY AFTER DEPLOYMENT**

- **URL**: `https://yourdomain.com/admin`
- **Email**: `admin@atlantic.com`
- **Password**: `admin123`

### Appendix C: npm Scripts Reference

| Script        | Command                    | Description |
|---------------|----------------------------|-------------|
| `dev`         | `npm run dev`              | Start development server |
| `build`       | `npm run build`            | Build for production |
| `start`       | `npm start`                | Start production server |
| `check`       | `npm run check`            | TypeScript type checking |
| `db:push`     | `npm run db:push`          | Push database schema |
| `db:seed`     | `npm run db:seed`          | Seed database with initial data |
| `db:setup`    | `npm run db:setup`         | Push schema + seed data |

### Appendix D: Port Reference

| Port | Service                | Access |
|------|------------------------|--------|
| 22   | SSH                    | Restricted to your IP |
| 80   | HTTP (Nginx)           | Public |
| 443  | HTTPS (Nginx)          | Public |
| 5000 | Node.js App            | Localhost only (proxied by Nginx) |
| 5432 | PostgreSQL             | Localhost only |

### Appendix E: File Locations

| Path                                | Description |
|-------------------------------------|-------------|
| `~/atlantic-weizard/`               | Application directory |
| `~/atlantic-weizard/.env`           | Environment variables |
| `~/atlantic-weizard/dist/`          | Production build output |
| `/etc/nginx/sites-available/`       | Nginx site configurations |
| `/etc/nginx/sites-enabled/`         | Enabled Nginx sites |
| `/var/log/nginx/`                   | Nginx logs |
| `/var/log/postgresql/`              | PostgreSQL logs |
| `/etc/systemd/system/`              | systemd service files |
| `~/.pm2/logs/`                      | PM2 logs |

### Appendix F: Common Commands Cheat Sheet

```bash
# Application Management (PM2)
pm2 status                           # Check status
pm2 logs atlantic-weizard            # View logs
pm2 restart atlantic-weizard         # Restart app
pm2 stop atlantic-weizard            # Stop app
pm2 start atlantic-weizard           # Start app

# Application Management (systemd)
sudo systemctl status atlantic-weizard
sudo journalctl -u atlantic-weizard -f
sudo systemctl restart atlantic-weizard
sudo systemctl stop atlantic-weizard
sudo systemctl start atlantic-weizard

# Database
psql -U atlantic_user -d atlantic_weizard -h localhost
pg_dump -U atlantic_user -d atlantic_weizard -h localhost > backup.sql
npm run db:push
npm run db:seed

# Nginx
sudo nginx -t                        # Test configuration
sudo systemctl reload nginx          # Reload configuration
sudo systemctl restart nginx         # Restart Nginx
sudo tail -f /var/log/nginx/access.log

# SSL Certificates
sudo certbot renew                   # Renew certificates
sudo certbot certificates            # List certificates
sudo certbot renew --dry-run         # Test renewal

# Git Updates
git pull origin main
npm install
npm run build
pm2 restart atlantic-weizard

# Firewall
sudo ufw status                      # Check firewall
sudo ufw allow 80/tcp                # Allow port
sudo ufw deny 5432/tcp               # Deny port
```

### Appendix G: Design Guidelines

**Visual Treatment:**
- Black void background (#000000)
- White typography
- Gold accents (#D4AF37) for CTAs and highlights

**Typography:**
- Headings: Elegant serif (Playfair Display, Cormorant Garamond)
- Body: Clean sans-serif (Inter, Work Sans)
- Hero headlines: 4rem-6rem, bold serif
- Product names: 1.5rem-2rem, medium weight

**Layout:**
- Max width: 7xl for grids, 4xl for content
- Grid: 3-column desktop, 2-column tablet, 1-column mobile
- Spacing: Tailwind units (4, 8, 12, 16, 24)

**Components:**
- Clean product cards with hover effects
- Side drawer cart (dark background)
- Minimal navigation with gold accents
- Sophisticated form styling

---

## Production Deployment Checklist

Before going live, verify all items:

### Prerequisites
- [ ] Server provisioned (Ubuntu 22.04+ with 2GB+ RAM)
- [ ] Domain name configured and DNS pointing to server IP
- [ ] PayU merchant account created and verified
- [ ] Resend account created for email service

### Installation
- [ ] Node.js 20.x installed (`node --version`)
- [ ] PostgreSQL 14+ installed and running
- [ ] Application code deployed to server
- [ ] Dependencies installed (`npm install`)
- [ ] Nginx installed and configured

### Database
- [ ] PostgreSQL database created
- [ ] Database user created with strong password
- [ ] Database schema pushed (`npm run db:push`)
- [ ] Initial data seeded (`npm run db:seed`)
- [ ] Database connection tested
- [ ] Automated backups configured

### Configuration
- [ ] `.env` file created with all required variables
- [ ] `DATABASE_URL` configured correctly
- [ ] `SESSION_SECRET` set to random value (32+ characters)
- [ ] `.env` file permissions set to 600
- [ ] `.env` added to `.gitignore`

### Payment Gateway
- [ ] PayU merchant key configured
- [ ] PayU merchant salt configured
- [ ] PayU mode set (TEST for staging, LIVE for production)
- [ ] Callback URLs accessible from internet
- [ ] Test payment completed successfully

### Email Service
- [ ] Resend API key obtained
- [ ] Domain verified in Resend dashboard
- [ ] `RESEND_API_KEY` configured in .env
- [ ] `EMAIL_FROM` set to verified domain
- [ ] Test email sent successfully

### Application
- [ ] Application builds successfully (`npm run build`)
- [ ] Production server starts without errors (`npm start`)
- [ ] All API endpoints tested and working
- [ ] Admin panel accessible at `/admin`
- [ ] Products visible in shop
- [ ] Cart functionality working
- [ ] Checkout flow tested

### Process Management
- [ ] PM2 or systemd configured
- [ ] Application auto-starts on boot
- [ ] Application restarts on crash
- [ ] Logs are accessible and rotating

### Web Server
- [ ] Nginx configured as reverse proxy
- [ ] Nginx configuration tested (`nginx -t`)
- [ ] SSL certificate obtained and installed
- [ ] HTTPS working correctly
- [ ] HTTP redirects to HTTPS
- [ ] Security headers configured

### Security
- [ ] Default admin password changed
- [ ] Strong database password used
- [ ] Firewall configured (only ports 22, 80, 443 open)
- [ ] SSH password authentication disabled (key-only)
- [ ] PostgreSQL not exposed to internet
- [ ] Session secret is random and secure
- [ ] fail2ban configured for SSH protection

### Monitoring
- [ ] Application logs accessible
- [ ] Nginx logs accessible
- [ ] Database logs accessible
- [ ] Monitoring/alerting set up (optional)

### Testing
- [ ] Website loads correctly via domain
- [ ] HTTPS certificate valid
- [ ] All pages accessible
- [ ] Product browsing working
- [ ] Add to cart working
- [ ] Checkout flow complete
- [ ] Payment processing working
- [ ] Order confirmation emails sending
- [ ] Admin panel functional
- [ ] Mobile responsive design working

### Documentation
- [ ] Server access documented (IP, SSH key location)
- [ ] Environment variables documented
- [ ] Backup procedure documented
- [ ] Update procedure documented
- [ ] Emergency contacts documented

---

## Support & Resources

### Official Documentation
- **PayU India**: https://docs.payu.in
- **Resend**: https://resend.com/docs
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Nginx**: https://nginx.org/en/docs/
- **PM2**: https://pm2.keymetrics.io/docs/usage/quick-start/
- **Let's Encrypt**: https://letsencrypt.org/docs/

### Useful Resources
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices
- **Nginx Security**: https://nginx.org/en/docs/http/ngx_http_secure_link_module.html
- **PostgreSQL Performance**: https://wiki.postgresql.org/wiki/Performance_Optimization

### Common Issues
For troubleshooting help, refer to the [Troubleshooting](#troubleshooting) section above.

---

**🎉 Deployment Complete!**

Your Atlantic Weizard e-commerce platform is now running in production on your private server with:
- ✅ PostgreSQL database (persistent data)
- ✅ PayU payment gateway integration
- ✅ Email notifications via Resend
- ✅ HTTPS with SSL certificate
- ✅ Professional process management
- ✅ Nginx reverse proxy

**Access your store at**: `https://yourdomain.com`

**Admin panel**: `https://yourdomain.com/admin`

For questions or issues, review this comprehensive guide and check the logs.

---

*Last updated: November 19, 2025*
