"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/cms/Sidebar";
import { MobileNavbar } from "@/components/cms/MobileNavbar";
import { MobileMenu } from "@/components/cms/MobileMenu";
import { useAuth } from "@/components/providers/AuthProvider";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='flex flex-col items-center gap-4'>
          <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600'></div>
          <p className='text-gray-500 text-sm'>Loading...</p>
        </div>
      </div>
    );
  }

  // Jika di halaman login, render tanpa sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Jika tidak terautentikasi (dan bukan di login page), jangan render apa-apa (redirecting)
  if (!user) {
    return null;
  }

  return (
    <div className='flex min-h-screen bg-gray-50'>
      {/* Desktop Sidebar */}
      <div className='hidden md:flex'>
        <Sidebar />
      </div>

      <div className='flex-1 flex flex-col min-w-0'>
        {/* Mobile Navbar */}
        <MobileNavbar onOpenMenu={() => setIsMobileMenuOpen(true)} />

        {/* Mobile Slide-over Menu */}
        <MobileMenu
          open={isMobileMenuOpen}
          onOpenChange={setIsMobileMenuOpen}
        />

        {/* Main Content */}
        <main className='flex-1 p-4 md:p-8 overflow-auto mt-16 md:mt-0'>
          {children}
        </main>
      </div>
    </div>
  );
}