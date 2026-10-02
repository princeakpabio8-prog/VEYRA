"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Mic, Package, User } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    { id: "home",        label: "Home",       href: "/",              icon: <Home size={22} strokeWidth={1.75} /> },
    { id: "agents",      label: "Agents",     href: "/agents",        icon: <LayoutGrid size={22} strokeWidth={1.75} /> },
    { id: "voice",       label: "",           href: null,             icon: <Mic size={22} strokeWidth={2} />, isCenter: true },
    { id: "employees",   label: "Employees",  href: "/my-employees",  icon: <Package size={22} strokeWidth={1.75} /> },
    { id: "account",     label: "Account",    href: "/account",       icon: <User size={22} strokeWidth={1.75} /> },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
      style={{ backgroundColor: "#f5f0e8", borderTop: "1px solid #ddd6cc" }}
    >
      <div className="mx-auto flex max-w-lg items-end justify-around px-2 pt-2 pb-3">
        {tabs.map((tab) => {
          if (tab.isCenter) {
            return (
              <button
                key={tab.id}
                aria-label="Voice action"
                className="relative -mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-ink shadow-float text-ivory transition-transform active:scale-95"
              >
                {tab.icon}
              </button>
            );
          }

          const isActive = tab.href === "/"
            ? pathname === "/"
            : pathname.startsWith(tab.href!);

          return (
            <Link
              key={tab.id}
              href={tab.href!}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
                isActive ? "text-ink" : "text-ink-tertiary"
              }`}
            >
              {tab.icon}
              <span className={`text-[0.6rem] font-medium ${isActive ? "text-ink" : "text-ink-tertiary"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
