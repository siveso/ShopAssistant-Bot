# Sales Assistant - Multilingual E-commerce Chatbot

## Overview

Sales Assistant is a comprehensive e-commerce platform combining a multilingual chatbot system, public-facing website, and admin management interface. The system serves online store customers in both Uzbek and Russian languages through multiple channels: Telegram bot for direct customer interaction, a public website catalog for product browsing, and a React-based admin dashboard for comprehensive business management.

The platform integrates rule-based responses with AI-powered natural language processing for the chatbot, while providing a modern web presence for customers to browse and learn about products. The system supports multiple messaging platforms (Telegram and Instagram Direct) while maintaining centralized management through the admin interface.

**Bot Contact Information:**
- Telegram Bot: @akramjon0011 (https://t.me/akramjon0011)
- Admin Login: Configured securely (credentials removed from documentation for security)

## User Preferences

Preferred communication style: Simple, everyday language.
User preferred language: Uzbek (o'zbek tili)
Migration Status: ✅ Successfully completed migration from Replit Agent to Replit environment (January 8, 2025)

## Recent Changes (January 2025)

### Migration Completed Successfully ✓ (January 8, 2025)
- **Environment Migration**: Successfully migrated from Replit Agent to standard Replit environment
- **Database Integration**: PostgreSQL database connected and all schemas migrated successfully
- **TypeScript Errors Fixed**: Resolved all compilation errors in Telegram bot service
- **Sample Data**: Added 8 sample products for testing (Samsung Galaxy S24, iPhone 15 Pro, MacBook Air M3, etc.)
- **Telegram Bot**: Successfully initialized and polling without 409 conflicts
- **Authentication System**: Admin authentication with session management working
- **Translation Management**: Full CRUD operations for multilingual content management
- **API Layer**: RESTful endpoints for all major features implemented
- **Professional UI**: React-based admin dashboard with modern UI components

### Current Architecture Status
- **Database**: PostgreSQL with Drizzle ORM (fully operational)
- **Backend**: Express.js server with TypeScript (running on port 5000)
- **Frontend**: React with TanStack Query for state management
- **Telegram Bot**: Successfully integrated and running
- **AI Integration**: Google Gemini API configured for natural language processing
- **Public Website**: Complete customer-facing website with product catalog and multilingual support
- **Admin Panel**: Separate authenticated admin interface for managing products, orders, and bot settings
- **Status**: Production ready with all core features operational including public website

### Recent Fixes (January 2025)
- **Product Validation**: Fixed price and quantity validation using z.coerce for automatic string-to-number conversion
- **Telegram Bot Real-time Updates**: Bot now fetches fresh product data from database on each request
- **API Endpoints**: All CRUD operations working correctly with proper validation
- **Data Consistency**: Admin panel changes are immediately reflected in Telegram bot responses
- **E-commerce Bot Complete**: Full shopping cart system with quantity selection, checkout process, and order management
- **Admin Authentication**: Working login system with bcrypt password hashing
- **Bot Stability**: Fixed 409 conflicts and improved polling mechanism with proper cleanup
- **Product Catalog**: 8 active products (Samsung Galaxy S24, iPhone 15 Pro, MacBook Air M3, etc.) for testing
- **Flexible Quantity Input**: Users can now input any quantity (1-10,000) via text message instead of limited buttons
- **Enhanced UX**: Quick quantity buttons (1, 5, 10, 50, 100, 500) plus custom number input support
- **Public Website Catalog**: ✅ Complete public-facing website with product catalog, detail pages, and multilingual support (January 8, 2025)
- **Website Features**: Home page, product catalog with search/filter, individual product pages, about page, multilingual (Uzbek/Russian)
- **Navigation**: Separated admin panel (/admin) from public website (/) with proper routing and authentication
- **Security Enhancement**: Removed login credentials from public-facing pages for improved security

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with custom styling
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Language**: Node.js with ES modules
- **API Design**: RESTful API structure with CRUD operations
- **Error Handling**: Centralized error middleware
- **Development**: Hot reload with Vite integration

### Database Architecture
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Design**: 
  - Users table with platform integration (Telegram/Instagram)
  - Products table with multilingual support (Uzbek/Russian)
  - Orders table with status tracking
  - Conversations table for chat history
  - Bot settings table for configuration management

### Chatbot Architecture
- **Hybrid Model**: Combines rule-based responses with AI-powered natural language processing
- **Rule-based System**: Pre-configured responses for common queries (delivery, payment, contacts, promotions)
- **AI Integration**: Google Gemini 1.5 Flash API for complex queries and natural conversation
- **Multilingual Support**: Dynamic language switching with persistent user preferences
- **Platform Integration**: Telegram Bot API with planned Instagram Direct support

### Data Storage Strategy
- **Static Content**: JSON files for FAQ responses and bot configurations
- **Dynamic Content**: PostgreSQL database for user data, products, orders, and conversations
- **Session Management**: In-memory conversation state with database persistence
- **File Storage**: External URLs for product images

## External Dependencies

### AI and Machine Learning
- **Google Gemini API**: Primary AI service for natural language processing and response generation
- **@google/genai**: Official Google AI client library

### Database and ORM
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-kit**: Database migration and schema management tools

### Bot Platform APIs
- **node-telegram-bot-api**: Telegram Bot API integration
- **Instagram Graph API**: Planned integration for Instagram Direct messaging

### UI and Styling
- **@radix-ui/react-***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Utility for managing component variants
- **clsx**: Conditional class name utility

### Form and Validation
- **react-hook-form**: Performance-focused form library
- **@hookform/resolvers**: Form validation resolvers
- **zod**: TypeScript-first schema validation
- **drizzle-zod**: Integration between Drizzle ORM and Zod validation

### Development and Build Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **@replit/vite-plugin-***: Replit-specific development enhancements

### Additional Libraries
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React router
- **date-fns**: Date manipulation library
- **nanoid**: Unique ID generation