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
  
- 💬 **Real-time Messaging**
  - Real-time direct messaging with Pusher
  - Typing indicators
  - Message media support (images, videos)
  - Optimistic UI updates for instant feedback
  - Infinite scroll chat history
  - File upload with progress tracking
  - Automatic retry with Inngest background jobs
  
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
- **Real-time:** Pusher (WebSocket connections)
- **Background Jobs:** Inngest (reliable message broadcasting)
- **State Management:** Zustand + React Query
- **File Storage:** Supabase S3
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

# Pusher (Required for real-time messaging)
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_SECRET="your-pusher-secret"
NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
NEXT_PUBLIC_PUSHER_CLUSTER="your-pusher-cluster"

# Inngest (Required for background jobs)
INNGEST_EVENT_KEY="your-inngest-event-key"
INNGEST_SIGNING_KEY="your-inngest-signing-key"

# Supabase (Required for file storage)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
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

**Pusher (Real-time):**
1. Go to [Pusher Dashboard](https://dashboard.pusher.com/)
2. Create a new Channels app
3. Copy your app credentials (App ID, Key, Secret, Cluster)
4. Enable client events for typing indicators

**Inngest (Background Jobs):**
1. Go to [Inngest Dashboard](https://www.inngest.com/)
2. Create a new project
3. Copy your Event Key and Signing Key
4. Deploy your app to enable Inngest functions

**Supabase (File Storage):**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Go to Storage → Create a new bucket (e.g., "messages")
4. Set bucket to public or configure RLS policies
5. Copy your project URL and anon key

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
│   │   └── messages/         # Real-time chat pages
│   └── api/                   # API routes
│       ├── auth/             # Authentication APIs
│       ├── pusher/           # Pusher auth endpoint
│       └── inngest/          # Inngest function handler
├── components/                 # React components
│   ├── shared/                # Shared components
│   └── ui/                    # UI components (shadcn/ui)
├── lib/                       # Utility functions
│   ├── auth.ts               # Authentication utilities
│   ├── db.ts                 # Database client
│   ├── jwt.ts                # JWT utilities
│   ├── pusher.ts             # Pusher server instance
│   └── supabase-s3.service.ts # File upload service
├── src/ingest/                # Inngest functions
│   ├── client.ts             # Inngest client
│   └── functions.ts          # Background job functions
├── prisma/                    # Prisma schema and migrations
├── public/                    # Static assets
├── stores/                    # Zustand state stores
└── types/                     # Centralized TypeScript types
```

## 🗄️ Database Schema

The app uses Prisma with PostgreSQL and includes models for:
- **Users** - User accounts and profiles
- **Posts & PostMedia** - Social posts with media attachments
- **Comments** - Post comments
- **Likes** - Post likes
- **Connections** - Friend requests and connections
- **Messages & MessageMedia** - Real-time chat messages
- **Stories** - 24-hour ephemeral stories
- **Follows** - User following relationships

View the complete schema in `prisma/schema.prisma`.

## 🔄 Real-time Features

### Pusher Integration
- **Private Channels**: Secure 1-on-1 chat channels
- **Authentication**: Custom auth endpoint validates channel access
- **Events**: `new-message`, `user-typing`
- **Optimistic Updates**: Instant UI feedback before server confirmation

### Inngest Background Jobs
- **Message Broadcasting**: Reliable Pusher event delivery with 3 retries
- **Async Processing**: API responds immediately, broadcasting happens in background
- **Extensible**: Easy to add notifications, analytics, etc.

### File Upload
- **Supabase S3**: Scalable file storage
- **Progress Tracking**: Real-time upload progress
- **Cleanup**: Automatic deletion of orphaned files

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
