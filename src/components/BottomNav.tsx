'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Library, User, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/transfer', icon: Share2, label: 'Share' },
  { href: '/library', icon: Library, label: 'Library' },
  { href: '/profile', icon: User, label: 'Profile' },
];



export const BottomNav = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-dark border-t border-white/5 safe-bottom pb-[env(safe-area-inset-bottom)] px-4">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href} className="relative group flex flex-col items-center justify-center w-full h-full">
              <Icon
                className={cn(
                  "w-6 h-6 transition-all duration-300",
                  isActive ? "text-blue-400 scale-110" : "text-zinc-500 group-hover:text-zinc-300"
                )}
              />
              <span className={cn(
                "text-[10px] mt-1 font-medium transition-all duration-300",
                isActive ? "text-blue-400 opacity-100" : "text-zinc-500 opacity-0 group-hover:opacity-100"
              )}>
                {label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute -top-1 w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
