"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Compass, PlusCircle, Headphones } from "lucide-react"; // Swapped Bot for Headphones

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Map", href: "/map", icon: Map },
    { name: "Discover", href: "/discover", icon: Compass },
    { name: "Create", href: "/create", icon: PlusCircle },
    { name: "Help", href: "/contact", icon: Headphones }, // Updated to point directly to support channels
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 
      bg-white/80 backdrop-blur-2xl rounded-t-[2.5rem] md:hidden
      border-t border-blue-100 shadow-[0_-8px_40px_rgba(37,99,235,0.08)]"
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const IconComponent = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center px-5 py-2 transition-all duration-300 relative ${
              isActive
                ? "text-blue-600 scale-105"
                : "text-slate-400 active:scale-90"
            }`}
          >
            {/* Background Pill for Active State */}
            {isActive && (
              <div className="absolute inset-0 bg-blue-50 rounded-full -z-10" />
            )}

            <IconComponent
              size={22}
              className={`mb-1 ${isActive ? "stroke-[2.5px]" : "stroke-[2px]"}`}
            />
            <span
              className={`text-[10px] font-black uppercase tracking-widest ${
                isActive ? "opacity-100" : "opacity-60"
              }`}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
