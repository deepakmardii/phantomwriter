import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import User from '@/models/User';
import dbConnect from '@/utils/db';
import AdminLayout from './components/AdminLayout';

export default async function RootAdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  await dbConnect();
  const user = await User.findOne({ email: session.user.email });

  if (!user || user.role !== 'admin') {
    redirect('/dashboard');
  }

  return <AdminLayout>{children}</AdminLayout>;
}
