"use client";
import Hero from "@/components/landing/Hero";
import SocialProofTicker from "@/components/landing/SocialProofTicker";
import Neighborhoods from "@/components/landing/Neighborhoods";
import VibeCTA from "@/components/landing/VibeCTA";
import Navbar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import LiveFeed from "@/components/landing/LiveFeed";
import Ticketing from "@/components/landing/Ticketing";
import Features from "@/components/landing/Features";
import HostBenefits from "@/components/landing/HostBenefits";
import HostBridge from "@/components/landing/HostBridge";

export default function Home() {
  return (
    <main className="bg-[#FFFFFF] text-[#0A0A0A] selection:bg-primary selection:text-white">
      <Navbar />
      <Hero />
      <LiveFeed />
      <HostBridge />
      <Ticketing />
      <Features />

      <VibeCTA />
      <HostBenefits />
      <SocialProofTicker />
      <Neighborhoods />

      <Footer />
    </main>
  );
}
