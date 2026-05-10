"use client";

import { ReactNode, useRef } from "react";
import { ChevronLeft, ChevronRight, LucideIcon } from "lucide-react";

interface SectionContainerProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor: string;
  children: ReactNode;
}

export default function SectionContainer({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  children,
}: SectionContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth * 0.8
          : scrollLeft + clientWidth * 0.8;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  // We align this with the Header's px-6 (which is 24px)
  // to ensure the first card starts exactly where the icon starts.
  const gutterAlignment = "calc((100vw - 1152px) / 2 + 24px)";

  return (
    <section className="mb-24 w-full overflow-hidden">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-[22px] flex items-center justify-center shrink-0 shadow-sm"
              style={{ backgroundColor: `${iconColor}20`, color: iconColor }}
            >
              <Icon size={28} />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-gray-900 leading-none mb-1">
                {title}
              </h2>
              {subtitle && (
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-3 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-3 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        style={{
          // On mobile, use standard px-6 (24px).
          // On large screens, align with the max-w-6xl container edge.
          paddingLeft: `max(24px, ${gutterAlignment})`,
          scrollPaddingLeft: `max(24px, ${gutterAlignment})`,
        }}
        className="flex gap-6 overflow-x-auto no-scrollbar pb-8 snap-x snap-mandatory scroll-smooth w-full pr-12"
      >
        {children}

        {/* Spacer at the end */}
        <div className="min-w-[100px] shrink-0 h-1" aria-hidden="true" />
      </div>
    </section>
  );
}
