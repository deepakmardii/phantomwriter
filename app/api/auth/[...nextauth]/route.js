import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import jwt from 'jsonwebtoken';
import dbConnect from '@/utils/db';
import User from '@/models/User';
import { compare } from 'bcryptjs';

export const authOptions = {
  providers: [
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
          // Include password field explicitly since it's select: false by default
          const user = await User.findOne({ email: credentials.email }).select('+password');

          if (!user) {
            throw new Error('Invalid credentials');
          }

          const isPasswordValid = await compare(credentials.password, user.password);

          if (!isPasswordValid) {
            throw new Error('Invalid credentials');
          }

          // Don't include password in the returned user object
          const userWithoutPassword = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            subscription: user.subscription,
          };

          return userWithoutPassword;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.subscription = user.subscription;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.subscription = token.subscription;
        // Include both the raw JWT token and the token object
        session.accessToken = token.jti;
        session.token = jwt.sign(token, process.env.JWT_SECRET);
      }
      return session;
    },
    async encode({ secret, token }) {
      // Use our JWT_SECRET for consistency with our API auth
      return jwt.sign(token, process.env.JWT_SECRET);
    },
    async decode({ secret, token }) {
      // Use our JWT_SECRET for consistency with our API auth
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
