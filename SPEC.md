# USFinance Banking Application Specification

## Project Overview
- **Project Name**: USFinance
- **Type**: Full-stack banking web application with Node.js backend
- **Core Functionality**: Full-featured banking platform with user registration, account management, admin oversight, and comprehensive transaction tracking
- **Target Users**: US-based banking customers and administrators
- **Stack**: Node.js + Express + SQLite Backend, HTML/CSS/JS Frontend

## UI/UX Specification

### Layout Structure
- **Header**: Top bar with contact info, Logo (USFinance), navigation (Personal, Business, Wealth, Investing), Login/Sign Up buttons
- **Main Content**: Dynamic content area based on current view
- **Footer**: 5-column links, copyright, FDIC badges

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Visual Design

#### Color Palette (Black, White, Green)
- **Primary (Dark Green)**: #0D3B1C
- **Secondary (Green)**: #1B5E3C
- **Accent (Light Green)**: #2E7D4A
- **Light Green**: #E8F5E9
- **White**: #ffffff
- **Light Gray**: #f8f9fa
- **Success**: #28a745
- **Warning**: #ffc107
- **Danger**: #dc3545

#### Typography
- **Font Family**: 'Poppins', sans-serif (headings), 'Open Sans', sans-serif (body)
- **Headings**: H1: 2.5rem, bold; H2: 2rem, semibold; H3: 1.5rem, semibold
- **Body**: 1rem, regular

### Components

#### Navigation Bar
- White background, sticky top
- Logo with green gradient icon
- Dropdown menus for Personal, Business, Wealth, Investing
- Mobile: hamburger menu

#### Cards
- White background
- Border-radius: 16px (lg), 8px (sm)
- Box-shadow: 0 4px 20px rgba(0,0,0,0.08)
- Hover: slight lift effect

#### Forms
- Input fields: Full width, 48px height
- Border: 2px solid #e9ecef
- Focus: Green border
- Labels: Above input, semibold

## Backend Database Schema

### Users Table
- id, email (unique), password (hashed), first_name, last_name, phone, address, city, state, zip_code, is_admin, created_at, updated_at

### Accounts Table
- id, user_id (FK), account_type, account_number (unique), balance, status, id_number, id_front, id_back, created_at, updated_at

### Transactions Table
- id, user_id (FK), account_id (FK), type, amount, description, recipient_account, status, created_at

### Sessions Table
- id, user_id (FK), token (unique), expires_at, created_at

### Admin Logs Table
- id, admin_id (FK), action, target_type, target_id, details, created_at

## Functionality Specification

### Pages/Views

1. **Home Page**: Hero section, 8 service cards, 3 featured cards, CTA section
2. **Content Pages**: Checking, Savings, Credit Cards, Mortgages, Investing (with relevant content from US Bank)
3. **Login Page**: Email/password, remember me
4. **Sign Up Page**: Email/password registration
5. **Account Creation**: 4-step form (Account type, Personal info, Contact, Document upload)
6. **User Dashboard**: Account cards, Quick actions, Transactions table
7. **Admin Dashboard**: Stats, Pending accounts, All transactions, All users, Settings

### Features
- User registration with email/password
- Account creation (Checking, Savings, Investment)
- Account approval workflow (pending → approved/rejected)
- Transaction submission (deposit, withdraw, transfer, bill pay)
- Transaction approval workflow
- Admin dashboard with full oversight
- Session management with tokens
- Full audit logging

### API Endpoints
- POST /api/register
- POST /api/login
- POST /api/logout
- GET /api/session/:token
- POST /api/accounts
- GET /api/accounts
- GET /api/admin/accounts/pending
- POST /api/admin/accounts/:id/approve
- POST /api/admin/accounts/:id/reject
- POST /api/transactions
- GET /api/transactions
- GET /api/admin/transactions
- POST /api/admin/transactions/:id/approve
- POST /api/admin/transactions/:id/reject
- GET /api/admin/users
- GET /api/admin/stats
- GET /api/admin/logs

## Acceptance Criteria

### Visual Checkpoints
- [x] Black, white, green color scheme applied consistently
- [x] Responsive layout works on mobile, tablet, desktop
- [x] All forms have proper styling and validation
- [x] Cards have consistent shadows and rounded corners
- [x] Navigation is accessible on all screen sizes

### Functional Checkpoints
- [x] New users can register with email/password
- [x] Users can create accounts with all required details
- [x] Users can log in and view dashboard
- [x] Users can see their account balances
- [x] Admin can log in with admin@usfinance.com / admin
- [x] Admin can view all users and accounts
- [x] Admin can approve/reject account creations
- [x] Admin can view and manage transactions
- [x] Data persists in SQLite database

### Default Admin Credentials
- Email: admin@usfinance.com
- Password: admin

## Running the Application
```bash
npm install
npm start
```
Server runs on http://localhost:3000
