
# WorkshopBase - Complete Workshop Management System

WorkshopBase is a comprehensive workshop management system designed to streamline operations for automotive repair shops and service centers. It provides a full suite of tools for managing bookings, customers, jobs, inventory, invoicing, and third-party integrations.

## 🚀 Key Features

### Core Functionality
- **Dashboard**: Real-time overview of workshop performance metrics, upcoming appointments, and alerts
- **Booking Management**: Interactive booking diary with day, week, and month views
- **Job Management**: Track job progress, assign technicians, and monitor time spent
- **Customer Management**: Track customer history, communications, and preferences
- **Vehicle Database**: Store and access detailed vehicle information, service history
- **Inventory Management**: Track parts, stock levels, and supplier information
- **Invoicing System**: Create, send, and track invoices with accounting integrations

### Integrations
- **EzyParts**: Complete integration with Burson's EzyParts online ordering system
- **Email Integration**: Connect email accounts to create bookings from customer emails
- **Communication Hub**: Centralized platform for customer communications via email and SMS
- **Social Media**: Facebook messaging integration for customer communications
- **Accounting**: Xero integration for seamless financial record-keeping

### Technician Features
- **Technician Portal**: Mobile-friendly interface for workshop floor operations
- **Time Tracking**: Track work performed on jobs with start/stop functionality
- **Photo Documentation**: Capture and store vehicle condition and repair photos
- **Parts Requisition**: Request needed parts while working on vehicles

## 📱 User Interfaces

WorkshopBase includes multiple specialized interfaces:
- **Admin Dashboard**: For workshop owners and managers
- **Booking Interface**: For service advisors and reception staff
- **Technician Portal**: For mechanics and service technicians
- **Customer Portal**: For customer self-service (appointments, history, invoices)

## 🔧 Technologies

WorkshopBase is built using modern web technologies:
- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Email Service**: Dedicated Node.js microservice for email processing
- **APIs**: RESTful API architecture for all services

## 💾 Project Structure

```
src/
├── components/           # React components organized by feature
│   ├── booking-diary/    # Booking calendar and management
│   ├── customers/        # Customer management components
│   ├── dashboard/        # Dashboard widgets and visualizations
│   ├── email-integration/# Email connection and processing
│   ├── ezyparts/         # EzyParts integration components
│   ├── inventory/        # Inventory management system
│   ├── invoicing/        # Invoice creation and management
│   ├── jobs/             # Job tracking and management
│   ├── service-reminders/# Service reminder system
│   ├── technician/       # Technician portal components
│   └── ui/               # Reusable UI components and shadcn/ui
├── contexts/             # React context providers
├── hooks/                # Custom React hooks organized by feature
├── integrations/         # Third-party integration code
├── pages/                # Page components and routes
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## 📊 Data Flow

1. **Customer Interaction**: Via phone, email, or social media
2. **Booking Creation**: Through booking diary or automated from email
3. **Job Assignment**: To technicians based on availability and skills
4. **Parts Ordering**: Through inventory system or EzyParts integration
5. **Job Completion**: With documentation and time tracking
6. **Invoicing**: Generated from job data with parts and labor
7. **Payment Processing**: With accounting system integration

## 🌐 Third-Party Integrations

- **EzyParts Integration**: Complete parts ordering workflow:
  - Vehicle search by registration or details
  - Parts selection and inventory checking
  - Quote processing and order submission
  - Order tracking and management

- **Email Integration**: Connect with major email providers:
  - Gmail / Google Workspace
  - Microsoft 365 / Outlook
  - IMAP/SMTP generic providers

- **Social Integration**: Connect with social platforms:
  - Facebook Messenger for business

- **Accounting Integration**: Sync financial data with:
  - Xero for invoicing and payment tracking

## 🔒 Security Features

- Secure OAuth 2.0 authentication
- Role-based access control
- Data encryption for sensitive information
- Regular automated backups
- Audit logs for critical actions

## 🚗 Vehicle Information System

WorkshopBase includes a comprehensive vehicle database with:
- Registration lookup via third-party services
- Complete service history
- Recommended service schedules
- Parts compatibility database
- Digital vehicle inspection records

## 📱 Mobile Responsiveness

The entire system is designed to be fully responsive:
- Desktop: Full-featured management interface
- Tablet: Optimized for service advisors on the move
- Mobile: Essential functions for technicians on the workshop floor

## ⚙️ Setup & Installation

### Prerequisites

- Node.js 18+
- npm 9+
- Supabase account
- EzyParts trade account (for parts ordering functionality)
- Email provider account (for email integration)

### Installation Steps

1. Clone the repository
   ```bash
   git clone https://github.com/workshopbase/main
   cd workshopbase
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys and service credentials
   ```

4. Start development server
   ```bash
   npm run dev
   ```

## 📞 Support

- Technical Support: support@workshopbase.com
- Documentation: https://docs.workshopbase.com
- Community Forum: https://community.workshopbase.com

## 📄 License

Copyright © 2025 WorkshopBase. All rights reserved.
