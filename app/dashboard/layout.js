import React from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation';
import DashboardAudioProvider from '@/components/DashboardAudioProvider';

export default async function DashboardLayout({ children }) {
  // Server-side authentication check
  const session = await auth();
  
  if (!session) {
    redirect("/");
  }

  return (
    <DashboardAudioProvider>
      {children}
    </DashboardAudioProvider>
  );
}
