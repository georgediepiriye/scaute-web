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
        router.push("/auth/signin");
      }
    }
  };

  const navLinks = [
    { href: "/map", label: "Live Map" },
    { href: "/discover", label: "Discover" },
    { href: "/create", label: "Host Event" },
    { href: "/about", label: "Our Story" },
    { href: "/contact", label: "Support" },
  ];

  const containerVariants: Variants = {
    open: {
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    close: { opacity: 0, x: -15 },
    open: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 260, damping: 22 },
    },
  };

  return (
    /* Changed background from bg-white/80 backdrop-blur-2xl to fully opaque bg-white */
    <nav className="fixed top-0 w-full z-[500] bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-3 flex justify-between items-center relative z-[600]">
        <Link href="/" className="flex items-center gap-0 cursor-pointer group">
          <div className="relative w-16 h-16 -mr-3.5 group-hover:scale-[1.03] transition-transform duration-300 ease-out z-0">
            <Image
              src="/images/skaute_logo.jpg"
              alt="Skaute Icon"
              fill
              className="object-contain"
              sizes="64px"
              priority
            />
          </div>

          <span className="relative z-10 text-2xl font-black font-sans text-black tracking-tighter uppercase transition-colors group-hover:text-gray-700">
            skaute
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-500 font-black text-[11px] hover:text-blue-600 transition-all uppercase tracking-[0.2em]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-4 relative z-[610]">
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-4">
                  {/* ADMIN LINK - DESKTOP */}
                  {user?.role === "admin" && (
                    <Link
                      href="/admin/dashboard"
                      className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all"
                    >
                      <ShieldCheck size={14} className="text-white" />
                      Admin
                    </Link>
                  )}

                  <Bell
                    size={20}
                    className="text-gray-400 cursor-pointer hover:text-gray-900 hidden sm:block"
                  />
                  <Link
                    href="/profile"
                    className="w-10 h-10 rounded-xl overflow-hidden relative border border-gray-200 hover:border-blue-600 transition-all bg-gray-50 flex items-center justify-center"
                  >
                    {user?.image ? (
                      <Image
                        src={user.image}
                        alt="Profile"
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <UserIcon size={20} className="text-gray-400" />
                    )}
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="hidden md:flex w-10 h-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all border border-gray-200 hover:border-red-200"
                    title="Sign Out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <Link
                    href="/auth/signin"
                    className="px-5 py-3 text-gray-600 font-black text-[11px] uppercase tracking-widest hover:text-gray-900 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-7 py-3 bg-blue-600 text-white font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/10"
                  >
                    Join Skaute
                  </Link>
                </div>
              )}
            </>
          )}

          {/* MOBILE MENU TOGGLE BUTTON */}
          <button
            className={`md:hidden w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-300 active:scale-90 shadow-sm border ${
              isMobileMenuOpen
                ? "bg-black text-white border-black rotate-90"
                : "bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100"
            }`}
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <HiX size={22} /> : <HiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* LIGHT SYSTEM MOBILE OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 w-full h-[100dvh] bg-white z-[500] md:hidden flex flex-col"
          >
            {/* Soft Ambient Background Highlights */}
            <div className="absolute top-0 left-[-10%] w-[60%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-[-10%] w-[50%] h-[35%] bg-gray-100 blur-[100px] rounded-full pointer-events-none" />

            {/* Main Scrolling Canvas Frame */}
            <div className="flex-1 flex flex-col justify-between pt-28 px-8 pb-8 overflow-y-auto relative z-10">
              <div>
                {/* Profile Widget */}
                {!loading && user && (
                  <div className="pb-6 flex items-center gap-4 border-b border-gray-100 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 relative overflow-hidden flex-shrink-0 border border-gray-200">
                      {user?.image ? (
                        <Image
                          src={user.image}
                          alt="User"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <UserIcon
                          className="m-auto mt-3 text-gray-400"
                          size={18}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-lg tracking-tight text-gray-900 leading-tight">
                        {user.name}
                      </p>
                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-[10px] font-black uppercase text-blue-600 tracking-widest inline-flex items-center gap-1 mt-0.5"
                      >
                        Dashboard <ChevronRight size={10} />
                      </Link>
                    </div>
                  </div>
                )}

                {/* Nav Links List */}
                <motion.div
                  variants={containerVariants}
                  initial="close"
                  animate="open"
                  className="flex flex-col gap-5 py-2"
                >
                  {/* Admin Link Inserted dynamically if condition matches */}
                  {!loading && user?.role === "admin" && (
                    <motion.div variants={itemVariants}>
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-blue-600 font-black text-3xl tracking-tighter uppercase flex items-center justify-between group transition-colors hover:text-blue-700 border-b border-gray-100 pb-2 mb-2"
                      >
                        <span className="flex items-center gap-3 transition-transform duration-200 group-hover:translate-x-1">
                          <ShieldCheck size={28} className="text-blue-600" />
                          Admin Console
                        </span>
                        <ChevronRight
                          size={24}
                          className="text-gray-400 group-hover:text-blue-600 transition-colors"
                        />
                      </Link>
                    </motion.div>
                  )}

                  {navLinks.map((link) => (
                    <motion.div key={link.href} variants={itemVariants}>
                      <Link
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-gray-800 font-black text-3xl tracking-tighter uppercase flex items-center justify-between group transition-colors hover:text-blue-600"
                      >
                        <span className="transition-transform duration-200 group-hover:translate-x-1">
                          {link.label}
                        </span>
                        <ChevronRight
                          size={20}
                          className="text-gray-300 group-hover:text-blue-600 transition-colors"
                        />
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Fixed Footer Block */}
              <div className="mt-8 pt-6 border-t border-gray-100 bg-white sticky bottom-0">
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full py-4 bg-gray-50 border border-red-100 text-red-500 font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:bg-red-50"
                  >
                    <LogOut size={15} />
                    Sign Out Account
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <Link
                      href="/auth/signin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-4 text-center text-gray-700 border border-gray-200 font-black text-xs uppercase tracking-widest bg-gray-50 rounded-xl active:scale-[0.98] transition-all hover:bg-gray-100 hover:text-gray-900"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-4 text-center bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl active:scale-[0.98] transition-all hover:bg-blue-700 shadow-lg shadow-blue-600/10"
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
