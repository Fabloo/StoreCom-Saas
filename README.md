# Storecom - Local SEO Operating System

Storecom is a comprehensive local SEO management platform for multi-location brands. It provides tools for managing Google Business Profiles, local SEO optimization, review management, and performance analytics.

## Features

### Core Features
- **SEO Overview Dashboard**: User-friendly dashboard displaying Local SEO Score, GMB profile completion, and microsite health
- **Store SEO Management**: Centralized platform for managing store SEO settings, audit suggestions, and schema setup
- **Rank Tracking**: Monitor local pack rank and keyword performance for each store
- **SEO Audit Center**: SEO Completeness Dashboard to audit meta descriptions and tags
- **GMB Post Optimization**: Dashboard tracking GMB posting frequency with extracted top keywords from reviews
- **AI Content Suggestions**: Generate service content based on user inputs and keywords
- **Microsite SEO Management**: Microsite SEO management platform for content creation, meta-tag editing, and image optimization

### Google Business Integration
- **Account Management**: Connect and manage multiple Google Business accounts
- **Location Management**: View and update business information, hours, and categories
- **Post Management**: Create and manage Google Business posts with different types (Standard, Offer, Event, Alert)
- **Insights & Analytics**: Track profile views, website clicks, phone calls, and other key metrics
- **Review Management**: View and respond to customer reviews
- **Real-time Data**: Get live data from Google Business API

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Google Cloud Platform account (for Google Business API)
- Google Business Profile account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd studio
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure Google Business API (see [Google Business Setup Guide](./GOOGLE_BUSINESS_SETUP.md))

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Google Business API Setup

For detailed instructions on setting up the Google Business API integration, see the [Google Business Setup Guide](./GOOGLE_BUSINESS_SETUP.md).

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── google-business/ # Google Business API endpoints
│   ├── dashboard/         # Main dashboard
│   ├── stores/           # Store management
│   ├── reviews/          # Review management
│   ├── google-business/  # Google Business management
│   └── ...
├── components/           # Reusable UI components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and API services
└── ai/                  # AI-powered features and flows
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - UI components
- **Google APIs** - Google Business integration
- **Genkit AI** - AI-powered features
- **Firebase** - Backend services

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
