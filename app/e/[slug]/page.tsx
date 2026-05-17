import { notFound } from "next/navigation";
import EventDetailsView from "@/components/events/EventDetailsView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Next.js 15 instruction: Prevents Next.js from crashing during the build phase
// by deferring ungenerated dynamic event paths to be resolved at server runtime.
export const dynamicParams = true;

/**
 * Kivo Event Slug Page
 * Optimized for Next.js 15 with strict error handling and
 * performance safety nets.
 */
export default async function SlugEventPage({ params }: PageProps) {
  // 1. Await params for Next.js 15 compliance
  const { slug } = await params;

  // 2. Fetch with a timeout signal to prevent long application-code hangs
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/events/slug/${slug}`,
      {
        next: { revalidate: 30 },
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    clearTimeout(timeoutId);

    // 3. Handle specific status codes immediately
    if (res.status === 404) {
      return notFound();
    }

    if (!res.ok) {
      // For 500s or other severe errors, throw to the nearest error.tsx boundary
      throw new Error(`Event fetch failed with status: ${res.status}`);
    }

    const json = await res.json();
    const eventData = json.data?.event;

    // 4. Final safety check on the data object
    if (!eventData) {
      return notFound();
    }

    return (
      <main className="min-h-screen bg-white">
        <EventDetailsView event={eventData} />
      </main>
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    clearTimeout(timeoutId);

    // 5. Short-circuit: Let Next.js's internal HTTP error handling run its redirect logic
    // without triggering false alarms in your server logging framework.
    if (
      error.message?.includes("NEXT_HTTP_ERROR_FALLBACK") ||
      error.digest?.includes("NEXT_HTTP_ERROR_FALLBACK")
    ) {
      throw error;
    }

    // Handle AbortError (Timeout)
    if (error.name === "AbortError") {
      console.error(`Fetch timed out for slug: ${slug}`);
      return notFound();
    }

    console.error("API Fetch Error:", error);

    // In production, triggering a fallback 404 is safer than crashing the app
    return notFound();
  }
}
