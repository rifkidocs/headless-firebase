"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/cms/Sidebar";
import { Toaster } from "@/components/ui/Toast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
        if (pathname !== "/admin/login") {
          router.push("/admin/login");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

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
    return (
      <>
        <Toaster
          position='top-right'
          toastOptions={{
            className: "",
            style: {
              background: "transparent",
              boxShadow: "none",
              padding: 0,
            },
          }}
        />
        {children}
      </>
    );
  }

  // Jika tidak terautentikasi (dan bukan di login page - though logic above handles redirect), return null
  if (!authenticated) {
    return null;
  }

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <Toaster
        position='top-right'
        toastOptions={{
          className: "",
          style: {
            background: "transparent",
            boxShadow: "none",
            padding: 0,
          },
        }}
      />
      <Sidebar />
      <main className='flex-1 p-8 overflow-auto'>{children}</main>
    </div>
  );
}
