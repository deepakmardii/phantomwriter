import { Inter } from 'next/font/google';
import Providers from './providers/Providers';
import LayoutWrapper from './components/LayoutWrapper';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'PhantomWriter - AI LinkedIn Post Generator',
  description:
    'Generate professional LinkedIn posts using AI to maintain a consistent online presence.',
  keywords: 'LinkedIn, AI, Content Generation, Social Media, Professional Posts',
  authors: [{ name: 'PhantomWriter' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 min-h-screen`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = {
              NEXT_PUBLIC_RAZORPAY_KEY_ID: "${process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ''}"
            };`,
          }}
        />
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
