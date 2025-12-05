"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Database, LogOut, Settings, ChevronRight } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
  active: boolean;
}

const NavItem = ({ href, icon: Icon, children, active }: NavItemProps) => (
  <Link 
    href={href}
    className={clsx(
      "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
      active 
        ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" 
        : "text-gray-400 hover:bg-gray-800 hover:text-white"
    )}
  >
    <Icon className={clsx("w-5 h-5", active ? "text-white" : "text-gray-500 group-hover:text-white transition-colors")} />
    <span className="flex-1">{children}</span>
    {active && <ChevronRight className="w-4 h-4 opacity-50" />}
  </Link>
);

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collections, setCollections] = useState<{ id: string; slug: string; label: string }[]>([]);

  useEffect(() => {
    // Listen to _collections for dynamic menu
    const q = query(collection(db, "_collections"), orderBy("label"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cols = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as { id: string; slug: string; label: string }[];
      setCollections(cols);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/admin/login");
  };

  return (
    <aside className="w-72 bg-[#0F172A] text-white min-h-screen flex flex-col border-r border-gray-800 shadow-xl z-50">
      <div className="p-6 border-b border-gray-800/50">
        <h1 className="text-xl font-bold flex items-center gap-3 text-white tracking-tight">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/20">
            <Database className="w-5 h-5 text-white" />
          </div>
          CMS Admin
        </h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
        <div className="space-y-1">
          <p className="px-3 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Platform</p>
          <NavItem 
            href="/admin" 
            icon={LayoutDashboard} 
            active={pathname === "/admin"}
          >
            Dashboard
          </NavItem>
          <NavItem 
            href="/admin/schema" 
            icon={Settings} 
            active={pathname.startsWith("/admin/schema")}
          >
            Schema Builder
          </NavItem>
        </div>

        {collections.length > 0 && (
          <div className="space-y-1">
            <p className="px-3 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Content</p>
            {collections.map((col) => {
              const isActive = pathname.startsWith(`/admin/${col.slug}`) && !pathname.startsWith("/admin/schema");
              return (
                <NavItem
                  key={col.slug}
                  href={`/admin/${col.slug}`}
                  icon={Database} // You might want dynamic icons later
                  active={isActive}
                >
                  <span className="capitalize">{col.label}</span>
                </NavItem>
              );
            })}
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-gray-800/50 bg-[#0F172A]">
        <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-left text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 group-hover:text-red-400 transition-colors" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
