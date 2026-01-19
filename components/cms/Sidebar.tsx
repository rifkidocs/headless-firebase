"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  LogOut,
  Settings,
  ChevronRight,
  ChevronLeft,
  Image,
  Users,
  Shield,
  Component,
  FileText,
  Menu,
} from "lucide-react";
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
  collapsed: boolean;
}

const NavItem = ({
  href,
  icon: Icon,
  children,
  active,
  collapsed,
}: NavItemProps) => (
  <Link
    href={href}
    className={clsx(
      "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
      active
        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
      collapsed && "justify-center px-2"
    )}
    title={collapsed ? String(children) : undefined}>
    <Icon
      className={clsx(
        "w-5 h-5 shrink-0",
        active
          ? "text-white"
          : "text-gray-400 group-hover:text-blue-600 transition-colors"
      )}
    />
    {!collapsed && (
      <>
        <span className='flex-1 truncate'>{children}</span>
        {active && <ChevronRight className='w-4 h-4 opacity-50' />}
      </>
    )}
  </Link>
);

interface NavSectionProps {
  title: string;
  children: React.ReactNode;
  collapsed: boolean;
}

const NavSection = ({ title, children, collapsed }: NavSectionProps) => (
  <div className='space-y-1.5'>
    {!collapsed && (
      <p className='px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3'>
        {title}
      </p>
    )}
    {collapsed && <div className='h-px bg-gray-100 mx-3 my-4' />}
    {children}
  </div>
);

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collections, setCollections] = useState<
    { id: string; slug: string; label: string; kind: string }[]
  >([]);
  const [collapsed, setCollapsed] = useState(false);

  // Load collapsed state from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      const parsedValue = JSON.parse(saved);
      requestAnimationFrame(() => {
        setCollapsed(parsedValue);
      });
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", JSON.stringify(newState));
  };

  useEffect(() => {
    // Listen to _collections for dynamic menu
    const q = query(collection(db, "_collections"), orderBy("label"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cols = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as { id: string; slug: string; label: string; kind: string }[];
      setCollections(cols);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/admin/login");
  };

  const collectionTypes = collections.filter((c) => c.kind !== "singleType");
  const singleTypes = collections.filter((c) => c.kind === "singleType");

  return (
    <aside
      className={clsx(
        "hidden md:flex bg-white text-gray-900 h-screen sticky top-0 flex-col border-r border-gray-200 shadow-sm z-50 transition-all duration-300",
        collapsed ? "w-[72px]" : "w-72"
      )}>
      {/* Header */}
      <div
        className={clsx(
          "p-6 flex items-center",
          collapsed ? "justify-center" : "justify-between"
        )}>
        {!collapsed && (
          <h1 className='text-lg font-bold flex items-center gap-3 text-gray-900 tracking-tight'>
            <div className='p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20'>
              <Database className='w-5 h-5 text-white' />
            </div>
            <span>Headless Firebase</span>
          </h1>
        )}
        <button
          onClick={toggleCollapsed}
          className={clsx(
            "p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors",
            collapsed && "p-2 bg-gray-50"
          )}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? (
            <Menu className='w-5 h-5' />
          ) : (
            <ChevronLeft className='w-5 h-5' />
          )}
        </button>
      </div>

      <nav className='flex-1 px-4 py-6 space-y-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 scrollbar-track-transparent'>
        {/* Platform Section */}
        <NavSection title='Platform' collapsed={collapsed}>
          <NavItem
            href='/admin'
            icon={LayoutDashboard}
            active={pathname === "/admin"}
            collapsed={collapsed}>
            Dashboard
          </NavItem>
          <NavItem
            href='/docs'
            icon={FileText}
            active={pathname.startsWith("/docs")}
            collapsed={collapsed}>
            API Documentation
          </NavItem>
          <NavItem
            href='/admin/media'
            icon={Image}
            active={pathname.startsWith("/admin/media")}
            collapsed={collapsed}>
            Media Library
          </NavItem>
        </NavSection>

        {/* Content Builder Section */}
        <NavSection title='Content Builder' collapsed={collapsed}>
          <NavItem
            href='/admin/schema'
            icon={Settings}
            active={pathname.startsWith("/admin/schema")}
            collapsed={collapsed}>
            Content Types
          </NavItem>
          <NavItem
            href='/admin/components'
            icon={Component}
            active={pathname.startsWith("/admin/components")}
            collapsed={collapsed}>
            Components
          </NavItem>
        </NavSection>

        {/* Single Types Section */}
        {singleTypes.length > 0 && (
          <NavSection title='Single Types' collapsed={collapsed}>
            {singleTypes.map((col) => {
              const isActive = pathname === `/admin/single/${col.slug}`;
              return (
                <NavItem
                  key={col.slug}
                  href={`/admin/single/${col.slug}`}
                  icon={FileText}
                  active={isActive}
                  collapsed={collapsed}>
                  {col.label}
                </NavItem>
              );
            })}
          </NavSection>
        )}

        {/* Collection Types Section */}
        {collectionTypes.length > 0 && (
          <NavSection title='Content' collapsed={collapsed}>
            {collectionTypes.map((col) => {
              const isActive =
                pathname.startsWith(`/admin/${col.slug}`) &&
                !pathname.startsWith("/admin/schema");
              return (
                <NavItem
                  key={col.slug}
                  href={`/admin/${col.slug}`}
                  icon={Database}
                  active={isActive}
                  collapsed={collapsed}>
                  {col.label}
                </NavItem>
              );
            })}
          </NavSection>
        )}

        {/* Admin Section */}
        <NavSection title='Administration' collapsed={collapsed}>
          <NavItem
            href='/admin/users'
            icon={Users}
            active={pathname.startsWith("/admin/users")}
            collapsed={collapsed}>
            Users
          </NavItem>
          <NavItem
            href='/admin/roles'
            icon={Shield}
            active={pathname.startsWith("/admin/roles")}
            collapsed={collapsed}>
            Roles & Permissions
          </NavItem>
        </NavSection>
      </nav>

      {/* Footer */}
      <div className='p-4 border-t border-gray-100 bg-white'>
        <button
          onClick={handleLogout}
          className={clsx(
            "flex items-center gap-3 px-3 py-2.5 w-full text-left text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 group",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Sign Out" : undefined}>
          <LogOut className='w-5 h-5 group-hover:text-red-600 transition-colors shrink-0' />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
