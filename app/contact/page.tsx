/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Send,
  MessageSquare,
  Phone,
  Cpu,
  CheckCircle2,
} from "lucide-react";
import { LuFacebook, LuInstagram, LuX } from "react-icons/lu";
import Navbar from "@/components/layout/NavBar";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";

// BRAND COLOR CONSTANTS
const KIVO_BLUE = "#0052FF";
const KIVO_YELLOW = "#FFD700";

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFB] font-sans text-gray-900 selection:bg-[#0052FF]/20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 lg:pt-48 pb-20">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-24">
          {/* LEFT COLUMN: BRANDING & INFO */}
          <div className="lg:col-span-5 space-y-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
              style={{ backgroundColor: `${KIVO_BLUE}15`, color: KIVO_BLUE }}
            >
              <Cpu size={12} className="animate-pulse" /> Support Hub
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-8">
                Got questions? <br />
                <span style={{ color: KIVO_BLUE }} className="italic">
                  Ask Kivo.
                </span>
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed max-w-sm">
                Our team is standing by to help you navigate the city or grow
                your brand in Port Harcourt.
              </p>
            </motion.div>

            {/* CONTACT CARDS */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid gap-4"
            >
              <ContactInfoCard
                icon={<Mail size={20} />}
                label="Email"
                value="hello@kivo.social"
              />
              <ContactInfoCard
                icon={<Phone size={20} />}
                label="Phone"
                value="+234 812 345 6789"
              />
              <ContactInfoCard
                icon={<MessageSquare size={20} />}
                label="WhatsApp"
                value="Chat with Scout"
                isLink
              />
            </motion.div>

            {/* SOCIALS SECTION */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-4"
            >
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 ml-1">
                Follow the Move
              </p>
              <div className="flex gap-4">
                <SocialLink icon={<LuInstagram size={20} />} href="#" />
                <SocialLink icon={<LuX size={20} />} href="#" />
                <SocialLink icon={<LuFacebook size={20} />} href="#" />
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: THE FORM */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-7 bg-white p-8 md:p-14 rounded-[48px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-gray-100 relative overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onSubmit={handleSubmit}
                  className="space-y-6 relative z-10"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <InputField
                      label="Full Name"
                      placeholder="John Doe"
                      type="text"
                    />
                    <InputField
                      label="Email"
                      placeholder="john@example.com"
                      type="email"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest ml-1">
                      Topic
                    </label>
                    <select className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#0052FF] outline-none transition-all font-medium text-sm appearance-none cursor-pointer">
                      <option>General Support</option>
                      <option>Partner with Kivo</option>
                      <option>Event Hosting Inquiry</option>
                      <option>Report a Bug</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest ml-1">
                      Message
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="How can we help you see the city better?"
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#0052FF] outline-none transition-all font-medium text-sm resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-5 text-white font-black rounded-2xl transition-all active:scale-[0.99] flex items-center justify-center gap-3 shadow-xl hover:shadow-blue-500/20"
                    style={{ backgroundColor: KIVO_BLUE }}
                  >
                    Send Message <Send size={18} />
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-16 text-center space-y-6"
                >
                  <div
                    className="w-24 h-24 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/30"
                    style={{ backgroundColor: KIVO_BLUE }}
                  >
                    <CheckCircle2 size={40} />
                  </div>
                  <h2 className="text-3xl font-black tracking-tight">
                    Message Received!
                  </h2>
                  <p className="text-gray-500 max-w-xs mx-auto">
                    Kivo Scout is processing your request. Check your inbox
                    soon.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-sm font-black uppercase tracking-widest hover:underline"
                    style={{ color: KIVO_BLUE }}
                  >
                    Send another
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Branded Decoration */}
            <div
              className="absolute top-[-10%] right-[-10%] w-64 h-64 rounded-full blur-3xl opacity-10"
              style={{ backgroundColor: KIVO_BLUE }}
            />
          </motion.div>
        </div>
      </main>

      <MobileNav />
      <Footer />
    </div>
  );
}

function ContactInfoCard({ icon, label, value, isLink }: any) {
  return (
    <div className="flex items-center gap-5 p-4 rounded-3xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100 group">
      <div
        className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:text-white transition-all"
        style={{ color: KIVO_BLUE }}
        // Handling group hover styles via inline CSS for brand consistency
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = KIVO_BLUE)
        }
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
      >
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
          {label}
        </p>
        <p
          className="font-bold"
          style={{
            color: isLink ? KIVO_BLUE : "inherit",
            cursor: isLink ? "pointer" : "default",
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function SocialLink({ icon, href }: { icon: React.ReactNode; href: string }) {
  return (
    <a
      href={href}
      className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 transition-all shadow-sm hover:border-[#0052FF] hover:text-[#0052FF]"
    >
      {icon}
    </a>
  );
}

function InputField({ label, placeholder, type }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest ml-1">
        {label}
      </label>
      <input
        required
        type={type}
        placeholder={placeholder}
        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#0052FF] outline-none transition-all font-medium text-sm shadow-sm"
      />
    </div>
  );
}
