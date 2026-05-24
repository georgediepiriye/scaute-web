"use client";

import { Suspense, useState } from "react";
import {
  Check,
  HelpCircle,
  ChevronRight,
  MapPin,
  ShieldCheck,
  Zap,
  Info,
} from "lucide-react";

import Navbar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";

// BRAND COLOR CONSTANTS
const SKAUTE_BLUE = "#0052FF";
const SKAUTE_YELLOW = "#FFD700";
const SKAUTE_FEE_PERCENT = 5.5;

// 1. ISOLATED INNER PRICING CONTENT
function PricingPageContent() {
  const [ticketPrice, setTicketPrice] = useState<number>(5000);

  // 5.5% integrated fee model
  const skauteFee = ticketPrice * (SKAUTE_FEE_PERCENT / 100);

  const buyerPaysIfPassedOn = ticketPrice + skauteFee;

  const organizerTakesHomeIfAbsorbed = ticketPrice - skauteFee;

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-blue-100 overflow-x-hidden">
      <Navbar />

      <main className="pt-24 md:pt-32 pb-16 md:pb-24">
        {/* --- SECTION 1: HERO HEADER --- */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 text-center mb-12 md:mb-16 relative">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ backgroundColor: `${SKAUTE_BLUE}10` }}
          >
            <span
              className="text-[10px] font-black uppercase tracking-[0.2em]"
              style={{ color: SKAUTE_BLUE }}
            >
              Zero Risk. 100% Free Setup.
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter italic mb-6 leading-[0.95] md:leading-[0.9]">
            NO UPFRONT FEES. <br />
            WE ONLY WIN WHEN{" "}
            <span style={{ color: SKAUTE_BLUE }}>YOU WIN.</span>
          </h1>

          <p className="text-slate-500 font-medium max-w-2xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed">
            Get complete access to Africa&apos;s modern event management engine
            instantly. List unlimited events, deploy tracking, and scale your
            audience without paying a single kobo out of pocket.
          </p>

          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg md:max-w-3xl h-[200px] md:h-[250px] bg-gradient-to-b from-blue-50 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />
        </section>

        {/* --- SECTION 2: THE PRICING GRID --- */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mb-16 md:mb-24 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
          {/* WHAT'S FREE SIDE (LEFT) */}
          <div className="lg:col-span-7 bg-white rounded-[2rem] md:rounded-[3rem] p-6 sm:p-8 md:p-12 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-black uppercase italic mb-2 tracking-tight">
                What&apos;s Always Free?
              </h2>

              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-6 md:mb-8">
                Full infrastructure access from day one
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  {
                    icon: MapPin,
                    title: "Smart Discovery",
                    desc: "Automated 50km radius matching maps local buyers across PH City instantly.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Anti-Fraud Vault",
                    desc: "Encrypted secure ticket validation and bulletproof processing infrastructure.",
                  },
                  {
                    icon: Zap,
                    title: "Door Scanning Engine",
                    desc: "Lightning-fast hardware-accelerated browser scanning for your gate team.",
                  },
                  {
                    icon: HelpCircle,
                    title: "Flexible Layouts",
                    desc: "Tailored multi-format frameworks optimized for physical and nightlife events.",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="mt-1 flex-shrink-0">
                      <item.icon size={20} style={{ color: SKAUTE_BLUE }} />
                    </div>

                    <div>
                      <h4 className="font-black uppercase text-xs mb-1 tracking-tight">
                        {item.title}
                      </h4>

                      <p className="text-slate-500 text-xs font-medium leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 md:mt-12 pt-6 border-t border-slate-100 flex items-start gap-4">
              <div className="mt-0.5 p-2 rounded-xl bg-slate-50 flex-shrink-0">
                <Info size={16} className="text-slate-400" />
              </div>

              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                <strong className="text-slate-600">Hosting free events?</strong>{" "}
                Skaute remains 100% free for both you and your attendees
                forever. We do not extract fees from free tickets.
              </p>
            </div>
          </div>

          {/* THE CUT CARD (RIGHT) */}
          <div className="lg:col-span-5 bg-slate-900 text-white rounded-[2rem] md:rounded-[3rem] p-6 sm:p-8 md:p-12 shadow-2xl flex flex-col justify-between relative overflow-hidden border border-slate-800">
            <div
              className="absolute top-0 right-0 font-black text-[9px] uppercase tracking-[0.2em] px-4 py-2 md:px-5 md:py-2.5 rounded-bl-2xl text-slate-900"
              style={{ backgroundColor: SKAUTE_YELLOW }}
            >
              Simple Pricing
            </div>

            <div>
              <h3 className="text-lg md:text-xl font-black uppercase tracking-tight italic text-slate-300 mt-2 lg:mt-0">
                One Simple Plan
              </h3>

              <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] mt-1">
                No subscriptions • No hidden costs
              </p>

              <div className="my-6 md:my-10 flex items-baseline gap-1">
                <span
                  className="text-6xl md:text-7xl font-black italic tracking-tighter"
                  style={{ color: SKAUTE_YELLOW }}
                >
                  5.5%
                </span>

                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider ml-2">
                  per ticket sold
                </span>
              </div>

              <div
                className="border-l-2 pl-4 py-2 my-6 bg-slate-800/30 rounded-r-xl pr-2"
                style={{ borderColor: SKAUTE_BLUE }}
              >
                <p className="text-[11px] text-slate-300 font-medium leading-relaxed italic">
                  This single fee already includes both Skaute&apos;s platform
                  fee and Paystack payment processing charges. No extra
                  transaction fees added later.
                </p>
              </div>

              <ul className="space-y-4 text-xs font-semibold tracking-tight text-slate-300 mt-6 md:mt-8">
                <li className="flex items-center gap-3">
                  <Check size={14} style={{ color: SKAUTE_YELLOW }} />
                  Includes Paystack processing fees
                </li>

                <li className="flex items-center gap-3">
                  <Check size={14} style={{ color: SKAUTE_YELLOW }} />
                  Unlimited free event publishing
                </li>

                <li className="flex items-center gap-3">
                  <Check size={14} style={{ color: SKAUTE_YELLOW }} />
                  Instant attendee payments & payouts
                </li>

                <li className="flex items-center gap-3">
                  <Check size={14} style={{ color: SKAUTE_YELLOW }} />
                  Smart discovery, ticketing & scanning included
                </li>
              </ul>
            </div>

            <div className="mt-8 md:mt-12">
              <button
                className="w-full py-4 md:py-5 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all cursor-pointer block text-center border-2"
                style={{
                  backgroundColor: SKAUTE_BLUE,
                  borderColor: SKAUTE_BLUE,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = SKAUTE_YELLOW;
                  e.currentTarget.style.borderColor = SKAUTE_YELLOW;
                  e.currentTarget.style.color = "#0f172a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = SKAUTE_BLUE;
                  e.currentTarget.style.borderColor = SKAUTE_BLUE;
                  e.currentTarget.style.color = "#ffffff";
                }}
              >
                Create Event Now
              </button>

              <p className="text-center text-slate-500 text-[10px] font-bold uppercase tracking-wider mt-3">
                Setup in 2 minutes • No card required
              </p>
            </div>
          </div>
        </section>

        {/* --- SECTION 3: INTERACTIVE FEE CALCULATOR --- */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 mb-16 md:mb-24">
          <div className="text-center mb-8 md:mb-10">
            <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tight">
              Calculate Your Payout Models
            </h3>

            <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-1">
              Transparent pricing with integrated payment processing
            </p>
          </div>

          <div className="bg-white border border-slate-100 rounded-[2rem] md:rounded-[3rem] p-6 sm:p-8 md:p-12 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-start">
            {/* Input Slider Element */}
            <div className="md:sticky md:top-28">
              <label className="block font-black uppercase text-xs mb-3 tracking-tight text-slate-700">
                Your Ticket Target Value (₦)
              </label>

              <input
                type="number"
                value={ticketPrice || ""}
                onChange={(e) => setTicketPrice(Number(e.target.value))}
                className="w-full text-2xl md:text-3xl font-black border-b-2 border-slate-200 focus:border-blue-600 outline-none pb-2 mb-6 transition-colors tracking-tight text-slate-900"
                placeholder="0"
              />

              <input
                type="range"
                min="500"
                max="50000"
                step="500"
                value={ticketPrice}
                onChange={(e) => setTicketPrice(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-wider">
                <span>₦500</span>
                <span>₦50,000</span>
              </div>
            </div>

            {/* Calculations */}
            <div className="space-y-4 w-full">
              {/* MODEL A */}
              <div className="rounded-[1.5rem] p-5 bg-blue-50/40 border border-blue-100/50 space-y-3">
                <span className="inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-blue-600 text-white rounded">
                  Model A: Attendee Pays Fee
                </span>

                <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                  <span>Skaute + Payment Fee ({SKAUTE_FEE_PERCENT}%)</span>

                  <span>₦{skauteFee.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center border-t border-slate-200/60 pt-2">
                  <span className="text-xs font-black text-slate-800 uppercase">
                    Attendee Total Pays
                  </span>

                  <span className="text-base font-black text-blue-600">
                    ₦{buyerPaysIfPassedOn.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[11px] text-emerald-600 font-bold pt-1">
                  <span>Your Net Home Payout:</span>

                  <span>₦{ticketPrice.toLocaleString()} (100%)</span>
                </div>
              </div>

              {/* MODEL B */}
              <div className="rounded-[1.5rem] p-5 bg-amber-50/40 border border-amber-100/50 space-y-3">
                <span className="inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-zinc-800 text-white rounded">
                  Model B: Host Absorbs Fee
                </span>

                <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                  <span>Ticket Price Displayed</span>

                  <span>₦{ticketPrice.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                  <span>Skaute + Payment Fee ({SKAUTE_FEE_PERCENT}%)</span>

                  <span>- ₦{skauteFee.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center border-t border-slate-200/60 pt-2">
                  <span className="text-xs font-black text-slate-800 uppercase">
                    Attendee Total Pays
                  </span>

                  <span className="text-base font-black text-zinc-800">
                    ₦{ticketPrice.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[11px] text-blue-600 font-bold pt-1">
                  <span>Your Net Home Payout:</span>

                  <span>₦{organizerTakesHomeIfAbsorbed.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 4: FINAL CTA --- */}
        <section className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-black uppercase italic mb-6 md:mb-8">
            Protect your revenue margins
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto sm:max-w-none">
            <button
              className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all cursor-pointer border-2"
              style={{
                backgroundColor: SKAUTE_BLUE,
                borderColor: SKAUTE_BLUE,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = SKAUTE_YELLOW;
                e.currentTarget.style.borderColor = SKAUTE_YELLOW;
                e.currentTarget.style.color = "#0f172a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = SKAUTE_BLUE;
                e.currentTarget.style.borderColor = SKAUTE_BLUE;
                e.currentTarget.style.color = "#ffffff";
              }}
            >
              Get Started Free
            </button>

            <button className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 bg-white border-2 border-slate-200 text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer">
              Talk to Sales <ChevronRight size={16} />
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// 2. MAIN DEFAULT EXPORT WITH SUSPENSE
export default function PricingPage() {
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
      <PricingPageContent />
    </Suspense>
  );
}
