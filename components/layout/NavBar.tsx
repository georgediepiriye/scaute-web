/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiMenu, HiX } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

import {
  Zap,
  Bell,
  ChevronRight,
  LogOut,
  User as UserIcon,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../auth/AuthGuard";

export default function Navbar() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleSignOut = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      localStorage.removeItem("user");
      setMobileMenuOpen(false);

      // Perform a full hard refresh or push so the AuthProvider session re-triggers
      window.location.href = "/auth/signin";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navLinks = [
    { href: "/map", label: "Live Map" },
    { href: "/discover", label: "Discover" },
    { href: "/create", label: "Host Event" },
    { href: "/about", label: "Our Story" },
    { href: "/contact", label: "Support" },
  ];

  return (
    <nav className="fixed top-0 w-full z-[500] bg-white/80 backdrop-blur-2xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-5 flex justify-between items-center relative z-[110]">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer group">
          <div className="relative flex items-center justify-center w-10 h-10 bg-blue-600 rounded-2xl rotate-3 group-hover:rotate-0 transition-transform duration-300">
            <Zap size={22} className="text-amber-400 fill-amber-400" />
          </div>
          <span className="text-2xl font-black text-slate-950 tracking-tighter">
            Kivo
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-slate-500 font-black text-[11px] hover:text-blue-600 transition-all uppercase tracking-[0.2em]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-4">
          {/* Only render action layout fields once AuthProvider completes its check */}
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-4">
                  {/* ADMIN LINK - DESKTOP */}
                  {user?.role === "admin" && (
                    <Link
                      href="/admin/dashboard"
                      className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-950 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all"
                    >
                      <ShieldCheck size={14} className="text-blue-400" />
                      Admin
                    </Link>
                  )}

                  <Bell
                    size={20}
                    className="text-slate-400 cursor-pointer hover:text-blue-600 hidden sm:block"
                  />
                  <Link
                    href="/profile"
                    className="w-11 h-11 rounded-2xl overflow-hidden relative border-2 border-slate-100 hover:border-blue-600 transition-all bg-slate-50 flex items-center justify-center"
                  >
                    {user?.image ? (
                      <Image
                        src={user.image}
                        alt="Profile"
                        fill
                        className="object-cover"
                        sizes="44px"
                      />
                    ) : (
                      <UserIcon size={22} className="text-slate-400" />
                    )}
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="hidden md:flex w-11 h-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-slate-100 hover:border-red-100"
                    title="Sign Out"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <Link
                    href="/auth/signin"
                    className="px-5 py-3 text-slate-950 font-black text-[11px] uppercase tracking-widest hover:text-blue-600 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-8 py-3.5 bg-blue-600 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-200 hover:bg-slate-950 hover:shadow-none transition-all active:scale-95"
                  >
                    Join Kivo
                  </Link>
                </div>
              )}
            </>
          )}

          <button
            className="md:hidden w-12 h-12 flex items-center justify-center bg-slate-950 rounded-2xl text-white transition-all active:scale-90 shadow-lg"
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <HiX size={26} /> : <HiMenu size={26} />}
          </button>
        </div>
      </div>

      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 w-full h-screen bg-white z-[100] md:hidden flex flex-col pt-28"
          >
            <div className="flex-1 overflow-y-auto px-8 pb-12 flex flex-col">
              {/* User Section */}
              {!loading && user && (
                <div className="py-8 flex items-center gap-5 border-b border-slate-100 mb-6">
                  <div className="w-16 h-16 rounded-[24px] bg-slate-100 relative overflow-hidden flex-shrink-0 border-2 border-slate-50">
                    {user?.image ? (
                      <Image
                        src={user.image}
                        alt="User"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <UserIcon
                        className="m-auto mt-5 text-slate-300"
                        size={24}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-2xl tracking-tight leading-none mb-1 text-slate-950">
                      {user?.name || "Kivo User"}
                    </p>
                    <div className="flex items-center gap-3">
                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-blue-600 text-[11px] font-black uppercase tracking-widest"
                      >
                        My Dashboard
                      </Link>
                      {user?.role === "admin" && (
                        <>
                          <span className="text-slate-300">•</span>
                          <Link
                            href="/admin/dashboard"
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-slate-950 text-[11px] font-black uppercase tracking-widest flex items-center gap-1"
                          >
                            Admin Console
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="flex flex-col gap-2">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className="group flex items-center justify-between py-6 border-b border-slate-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="text-3xl font-black tracking-tighter text-slate-900 group-hover:text-blue-600 transition-colors">
                        {link.label}
                      </span>
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                        <ChevronRight size={20} />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Bottom Actions */}
              <div className="mt-auto pt-12 space-y-4">
                {!loading && (
                  <>
                    {user ? (
                      <button
                        onClick={handleSignOut}
                        className="w-full py-6 rounded-[32px] bg-red-50 text-red-500 font-black text-center text-lg flex items-center justify-center gap-3 active:scale-95 transition-all"
                      >
                        <LogOut size={20} /> Sign Out
                      </button>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <Link
                          href="/auth/signup"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block w-full py-6 rounded-[32px] bg-blue-600 text-white font-black text-center text-xl shadow-2xl shadow-blue-200 active:scale-95 transition-all"
                        >
                          Join the Vibe
                        </Link>
                        <Link
                          href="/auth/signin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block w-full py-6 rounded-[32px] bg-slate-900 text-white font-black text-center text-xl active:scale-95 transition-all"
                        >
                          Sign In
                        </Link>
                      </div>
                    )}
                  </>
                )}

                {/* Location Footer */}
                <div className="flex items-center justify-center gap-2 py-6 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                  <MapPin size={12} />
                  Port Harcourt, Nigeria
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
