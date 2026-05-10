/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import SectionContainer from "./SectionContainer";
import { Flame } from "lucide-react";
import EventCard from "../cards/EventCard";
import { useRouter } from "next/navigation";

export default function HotListSection({
  data,
  getKm,
  location,
  formatTime,
}: any) {
  const router = useRouter();
  if (!data?.length) return null;

  return (
    <SectionContainer
      title="The Hot List"
      subtitle="Trending right now"
      icon={Flame}
      iconColor="#FF4500"
    >
      {data.map((e: any) => (
        <div
          key={e._id}
          // min-w-[85vw] is key for mobile; it shows the card + a tiny peek of the next one
          className="min-w-[85vw] sm:min-w-[420px] shrink-0 snap-start cursor-pointer"
          onClick={() => router.push(`/discover/${e._id}`)}
        >
          <EventCard
            {...e}
            isTrending={true}
            location={
              e.eventFormat === "online"
                ? "Online"
                : `${getKm(location.lat, location.lng, e.location?.coordinates?.[1], e.location?.coordinates?.[0])}km • Port Harcourt`
            }
            time={formatTime(e.startDate)}
          />
        </div>
      ))}
    </SectionContainer>
  );
}
