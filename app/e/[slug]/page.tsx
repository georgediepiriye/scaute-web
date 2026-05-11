import { notFound } from "next/navigation";
import EventDetailsView from "@/components/events/EventDetailsView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SlugEventPage({ params }: PageProps) {
  // Await the params correctly for Next.js 15
  const { slug } = await params;

  // Use a try-catch to prevent the 900ms+ hang from crashing the app
  let eventData = null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/events/slug/${slug}`,
      {
        next: { revalidate: 30 },
        // Set a signal/timeout if possible to avoid the long application-code wait
      },
    );

    if (res.ok) {
      const json = await res.json();
      eventData = json.data?.event;
    }
  } catch (error) {
    console.error("API Fetch Error:", error);
  }

  // If the API returns a 404 or data is missing, trigger Next.js notFound
  if (!eventData) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <EventDetailsView event={eventData} />
    </main>
  );
}
