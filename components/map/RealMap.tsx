/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import mapboxgl, {
  Map as MapboxMap,
  Marker,
  GeolocateControl,
} from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Event } from "@/lib/events";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

// BRAND THEME CONSTANTS
const KIVO_THEME = {
  blue: "#2563eb", // Electric Blue
  amber: "#fbbf24", // Amber Gold
  live: "#22c55e", // Signal Green
  slate: "#1e293b", // Professional Slate
};

// Helper to get category-specific markers
const getHotspotMarkerHTML = (category: string, title: string) => {
  const icons: Record<string, string> = {
    nightlife: "🎵",
    lounge: "🍻",
    dining: "🍴",
    cafe: "☕",
    workspace: "💻",
    arts: "🎨",
    wellness: "🧘",
    retail: "🛍️",
  };

  const icon = icons[category] || "📍";

  return `
    <div class="group relative cursor-pointer flex items-center justify-center transition-all duration-300 active:scale-90">
      <div class="absolute inset-0 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-400/40 transition-all"></div>
      <div class="relative w-10 h-10 bg-white border-2 border-blue-600 rounded-2xl shadow-xl flex items-center justify-center text-lg group-hover:border-blue-400 transition-colors">
        ${icon}
      </div>
      <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none z-50">
        ${title}
      </div>
    </div>
  `;
};

export interface MapRef {
  flyToUser: () => void;
  flyTo: (coords: { lat: number; lng: number }) => void;
}

interface RealMapProps {
  onSelect: (event: Event) => void;
  onSelectHotspot: (hotspot: any) => void;
  filteredEvents: Event[];
  showHotspots: boolean;
  hotspotCategory: string;
}

