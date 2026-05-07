"use client";

import Image from "next/image";
import {
  Zap,
  ShieldCheck,
  MapPin,
  Target,
  Eye,
  ChevronRight,
  Layers,
} from "lucide-react";
import Navbar from "@/components/layout/NavBar";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";

// BRAND COLOR CONSTANTS
const KIVO_BLUE = "#0052FF";
const KIVO_YELLOW = "#FFD700";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-blue-100">
      <Navbar />

      <main className="pt-32 pb-24">
        {/* --- SECTION 1: THE STORY --- */}
        <section className="max-w-6xl mx-auto px-4 md:px-8 mb-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{ backgroundColor: `${KIVO_BLUE}10` }}
              >
                <span
                  className="text-[10px] font-black uppercase tracking-[0.2em]"
                  style={{ color: KIVO_BLUE }}
                >
                  Our Origin Story
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic mb-8 leading-[0.9]">
                Born in the <br />
                <span style={{ color: KIVO_BLUE }}>Heart of PH City.</span>
              </h1>
              <div className="space-y-4 text-slate-600 font-medium leading-relaxed">
                <p>
                  Kivo was founded in Port Harcourt to solve a simple problem:
                  making local events easy to find and secure to attend.
                </p>
                <p>
                  We are building a gateway for the best experiences in Rivers
                  State, ensuring organizers have the tools they need and
                  attendees never miss &quot;the move&quot;.
                </p>
              </div>
            </div>
            <div className="relative h-[500px] w-full rounded-[3rem] overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
              <Image
                src="https://res.cloudinary.com/dzhfiblg7/image/upload/f_auto,q_auto,w_800/v1778054500/kivo_events/inhouse/tower.png"
                alt="Kivo Operations in Port Harcourt"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* --- SECTION 2: MISSION & VISION --- */}
        <section className="bg-slate-50 py-24 border-y border-slate-100 mb-24">
          <div className="max-w-6xl mx-auto px-4 md:px-8 grid md:grid-cols-2 gap-16">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                style={{ backgroundColor: KIVO_BLUE }}
              >
                <Target size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-black uppercase italic mb-4">
                Our Mission
              </h3>
              <p className="text-slate-500 font-medium">
                To empower local organizers with professional tools and provide
                seamless access to the events that define our city&apos;s
                lifestyle.
              </p>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                style={{ backgroundColor: KIVO_YELLOW }}
              >
                <Eye size={32} className="text-black" />
              </div>
              <h3 className="text-2xl font-black uppercase italic mb-4">
                Our Vision
              </h3>
              <p className="text-slate-500 font-medium">
                To become the central pulse of event culture across Africa,
                starting with a revolution in how Nigeria discovers and enjoys
                live experiences.
              </p>
            </div>
          </div>
        </section>

        {/* --- SECTION 3: FEATURES --- */}
        <section className="max-w-6xl mx-auto px-4 md:px-8 mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black uppercase italic text-slate-900">
              The Kivo Advantage
            </h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">
              Built for security and speed
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: MapPin,
                title: "Smart Discovery",
                desc: "Find events near you with integrated logistics tools.",
              },
              {
                icon: ShieldCheck,
                title: "Anti-Fraud",
                desc: "Advanced ticket validation and secure payment processing.",
              },
              {
                icon: Zap,
                title: "Quick Scanning",
                desc: "Lightning-fast hardware-accelerated entry for organizers.",
              },
              {
                icon: Layers,
                title: "Tiered Passes",
                desc: "Easily manage categories from Early Bird to VIP.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:border-blue-200 transition-colors group"
              >
                <feature.icon
                  size={32}
                  className="mb-6 group-hover:scale-110 transition-transform"
                  style={{ color: KIVO_BLUE }}
                />
                <h4 className="font-black uppercase text-sm mb-2">
                  {feature.title}
                </h4>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* --- SECTION 4: CTA --- */}
        <section className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black uppercase italic mb-8">
            Ready for the move?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              className="w-full sm:w-auto px-10 py-5 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all"
              style={{ backgroundColor: KIVO_BLUE }}
            >
              Get Started
            </button>
            <button className="w-full sm:w-auto px-10 py-5 bg-white border-2 border-slate-200 text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              Explore Events <ChevronRight size={16} />
            </button>
          </div>
        </section>
      </main>

      <Footer />

      <MobileNav />
    </div>
  );
}
