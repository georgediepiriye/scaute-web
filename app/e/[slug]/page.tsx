import { notFound } from "next/navigation";
import EventDetailsView from "@/components/events/EventDetailsView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export default async function SlugEventPage({ params }: PageProps) {
  const { slug } = await params;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/events/slug/${slug}`,
      {
        cache: "no-store", // Bypasses the Next.js server routing cache completely
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
      },
    );

    clearTimeout(timeoutId);

    if (res.status === 404) return notFound();
    if (!res.ok) throw new Error(`Fetch status returned error: ${res.status}`);

    const json = await res.json();
    const eventData = json.data?.event;

    // 1. Structural safety boundary check
    if (!eventData) {
      return notFound();
    }

    // 2. Strict explicit approval status validation
    // Matches your schema constraint: approvalStatus: "pending" | "approved" | "rejected"
    if (eventData.approvalStatus !== "approved") {
      return notFound();
    }

    // 3. Optional: Block deactivated or cancelled moves
    if (eventData.isCancelled === true) {
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

    if (
      error.message?.includes("NEXT_HTTP_ERROR_FALLBACK") ||
      error.digest?.includes("NEXT_HTTP_ERROR_FALLBACK")
    ) {
      throw error;
    }

    console.error("Critical Page Error Tracker:", error);
    return notFound();
  }
}