const RealMap = forwardRef<MapRef, RealMapProps>(
  (
    {
      onSelect,
      onSelectHotspot,
      filteredEvents,
      showHotspots,
      hotspotCategory,
    },
    ref,
  ) => {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<MapboxMap | null>(null);
    const geolocateControlRef = useRef<GeolocateControl | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const markersRef = useRef<{
      [key: string]: { marker: Marker; status: string };
    }>({});
    const hotspotMarkersRef = useRef<Marker[]>([]);

    useImperativeHandle(ref, () => ({
      flyToUser: () => geolocateControlRef.current?.trigger(),
      flyTo: (coords: { lat: number; lng: number }) => {
        mapRef.current?.flyTo({
          center: [coords.lng, coords.lat],
          zoom: 15.5,
          speed: 1.2,
          essential: true,
        });
      },
    }));

    // --- INITIALIZATION ---
    useEffect(() => {
      if (!mapContainer.current || mapRef.current) return;
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [7.035, 4.815], // Port Harcourt
        zoom: 11.5,
      });

      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
        showUserLocation: true,
      });

      map.addControl(geolocate);
      geolocateControlRef.current = geolocate;

      map.on("load", () => {
        map.addSource("events", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
          cluster: true,
          clusterMaxZoom: 15,
          clusterRadius: 50,
        });

        map.addLayer({
          id: "clusters",
          type: "circle",
          source: "events",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": KIVO_THEME.slate,
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20,
              5,
              25,
              15,
              35,
            ],
            "circle-stroke-width": 3,
            "circle-stroke-color": "#ffffff",
          },
        });

        map.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "events",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 14,
          },
          paint: { "text-color": "#ffffff" },
        });

        map.addLayer({
          id: "unclustered-point",
          type: "circle",
          source: "events",
          filter: ["!", ["has", "point_count"]],
          paint: { "circle-radius": 0 },
        });

        mapRef.current = map;
        setIsMapReady(true);
        geolocate.trigger();
      });

      return () => {
        map.remove();
      };
    }, []);

    // --- HOTSPOT MANAGEMENT ---
    useEffect(() => {
      if (!isMapReady || !mapRef.current) return;
      hotspotMarkersRef.current.forEach((m) => m.remove());
      hotspotMarkersRef.current = [];
      if (!showHotspots) return;

      const fetchHotspots = async () => {
        try {
          const categoryQuery =
            hotspotCategory !== "all" ? `?category=${hotspotCategory}` : "";
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/hotspots${categoryQuery}`,
          );
          const result = await res.json();
          if (result.status === "success") {
            result.data.hotspots.forEach((spot: any) => {
              const el = document.createElement("div");
              el.innerHTML = getHotspotMarkerHTML(
                spot.category,
                spot.title || spot.name || "Kivo Hotspot",
              );
              el.onclick = (e) => {
                e.stopPropagation();
                onSelectHotspot(spot);
              };
              const marker = new mapboxgl.Marker({
                element: el,
                anchor: "center",
              })
                .setLngLat([
                  spot.location.coordinates[0],
                  spot.location.coordinates[1],
                ])
                .addTo(mapRef.current!);
              hotspotMarkersRef.current.push(marker);
            });
          }
        } catch (err) {
          console.error("Hotspot fetch failed", err);
        }
      };
      fetchHotspots();
    }, [isMapReady, showHotspots, hotspotCategory, onSelectHotspot]);

    // --- EVENT MARKER MANAGEMENT (ALIVE & JUMPING) ---
    useEffect(() => {
      if (!isMapReady || !mapRef.current) return;
      const map = mapRef.current;

      const features = filteredEvents.map((e: any) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [e.lng, e.lat] },
        properties: { id: e._id, ...e },
      }));

      (map.getSource("events") as mapboxgl.GeoJSONSource).setData({
        type: "FeatureCollection",
        features: features as any,
      });

      const updateMarkers = () => {
        const activeIds = new Set();
        const unclusteredFeatures = map.queryRenderedFeatures({
          layers: ["unclustered-point"],
        });

        unclusteredFeatures.forEach((feature) => {
          const props = feature.properties as any;
          const id = props.id;
          const coords = (feature.geometry as any).coordinates;
          activeIds.add(id);

          const now = new Date().getTime();
          const isLive =
            now >= new Date(props.startDate).getTime() &&
            now <= new Date(props.endDate).getTime();
          const currentStatus = isLive ? "live" : "upcoming";

          if (
            markersRef.current[id] &&
            markersRef.current[id].status === currentStatus
          )
            return;
          if (markersRef.current[id]) markersRef.current[id].marker.remove();

          // Outer container (Mapbox positioning)
          const el = document.createElement("div");
          el.className = "cursor-pointer";

          // Inner container (Tailwind animations)
          const inner = document.createElement("div");
          inner.className = isLive
            ? "relative flex flex-col items-center animate-bounce duration-1000"
            : "relative flex flex-col items-center transition-transform hover:scale-125";

          const dotColor = isLive ? KIVO_THEME.live : KIVO_THEME.amber;
          const pulseColor = isLive
            ? "rgba(34, 197, 94, 0.6)"
            : "rgba(251, 191, 36, 0.4)";

          const labelHtml = isLive
            ? `<span class="absolute -top-8 bg-green-500 text-[10px] font-black px-2 py-0.5 rounded-full border border-white text-white shadow-xl whitespace-nowrap z-20">LIVE</span>`
            : "";

          inner.innerHTML = `
            ${labelHtml}
            <div class="relative flex items-center justify-center">
              <div class="absolute w-10 h-10 rounded-full blur-md animate-ping" style="background-color: ${pulseColor}"></div>
              <div class="w-5 h-5 rounded-full border-2 border-white shadow-lg relative z-10" style="background-color: ${dotColor}"></div>
            </div>
          `;

          el.appendChild(inner);
          el.onclick = () => onSelect(props);

          const marker = new mapboxgl.Marker({ element: el })
            .setLngLat(coords)
            .addTo(map);
          markersRef.current[id] = { marker, status: currentStatus };
        });

        Object.keys(markersRef.current).forEach((id) => {
          if (!activeIds.has(id)) {
            markersRef.current[id].marker.remove();
            delete markersRef.current[id];
          }
        });
      };

      map.on("render", updateMarkers);
      return () => {
        map.off("render", updateMarkers);
      };
    }, [isMapReady, filteredEvents, onSelect]);

    return (
      <div className="w-full h-full relative">
        <div ref={mapContainer} className="w-full h-full" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-white/30 via-transparent to-transparent" />
      </div>
    );
  },
);

RealMap.displayName = "RealMap";
export default RealMap;
