"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type LinkItem = {
  href: string;
  label: string;
  highlight?: boolean;
};

export function AppHeader({
  links,
  userNombre,
  userRole,
  rightContent,
}: {
  links?: LinkItem[];
  userNombre?: string;
  userRole?: string;
  rightContent?: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-zinc-200/60 bg-white shadow-soft">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Image src="/logo gestek.png" alt="Gestek" width={32} height={32} className="h-8 w-auto md:h-9" />
          </Link>
          <Link href="/dashboard">
            <span className="text-base font-bold text-brand-secondary md:text-lg">GESTEK</span>
          </Link>
        </div>

        {/* Desktop nav */}
        {links && links.length > 0 && (
          <nav className="hidden items-center gap-4 md:flex">
            {links.map((link) =>
              link.highlight ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-brand-primary hover:text-brand-primary-dark transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-zinc-500 hover:text-brand-primary transition-colors"
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>
        )}

        {/* Desktop right side */}
        <div className="hidden items-center gap-4 md:flex">
          {userNombre && (
            <span className="text-sm text-zinc-500 truncate max-w-[120px]">{userNombre}</span>
          )}
          {userRole && (
            <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-medium text-brand-primary shrink-0">
              {userRole === "administrador" ? "Admin" : userRole === "tecnico" ? "Técnico" : "Cliente"}
            </span>
          )}
          {rightContent}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-2 md:hidden"
          aria-label="Menú"
        >
          <svg className="h-5 w-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-zinc-200/60 bg-white px-4 py-4 md:hidden">
          {userNombre && (
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-700">{userNombre}</span>
              {userRole && (
                <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-medium text-brand-primary">
                  {userRole === "administrador" ? "Admin" : userRole === "tecnico" ? "Técnico" : "Cliente"}
                </span>
              )}
            </div>
          )}
          {links && links.length > 0 && (
            <nav className="flex flex-col gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    link.highlight
                      ? "bg-brand-primary/10 text-brand-primary"
                      : "text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
          <div className="mt-3 flex flex-col gap-2">
            {rightContent}
          </div>
        </div>
      )}
    </header>
  );
}
