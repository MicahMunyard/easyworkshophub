
# WorkshopBase - EzyParts Integration

This project implements a complete integration between WorkshopBase and Burson's EzyParts online ordering system, following the EzyParts Integration with Workshop Management Systems Technical Specification v4.1.

## 🚀 Features

- **Vehicle Search**: Search for vehicles by registration number or vehicle details
- **Parts Ordering**: Browse parts, check inventory, and place orders directly from WorkshopBase
- **Quote Management**: Receive, view, and process quotes from EzyParts
- **Order Tracking**: Track the status of orders and handle discrepancies
- **Secure Authentication**: OAuth 2.0 secure token authentication with EzyParts API

## 📂 Project Structure

The project is built using modern web technologies:
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase Edge Functions

```
src/
├── components/
│   ├── ezyparts/           # EzyParts specific components
│   └── layout/             # Layout components
├── contexts/               # React context providers
├── hooks/                  # Custom React hooks
├── pages/                  # Page components
└── routes/                 # Routing configuration
```

## 🔄 EzyParts Integration Flow

1. **Configuration**: Set up EzyParts API credentials
2. **Vehicle Search**: Find vehicles by rego or details
3. **Parts Selection**: Choose parts in EzyParts
4. **Quote Processing**: Retrieve quote data
5. **Inventory Check**: Verify stock availability
6. **Order Submission**: Submit order to EzyParts
7. **Order Confirmation**: Process response

## 🛠 Setup Instructions

### Prerequisites

- Node.js 18+
- npm 9+
- EzyParts Trade Account

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/workshopbase/ezyparts-integration
   cd workshopbase-ezyparts
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start development server
   ```bash
   npm run dev
   ```

## 🔐 Security

- Secure OAuth 2.0 authentication
- Credentials stored via Supabase Secrets
- Web-based, secure integration approach

## 📞 Support

- WorkshopBase: support@workshopbase.com
- EzyParts: ezypartssupport@bapcor.com.au

## 📄 License

[Your License Here]
