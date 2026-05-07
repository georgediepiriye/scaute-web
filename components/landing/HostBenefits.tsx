"use client";
import { Ticket, Zap, ShieldCheck } from "lucide-react";
import Link from "next/link"; // Import Link for navigation

export default function HostBenefits() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto border-t border-slate-100">
      <div className="bg-slate-950 rounded-[4rem] p-10 md:p-20 text-white relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85] mb-8">
              Host for <span className="text-amber-400">Zero ₦aira.</span>
            </h2>
            <p className="text-xl text-slate-400 font-bold mb-10">
              Whether it&apos;s a free hangout at Pleasure Park or a ticketed
              rave in GRA, Kivo is built to get you started without a budget.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <Ticket className="text-white" />
                </div>
                <div>
                  <h4 className="font-black uppercase tracking-tight">
                    100% Free for Free Events
                  </h4>
                  <p className="text-slate-500 font-bold text-sm text-balance">
                    Hosting a community link-up? Use our ticketing and QR
                    check-in for free.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center shrink-0 text-slate-950">
                  <Zap size={24} fill="currentColor" />
                </div>
                <div>
                  <h4 className="font-black uppercase tracking-tight">
                    We only get paid when you do
                  </h4>
                  <p className="text-slate-500 font-bold text-sm text-balance">
                    For paid events, we take a small fee only on successful
                    sales. No upfront deposits. Ever.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 rounded-[3rem] p-8 md:p-12 border-4 border-white/10 relative">
            <div className="space-y-4">
              <div className="bg-slate-950 p-6 rounded-2xl border-2 border-amber-400">
                <p className="text-[10px] font-black uppercase text-amber-400 mb-1">
                  Pricing Model
                </p>
                <p className="text-2xl font-black italic uppercase tracking-tighter">
                  PAY-AS-YOU-EARN
                </p>
              </div>
              <ul className="space-y-3 font-bold text-sm">
                <li className="flex items-center gap-2">
                  ✅ Unlimited free tickets
                </li>
                <li className="flex items-center gap-2">
                  ✅ Instant dashboard access
                </li>
                <li className="flex items-center gap-2">
                  ✅ Zero monthly subscription
                </li>
              </ul>

              {/* Wrap button with Link */}
              <Link href="/create" className="block w-full">
                <button className="w-full bg-white text-slate-950 py-5 rounded-2xl font-black uppercase tracking-widest mt-4 hover:bg-amber-400 transition-colors">
                  Create Your Event
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
