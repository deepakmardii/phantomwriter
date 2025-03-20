# PhantomWriter - AI LinkedIn Post Generator (CI/CD Working)

PhantomWriter is a powerful web application that helps professionals maintain a consistent LinkedIn presence by generating high-quality posts using AI. The application offers features like content generation with different tones, subscription management, and post history tracking.

## Features

- 🤖 AI-powered LinkedIn post generation
- 🎭 Multiple tone options (Professional, Casual, Thought Leadership, Storytelling)
- 📝 Keyword-based content optimization
- 💰 Subscription plans with Razorpay integration
- 📊 Post history and management
- 🔐 Secure authentication system
- 🎨 Modern, responsive UI with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Node.js, MongoDB
- **Authentication**: JWT
- **AI**: Google AI API
- **Payment**: Razorpay
- **Testing**: Jest, React Testing Library

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18.x or higher
- MongoDB
- npm or yarn
- Git

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/phantomwriter

# JWT Configuration
JWT_SECRET=your-jwt-secret-key-minimum-32-characters

# Razorpay Configuration
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key-id

# Google AI Configuration
GOOGLE_AI_API_KEY=your-google-ai-api-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/phantomwriter.git
cd phantomwriter
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production application
- `npm start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Project Structure

```
phantomwriter/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── components/        # Reusable components
│   ├── providers/         # Context providers
│   ├── hooks/             # Custom hooks
│   └── utils/             # Utility functions
├── middleware/            # Authentication middleware
├── models/               # MongoDB models
├── public/               # Static files
└── utils/                # Global utility functions
```

## API Routes

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/posts/generate` - Generate new post
- `GET /api/posts/get` - Get user's posts
- `POST /api/payment/create-order` - Create payment order
- `POST /api/payment/verify` - Verify payment

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Next.js team for the amazing framework
- TailwindCSS for the utility-first CSS framework
- MongoDB for the database
- Razorpay for payment integration
- Google AI for the content generation API
