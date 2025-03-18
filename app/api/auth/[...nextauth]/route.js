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
          console.log('Auth attempt for email:', credentials?.email);

          if (!credentials?.email || !credentials?.password) {
            console.log('Missing email or password');
            throw new Error('Email and password required');
          }

          await dbConnect();
          console.log('Connected to DB, searching for user...');

          // Include password field explicitly since it's select: false by default
          const user = await User.findOne({ email: credentials.email }).select('+password');
          console.log('User found?', !!user, 'Role:', user?.role);

          if (!user) {
            console.log('User not found');
            throw new Error('Invalid credentials');
          }

          const isPasswordValid = await compare(credentials.password, user.password);
          console.log('Password valid?', isPasswordValid);

          if (!isPasswordValid) {
            console.log('Invalid password');
            throw new Error('Invalid credentials');
          }

          // Don't include password in the returned user object
          const userWithoutPassword = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
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
        token.role = user.role;
        token.subscription = user.subscription;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
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
