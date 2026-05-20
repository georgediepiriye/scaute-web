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
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ZoomIn, X } from "lucide-react";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

// BRAND THEME CONSTANTS
const SKAUTE_THEME = {
  blue: "#2563eb",
  amber: "#fbbf24", // Amber Gold
  live: "#22c55e", // Signal Green
  slate: "#1e293b", // Professional Slate
};

// 💡 Geographic Bounding Box for Rivers State, Nigeria
// [minLng, minLat, maxLng, maxLat] roughly mapping the state perimeter
const RIVERS_STATE_BOUNDS = {
  minLng: 6.3,
  maxLng: 7.6,
  minLat: 4.3,
  maxLat: 5.45,
};

const DEFAULT_CENTER: [number, number] = [7.035, 4.815]; // Port Harcourt

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
    const [showBoundaryModal, setShowBoundaryModal] = useState(false);

    const markersRef = useRef<{
      [key: string]: { marker: Marker; status: string };
    }>({});
    const hotspotMarkersRef = useRef<Marker[]>([]);

    const resetToRiversState = () => {
      mapRef.current?.flyTo({
        center: DEFAULT_CENTER,
        zoom: 12.5,
        speed: 1.5,
        essential: true,
      });
      setShowBoundaryModal(false);
    };

    useImperativeHandle(ref, () => ({
      flyToUser: () => geolocateControlRef.current?.trigger(),
      flyTo: (coords: { lat: number; lng: number }) => {
        mapRef.current?.flyTo({
          center: [coords.lng, coords.lat],
          zoom: 16.5,
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
        center: DEFAULT_CENTER,
        zoom: 13.5,
      });

      // We turn trackUserLocation off by default to stop the map from forcefully locking or jumping away from Rivers State automatically if they are outside
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false,
        showUserHeading: true,
        showUserLocation: true,
      });

      map.addControl(geolocate);
      geolocateControlRef.current = geolocate;

      // 💡 Check user coordinates when geolocation fires
      geolocate.on("geolocate", (e: any) => {
        const { longitude, latitude } = e.coords;

        const isInsideRivers =
          longitude >= RIVERS_STATE_BOUNDS.minLng &&
          longitude <= RIVERS_STATE_BOUNDS.maxLng &&
          latitude >= RIVERS_STATE_BOUNDS.minLat &&
          latitude <= RIVERS_STATE_BOUNDS.maxLat;

        if (!isInsideRivers) {
          // Force camera to stay or return back to Port Harcourt instead of panning somewhere else
          map.flyTo({
            center: DEFAULT_CENTER,
            zoom: 12.5,
          });
          setShowBoundaryModal(true);
        }
      });

      map.on("load", () => {
        const streetLayers = [
          "road-label",
          "road-primary",
          "road-secondary-tertiary",
          "road-street",
          "road-minor",
        ];

        streetLayers.forEach((layer) => {
          if (map.getLayer(layer)) {
            if (layer.includes("label")) {
              map.setPaintProperty(layer, "text-color", "#334155");
            } else {
              map.setPaintProperty(layer, "line-color", "#cbd5e1");
            }
          }
        });

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
            "circle-color": SKAUTE_THEME.slate,
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
                spot.title || spot.name || "Skaute Hotspot",
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

    // --- EVENT MARKER MANAGEMENT ---
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

          const el = document.createElement("div");
          el.className = "cursor-pointer";

          const inner = document.createElement("div");
          inner.className = isLive
            ? "relative flex flex-col items-center animate-bounce duration-1000"
            : "relative flex flex-col items-center transition-transform hover:scale-125";

          const dotColor = isLive ? SKAUTE_THEME.live : SKAUTE_THEME.amber;
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
      <div className="w-full h-full relative font-sans">
        <div ref={mapContainer} className="w-full h-full" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-white/30 via-transparent to-transparent" />

        {/* 💡 BOUNDARY NOTIFICATION MODAL */}
        <AnimatePresence>
          {showBoundaryModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[400] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto"
            >
              <motion.div
                initial={{ scale: 0.92, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 15 }}
                className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl relative overflow-hidden"
              >
                <button
                  onClick={() => setShowBoundaryModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-black p-2 transition-colors rounded-full hover:bg-gray-100"
                >
                  <X size={18} />
                </button>

                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-5 mt-2">
                  <MapPin size={24} className="animate-pulse" />
                </div>

                <h3 className="text-xl font-black tracking-tight text-slate-900 mb-2">
                  Outside Operational Area
                </h3>

                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  Skaute maps are currently only active within{" "}
                  <strong className="text-slate-800">Rivers State</strong>. Zoom
                  into or view the Port Harcourt area grid directly to discover
                  and view ongoing events.
                </p>

                <button
                  onClick={resetToRiversState}
                  className="w-full py-4 bg-black text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-lg shadow-black/10"
                >
                  <ZoomIn size={14} />
                  Explore Rivers State
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

RealMap.displayName = "RealMap";
export default RealMap;
