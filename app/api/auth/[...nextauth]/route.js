import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import jwt from 'jsonwebtoken';
import dbConnect from '@/utils/db';
import User from '@/models/User';
import { compare } from 'bcryptjs';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password required');
          }

          await dbConnect();

          const user = await User.findOne({ email: credentials.email }).select('+password');

          if (!user) {
            throw new Error('Invalid credentials');
          }

          const isPasswordValid = await compare(credentials.password, user.password);

          if (!isPasswordValid) {
            throw new Error('Invalid credentials');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            subscription: user.subscription,
            provider: 'credentials',
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ _user, account, profile }) {
      if (account.provider === 'google') {
        try {
          await dbConnect();

          // Check if user exists
          let existingUser = await User.findOne({ email: profile.email });

          if (existingUser) {
            // Update existing user's Google-specific info
            existingUser.image = profile.picture;
            existingUser.name = profile.name;
            existingUser.provider = 'google';
            await existingUser.save({ validateBeforeSave: false });
            return true;
          }

          // Create new user without validation since Google users don't need password
          const newUser = new User({
            email: profile.email,
            name: profile.name,
            image: profile.picture,
            provider: 'google',
            subscription: {
              status: 'free',
            },
            role: 'user',
          });

          await newUser.save({ validateBeforeSave: false });
          return true;
        } catch (error) {
          console.error('Google sign in error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session, account }) {
      if (user) {
        // If it's a Google sign in, fetch the user from DB to get complete data
        if (account?.provider === 'google') {
          await dbConnect();
          const dbUser = await User.findOne({ email: user.email });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.email = dbUser.email;
            token.name = dbUser.name;
            token.role = dbUser.role;
            token.subscription = dbUser.subscription;
            token.provider = dbUser.provider;
            token.image = dbUser.image;
          }
        } else {
          // For credentials provider, use the user object directly
          token.id = user.id;
          token.email = user.email;
          token.role = user.role;
          token.subscription = user.subscription;
          token.provider = user.provider;
          token.name = user.name;
        }
      }

      if (trigger === 'update' && session?.name) {
        token.name = session.name;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.subscription = token.subscription;
        session.user.provider = token.provider;
        // Create a JWT with the required user ID field
        session.token = jwt.sign(
          {
            id: token.id, // Ensure id is in the payload
            sub: token.id, // Also include sub for compatibility
          },
          process.env.JWT_SECRET
        );
      }
      return session;
    },
    async encode({ _secret, token }) {
      return jwt.sign(token, process.env.JWT_SECRET);
    },
    async decode({ _secret, token }) {
      return jwt.verify(token, process.env.JWT_SECRET);
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
