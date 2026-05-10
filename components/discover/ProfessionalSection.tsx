/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import SectionContainer from "./SectionContainer";
import { Briefcase } from "lucide-react";
import EventCard from "../cards/EventCard";
import { useRouter } from "next/navigation"; // Add this

export default function ProfessionalSection({
  data,
  getKm,
  location,
  formatTime,
}: any) {
  const router = useRouter(); // Add this
  if (!data?.length) return null;

  return (
    <SectionContainer
      title="Growth & Tech"
      subtitle="Build for the future"
      icon={Briefcase}
      iconColor="#0052FF"
    >
      {data.map((e: any) => (
        <div
          key={e._id}
          className="min-w-[320px] sm:min-w-[400px] snap-start cursor-pointer" // Add cursor-pointer
          onClick={() => router.push(`/discover/${e._id}`)} // Add navigation
        >
          <EventCard
            {...e}
            location={e.location?.neighborhood || "Port Harcourt"}
            time={formatTime(e.startDate)}
            buttonText="Get Access"
          />
        </div>
      ))}
    </SectionContainer>
  );
}
