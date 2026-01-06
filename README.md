# Social Media App

A modern, full-featured social media application built with Next.js 16, featuring real-time messaging, stories, OAuth authentication, and a beautiful UI.

## 🚀 Live Demo

**[View Live Demo](https://social-media-app-one-alpha.vercel.app/login)**

## ✨ Features

- 🔐 **Authentication**
  - Email/Password authentication with JWT
  - OAuth integration (Google & GitHub)
  - Secure session management with HTTP-only cookies
  
- 📱 **Social Features**
  - User profiles with customizable bio, location, and images
  - Post creation with multiple media support
  - Stories with 24-hour expiration
  - Like and comment functionality
  - User connections/friend requests
  
- 💬 **Messaging**
  - Real-time direct messaging
  - Message media support (images, videos)
  - Chat history and recent messages
  
- 🎨 **Modern UI/UX**
  - Responsive design for all devices
  - Toast notifications (Sonner)
  - Skeleton loading states
  - Glassmorphism and modern design aesthetics
  - Dark mode ready

## 🛠️ Tech Stack

- **Framework:** Next.js 16.1.1 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT + OAuth (Google, GitHub)
- **State Management:** Zustand
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI + shadcn/ui
- **Notifications:** Sonner
- **HTTP Client:** Axios
- **Deployment:** Vercel

## 📋 Prerequisites

Before you begin, ensure you have installed:

- Node.js 18+ and npm
- PostgreSQL database
- Git

## 🔧 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/okoye-peter/social-media-app.git
cd social-media-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the `.env` file with your credentials:

```env
# Database (Required)
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
DIRECT_URL="postgresql://user:password@host:port/database"

# JWT Secret (Required)
# Generate using: openssl rand -base64 32
JWT_SECRET="your-generated-secret-key"
JWT_EXPIRES_IN="7d"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"

# GitHub OAuth (Optional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GITHUB_REDIRECT_URI="http://localhost:3000/api/auth/github/callback"
```

#### Getting OAuth Credentials

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Add authorized redirect URI: `http://localhost:3000/api/auth/google/callback`

**GitHub OAuth:**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set Authorization callback URL: `http://localhost:3000/api/auth/github/callback`

### 4. Set up the database

```bash
# Generate Prisma Client
npx prisma generate

# Push the schema to your database
npx prisma db push

# (Optional) Seed the database
npx prisma db seed
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
social-media-app/
├── app/                        # Next.js app directory
│   ├── (auth)/                # Authentication routes
│   ├── (dashboard)/           # Protected dashboard routes
│   └── api/                   # API routes
├── components/                 # React components
│   ├── shared/                # Shared components
│   └── ui/                    # UI components (shadcn/ui)
├── lib/                       # Utility functions
│   ├── auth.ts               # Authentication utilities
│   ├── db.ts                 # Database client
│   └── jwt.ts                # JWT utilities
├── prisma/                    # Prisma schema and migrations
├── public/                    # Static assets
├── stores/                    # Zustand state stores
└── types/                     # TypeScript type definitions
```

## 🗄️ Database Schema

The app uses Prisma with PostgreSQL and includes models for:
- Users
- Posts & PostMedia
- Comments
- Likes
- Connections (Friend requests)
- Messages & MessageMedia
- Stories

View the complete schema in `prisma/schema.prisma`.

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

**Important:** Make sure to update OAuth redirect URIs to your production domain.

### Environment Variables for Production

Update these variables for production:
```env
GOOGLE_REDIRECT_URI="https://your-domain.com/api/auth/google/callback"
GITHUB_REDIRECT_URI="https://your-domain.com/api/auth/github/callback"
```

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Peter Okoye**
- GitHub: [@okoye-peter](https://github.com/okoye-peter)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vercel](https://vercel.com/)
