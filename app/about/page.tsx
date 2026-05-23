"use client";

import { Suspense } from "react";
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
import Footer from "@/components/layout/Footer";

// BRAND COLOR CONSTANTS
const SKAUTE_BLUE = "#0052FF";
const SKAUTE_YELLOW = "#FFD700";

// 1. ISOLATED INNER CONTENT COMPONENT
function AboutPageContent() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-blue-100 antialiased">
      <Navbar />

      <main className="pt-36 pb-32">
        {/* --- SECTION 1: THE STORY (ASYMMETRIC RAW BRUTALIST GRID) --- */}
        <section className="max-w-6xl mx-auto px-6 md:px-8 mb-32">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7 space-y-8">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl"
                style={{ backgroundColor: `${SKAUTE_BLUE}0A` }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: SKAUTE_BLUE }}
                />
                <span
                  className="text-[10px] font-black uppercase tracking-[0.2em]"
                  style={{ color: SKAUTE_BLUE }}
                >
                  Our Origin Story
                </span>
              </div>

              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-[0.85] text-slate-900">
                Born in the <br />
                <span className="relative z-10 inline-block mt-2">
                  Heart of PH City.
                  <span
                    className="absolute bottom-1 left-0 w-full h-3 -z-10 transform -rotate-1"
                    style={{ backgroundColor: SKAUTE_YELLOW }}
                  />
                </span>
              </h1>

              <div className="space-y-6 text-slate-600 font-medium text-base md:text-lg leading-relaxed max-w-xl pt-4">
                <p>
                  Skaute was founded right here in Port Harcourt to eliminate a
                  painful friction: the clunky, manual, and unsecure entry
                  structures delaying the rhythm of local lifestyle experiences.
                </p>
                <p
                  className="border-l-4 pl-4 font-semibold text-slate-800"
                  style={{ borderColor: SKAUTE_BLUE }}
                >
                  We are building a highly integrated geospatial gateway for the
                  best live setups in Rivers State, ensuring event organizers
                  retain 100% control of their revenue while attendees never
                  miss &quot;the move&quot;.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 relative w-full h-[520px] rounded-[3.5rem] overflow-hidden shadow-2xl border-4 border-slate-900 transition-all duration-500 hover:rotate-0 rotate-1 group">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent z-10 transition-opacity group-hover:opacity-20" />
              <Image
                src="https://res.cloudinary.com/dzhfiblg7/image/upload/f_auto,q_auto,w_800/v1778054500/kivo_events/inhouse/tower.png"
                alt="Skaute Operations in Port Harcourt"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
              />
            </div>
          </div>
        </section>

        {/* --- SECTION 2: MISSION & VISION (TACTILE BLOCKS) --- */}
        <section className="bg-slate-900 text-white py-28 border-y-4 border-slate-950 mb-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-6xl mx-auto px-6 md:px-8 grid md:grid-cols-2 gap-12 relative z-10">
            {/* MISSION */}
            <div className="bg-slate-800/40 border border-slate-800 p-10 rounded-[3rem] flex flex-col items-start transition-all hover:border-blue-500/30 group">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-lg transition-transform group-hover:scale-110"
                style={{ backgroundColor: SKAUTE_BLUE }}
              >
                <Target size={28} className="text-white" />
              </div>
              <h3 className="text-3xl font-black uppercase italic tracking-tight mb-4 text-white">
                Our Mission
              </h3>
              <p className="text-slate-400 font-medium text-sm md:text-base leading-relaxed">
                To empower local event creators and venues with
                institutional-grade transaction verification,
                hardware-accelerated access controls, and transparent,
                zero-upfront payment architectures.
              </p>
            </div>

            {/* VISION */}
            <div className="bg-slate-800/40 border border-slate-800 p-10 rounded-[3rem] flex flex-col items-start transition-all hover:border-yellow-500/30 group">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-lg transition-transform group-hover:scale-110"
                style={{ backgroundColor: SKAUTE_YELLOW }}
              >
                <Eye size={28} className="text-slate-950" />
              </div>
              <h3 className="text-3xl font-black uppercase italic tracking-tight mb-4 text-white">
                Our Vision
              </h3>
              <p className="text-slate-400 font-medium text-sm md:text-base leading-relaxed">
                To become the central transactional pulse of entertainment
                culture across the continent, driving the digital transformation
                of African ticketing frameworks starting right here in Nigeria.
              </p>
            </div>
          </div>
        </section>

        {/* --- SECTION 3: THE SKAUTE ADVANTAGE (BRUTALIST CARDS) --- */}
        <section className="max-w-6xl mx-auto px-6 md:px-8 mb-32">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black uppercase italic text-slate-900 tracking-tight">
              The Skaute Advantage
            </h2>
            <div
              className="w-16 h-1.5 mx-auto mt-4 rounded-full"
              style={{ backgroundColor: SKAUTE_BLUE }}
            />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-3">
              Engineered for velocity and complete scale security
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: MapPin,
                title: "Geospatial Discovery",
                desc: "An intelligent 50km radius network tracking layer connecting buyers with high-fidelity live map matrices.",
              },
              {
                icon: ShieldCheck,
                title: "Anti-Fraud Vault",
                desc: "End-to-end encrypted ledger keys preventing secondary market manipulation and duplications.",
              },
              {
                icon: Zap,
                title: "Gate Verification",
                desc: "Ultra-low latency browser-integrated scanning architecture built to process high-density venue lines.",
              },
              {
                icon: Layers,
                title: "Tiered Pass Matrices",
                desc: "Flexible, granular inventory management ranging from generic early-bird tiers to custom-tailored VVIP zones.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] hover:border-slate-900 hover:shadow-[8px_8px_0px_0px_#0052FF] transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="p-3 bg-slate-50 rounded-2xl w-fit mb-6 group-hover:bg-blue-50 transition-colors">
                    <feature.icon
                      size={26}
                      className="group-hover:scale-110 transition-transform"
                      style={{ color: SKAUTE_BLUE }}
                    />
                  </div>
                  <h4 className="font-black uppercase text-sm mb-2 tracking-tight text-slate-900">
                    {feature.title}
                  </h4>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- SECTION 4: CALL TO ACTION (INTERACTIVE HOVER INVERT) --- */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-slate-50 border-2 border-slate-100 rounded-[4rem] p-12 md:p-16 relative overflow-hidden">
            <h2 className="text-4xl md:text-5xl font-black uppercase italic mb-4 text-slate-900 tracking-tight">
              Ready for the move?
            </h2>
            <p className="text-slate-500 font-medium text-sm md:text-base mb-10 max-w-md mx-auto">
              Onboard your venue, list your inventory, and configure custom
              gate-verification tokens in under 5 minutes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto relative z-10">
              <button
                className="w-full sm:w-auto px-10 py-5 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.03] transition-all cursor-pointer border-2"
                style={{
                  backgroundColor: SKAUTE_BLUE,
                  borderColor: SKAUTE_BLUE,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = SKAUTE_YELLOW;
                  e.currentTarget.style.borderColor = SKAUTE_YELLOW;
                  e.currentTarget.style.color = "#0f172a"; // text-slate-900
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = SKAUTE_BLUE;
                  e.currentTarget.style.borderColor = SKAUTE_BLUE;
                  e.currentTarget.style.color = "#ffffff";
                }}
              >
                Get Started
              </button>

              <button className="w-full sm:w-auto px-10 py-5 bg-white border-2 border-slate-200 text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all flex items-center justify-center gap-2 cursor-pointer">
                Explore Events <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// 2. MAIN DEFAULT EXPORT WRAPPED IN SUSPENSE BOUNDARY
export default function AboutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <span
              className="text-lg font-black uppercase tracking-widest italic"
              style={{ color: SKAUTE_BLUE }}
            >
              skaute
            </span>
          </div>
        </div>
      }
    >
      <AboutPageContent />
    </Suspense>
  );
}
