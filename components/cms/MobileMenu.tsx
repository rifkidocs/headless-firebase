"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X, LayoutDashboard, Database, Image, Settings, Component, FileText, Users, Shield, LogOut, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import clsx from "clsx";

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NavItem = ({
  href,
  icon: Icon,
  children,
  active,
  onClick,
}: {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) => (
  <Link
    href={href}
    onClick={onClick}
    className={clsx(
      "flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200",
      active
        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
        : "text-gray-500 active:bg-gray-100"
    )}>
    <Icon className={clsx("w-5 h-5", active ? "text-white" : "text-gray-400")} />
    <span className='flex-1'>{children}</span>
    {active && <ChevronRight className='w-4 h-4 opacity-50' />}
  </Link>
);

const NavSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className='space-y-1.5'>
    <p className='px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3'>
      {title}
    </p>
    {children}
  </div>
);

export function MobileMenu({ open, onOpenChange }: MobileMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collections, setCollections] = useState<
    { id: string; slug: string; label: string; kind: string }[]
  >([]);

  useEffect(() => {
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
    onOpenChange(false);
    router.push("/admin/login");
  };

  const collectionTypes = collections.filter((c) => c.kind !== "singleType");
  const singleTypes = collections.filter((c) => c.kind === "singleType");

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden'
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className='fixed left-0 top-0 bottom-0 w-[85%] max-w-sm bg-white z-50 shadow-2xl flex flex-col md:hidden'>
                {/* Header */}
                <div className='p-6 flex items-center justify-between border-b border-gray-100'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-blue-600 rounded-xl'>
                      <Database className='w-5 h-5 text-white' />
                    </div>
                    <Dialog.Title className='font-bold text-gray-900 text-lg'>
                      Headless Firebase
                    </Dialog.Title>
                  </div>
                  <Dialog.Close asChild>
                    <button className='p-2 rounded-xl text-gray-400 active:bg-gray-100'>
                      <X className='w-6 h-6' />
                    </button>
                  </Dialog.Close>
                </div>

                {/* Nav Links */}
                <nav className='flex-1 overflow-y-auto p-4 space-y-8'>
                  <NavSection title='Platform'>
                    <NavItem
                      href='/admin'
                      icon={LayoutDashboard}
                      active={pathname === "/admin"}
                      onClick={() => onOpenChange(false)}>
                      Dashboard
                    </NavItem>
                    <NavItem
                      href='/docs'
                      icon={FileText}
                      active={pathname.startsWith("/docs")}
                      onClick={() => onOpenChange(false)}>
                      API Documentation
                    </NavItem>
                    <NavItem
                      href='/admin/media'
                      icon={Image}
                      active={pathname.startsWith("/admin/media")}
                      onClick={() => onOpenChange(false)}>
                      Media Library
                    </NavItem>
                  </NavSection>

                  <NavSection title='Content Builder'>
                    <NavItem
                      href='/admin/schema'
                      icon={Settings}
                      active={pathname.startsWith("/admin/schema")}
                      onClick={() => onOpenChange(false)}>
                      Content Types
                    </NavItem>
                    <NavItem
                      href='/admin/components'
                      icon={Component}
                      active={pathname.startsWith("/admin/components")}
                      onClick={() => onOpenChange(false)}>
                      Components
                    </NavItem>
                  </NavSection>

                  {singleTypes.length > 0 && (
                    <NavSection title='Single Types'>
                      {singleTypes.map((col) => (
                        <NavItem
                          key={col.slug}
                          href={`/admin/single/${col.slug}`}
                          icon={FileText}
                          active={pathname === `/admin/single/${col.slug}`}
                          onClick={() => onOpenChange(false)}>
                          {col.label}
                        </NavItem>
                      ))}
                    </NavSection>
                  )}

                  {collectionTypes.length > 0 && (
                    <NavSection title='Content'>
                      {collectionTypes.map((col) => (
                        <NavItem
                          key={col.slug}
                          href={`/admin/${col.slug}`}
                          icon={Database}
                          active={pathname.startsWith(`/admin/${col.slug}`) && !pathname.startsWith("/admin/schema")}
                          onClick={() => onOpenChange(false)}>
                          {col.label}
                        </NavItem>
                      ))}
                    </NavSection>
                  )}

                  <NavSection title='Administration'>
                    <NavItem
                      href='/admin/users'
                      icon={Users}
                      active={pathname.startsWith("/admin/users")}
                      onClick={() => onOpenChange(false)}>
                      Users
                    </NavItem>
                    <NavItem
                      href='/admin/roles'
                      icon={Shield}
                      active={pathname.startsWith("/admin/roles")}
                      onClick={() => onOpenChange(false)}>
                      Roles & Permissions
                    </NavItem>
                  </NavSection>
                </nav>

                {/* Footer */}
                <div className='p-4 border-t border-gray-100'>
                  <button
                    onClick={handleLogout}
                    className='flex items-center gap-4 px-4 py-3.5 w-full text-left text-base font-medium text-gray-500 active:bg-red-50 active:text-red-600 rounded-xl transition-all duration-200'>
                    <LogOut className='w-5 h-5' />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
