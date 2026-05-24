/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiMenu, HiX } from "react-icons/hi";
import { motion, AnimatePresence, Variants } from "framer-motion";

import {
  Bell,
  ChevronRight,
  LogOut,
  User as UserIcon,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../auth/AuthGuard";

export default function Navbar() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
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
    setMobileMenuOpen(false);

    try {
      const token = localStorage.getItem("skaute_token");

      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Server cleanup during logout failed:", error);
    } finally {
      if (logout) {
        logout();
      } else {
        localStorage.removeItem("skaute_token");
        localStorage.removeItem("user");
        localStorage.removeItem("skaute_onboarding_lock");

        document.cookie =
          "skaute_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";

        document.cookie =
          "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";

        router.push("/auth/signin");
      }
    }
  };

  const navLinks = [
    { href: "/map", label: "Live Map" },
    { href: "/discover", label: "Discover" },
    { href: "/create", label: "Host Event" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "Our Story" },
    { href: "/contact", label: "Support" },
  ];

  const containerVariants: Variants = {
    close: { opacity: 0 },
    open: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    close: {
      opacity: 0,
      x: -15,
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 22,
      },
    },
  };

  return (
    <nav className="fixed top-0 w-full z-40 bg-black border-b border-zinc-900 unified-nav-transition py-3">
      <div className="max-w-7xl mx-auto px-8 md:px-12 flex justify-between items-center relative z-10">
        {/* LOGO */}
        <Link href="/" className="flex items-center cursor-pointer group">
          <div className="relative w-44 h-44 -my-14 -ml-6 group-hover:scale-[1.02] transition-transform duration-300 ease-out">
            <Image
              src="/images/skaute_logo.webp"
              alt="Skaute Brand Logo"
              fill
              className="object-contain"
              sizes="176px"
              priority
            />
          </div>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-12">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-zinc-400 font-black text-xs hover:text-blue-500 transition-all uppercase tracking-[0.25em]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* RIGHT UTILITIES */}
        <div className="flex items-center gap-6 relative z-20">
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-5">
                  {user?.role === "admin" && (
                    <Link
                      href="/admin/dashboard"
                      className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all"
                    >
                      <ShieldCheck size={14} className="text-white" />
                      Admin
                    </Link>
                  )}

                  <Bell
                    size={22}
                    className="text-zinc-400 cursor-pointer hover:text-white hidden sm:block transition-colors"
                  />

                  <Link
                    href="/profile"
                    className="w-11 h-11 rounded-xl overflow-hidden relative border border-zinc-800 hover:border-blue-500 transition-all bg-zinc-900 flex items-center justify-center"
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
                      <UserIcon size={22} className="text-zinc-500" />
                    )}
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="hidden md:flex w-11 h-11 items-center justify-center rounded-xl bg-zinc-900 text-zinc-400 hover:text-red-400 hover:bg-red-950/20 transition-all border border-zinc-800 hover:border-red-900/50"
                    title="Sign Out"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-4">
                  <Link
                    href="/auth/signin"
                    className="px-6 py-3.5 text-zinc-400 font-black text-xs uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Log In
                  </Link>

                  <Link
                    href="/auth/signup"
                    className="px-8 py-3.5 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/10"
                  >
                    Join Skaute
                  </Link>
                </div>
              )}
            </>
          )}

          {/* MOBILE MENU BUTTON */}
          <button
            className={`md:hidden w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 active:scale-90 shadow-sm border ${
              isMobileMenuOpen
                ? "bg-blue-600 text-white border-blue-600 rotate-90"
                : "bg-zinc-900 text-zinc-200 border-zinc-800 hover:bg-zinc-800"
            }`}
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 w-full h-[100dvh] bg-black z-50 md:hidden flex flex-col"
          >
            {/* TOP HEADER */}
            <div className="w-full px-6 py-3 flex justify-between items-center border-b border-zinc-900 bg-black">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-0"
              >
                <div className="relative w-44 h-44 -my-14 -ml-6">
                  <Image
                    src="/images/skaute_logo.webp"
                    alt="Skaute Brand Logo"
                    fill
                    className="object-contain"
                    sizes="176px"
                    priority
                  />
                </div>
              </Link>

              <button
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-600 text-white border border-blue-600 rotate-90 active:scale-90 transition-transform"
                onClick={() => setMobileMenuOpen(false)}
              >
                <HiX size={24} />
              </button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 flex flex-col justify-between px-8 pt-8 pb-4 overflow-y-auto bg-black">
              <div>
                {!loading && user && (
                  <div className="pb-6 flex items-center gap-4 border-b border-zinc-900 mb-6">
                    <div className="w-14 h-14 rounded-xl bg-zinc-900 relative overflow-hidden flex-shrink-0 border border-zinc-800">
                      {user?.image ? (
                        <Image
                          src={user.image}
                          alt="User Profile"
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : (
                        <UserIcon
                          className="m-auto mt-3 text-zinc-500"
                          size={22}
                        />
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="font-black text-xl tracking-tight text-white leading-tight">
                        {user.name}
                      </p>

                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-[11px] font-black uppercase text-blue-500 tracking-widest inline-flex items-center gap-1 mt-1"
                      >
                        Dashboard <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                )}

                {/* NAV LINKS */}
                <motion.div
                  variants={containerVariants}
                  initial="close"
                  animate="open"
                  className="flex flex-col gap-6 py-2"
                >
                  {!loading && user?.role === "admin" && (
                    <motion.div variants={itemVariants}>
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-blue-500 font-black text-3xl tracking-tighter uppercase flex items-center justify-between group transition-colors hover:text-blue-400 border-b border-zinc-900 pb-3 mb-2"
                      >
                        <span className="flex items-center gap-3 transition-transform duration-200 group-hover:translate-x-1">
                          <ShieldCheck size={32} className="text-blue-500" />
                          Admin Console
                        </span>

                        <ChevronRight
                          size={26}
                          className="text-zinc-600 group-hover:text-blue-500 transition-colors"
                        />
                      </Link>
                    </motion.div>
                  )}

                  {navLinks.map((link) => (
                    <motion.div key={link.href} variants={itemVariants}>
                      <Link
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-zinc-200 font-black text-3xl tracking-tighter uppercase flex items-center justify-between group transition-colors hover:text-blue-500"
                      >
                        <span className="transition-transform duration-200 group-hover:translate-x-1">
                          {link.label}
                        </span>

                        <ChevronRight
                          size={22}
                          className="text-zinc-700 group-hover:text-blue-500 transition-colors"
                        />
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* FOOTER */}
              <div className="mt-14 pt-6 pb-[max(2rem,env(safe-area-inset-bottom))] border-t border-zinc-900 bg-black sticky bottom-0">
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full min-h-[64px] px-6 bg-zinc-900 border border-red-950/40 text-red-400 font-black text-xs uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] hover:bg-red-950/10"
                  >
                    <LogOut size={18} />
                    Sign Out Account
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <Link
                      href="/auth/signin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="min-h-[64px] px-4 flex items-center justify-center text-center text-zinc-300 border border-zinc-800 font-black text-xs uppercase tracking-[0.2em] bg-zinc-900 rounded-2xl active:scale-[0.98] transition-all hover:bg-zinc-800 hover:text-white"
                    >
                      Log In
                    </Link>

                    <Link
                      href="/auth/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="min-h-[64px] px-4 flex items-center justify-center text-center bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl active:scale-[0.98] transition-all hover:bg-blue-700 shadow-lg shadow-blue-600/10"
                    >
                      Join Skaute
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
