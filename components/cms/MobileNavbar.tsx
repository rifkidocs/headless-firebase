"use client";

import { Menu, Database } from "lucide-react";

interface MobileNavbarProps {
  onOpenMenu: () => void;
}

export function MobileNavbar({ onOpenMenu }: MobileNavbarProps) {
  return (
    <nav className='md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 h-16 px-4 flex items-center justify-between z-40 shadow-sm'>
      <div className='flex items-center gap-3'>
        <div className='p-1.5 bg-blue-600 rounded-lg'>
          <Database className='w-4 h-4 text-white' />
        </div>
        <span className='font-bold text-gray-900 tracking-tight'>
          Headless Firebase
        </span>
      </div>
      <button
        onClick={onOpenMenu}
        className='p-2 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors'
        aria-label='Open menu'>
        <Menu className='w-6 h-6' />
      </button>
    </nav>
  );
}
