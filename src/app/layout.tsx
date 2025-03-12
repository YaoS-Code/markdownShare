"use client";

import { useState } from 'react';
import './globals.css';
import SideNav from '@/components/SideNav';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = (open: boolean) => {
    setSidebarOpen(open);
  };

  return (
    <html lang="en">
      <head>
        <title>Knowledge Library</title>
        <meta name="description" content="Educational resource and knowledge sharing platform" />
      </head>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <SideNav isOpen={sidebarOpen} onToggle={toggleSidebar} />
        <main className={`main-content-with-sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          {children}
        </main>
      </body>
    </html>
  );
}
