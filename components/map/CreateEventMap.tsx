"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import mapboxgl, { Map as MapboxMap, Marker } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// BRAND COLOR CONSTANTS
const KIVO_BLUE = "#0052FF";
const KIVO_YELLOW = "#FFD700";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

export interface MapRef {
  flyToUser: () => void;
}

interface CreateEventMapProps {
  selectedCoords: { lat: number; lng: number } | null;
  onSelect: (coords: { lat: number; lng: number }) => void;
}

const CreateEventMap = forwardRef<MapRef, CreateEventMapProps>(
  ({ selectedCoords, onSelect }, ref) => {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<MapboxMap | null>(null);
    const markerRef = useRef<Marker | null>(null);

    useImperativeHandle(ref, () => ({
      flyToUser: () => {
        if (mapRef.current && markerRef.current) {
          const lngLat = markerRef.current.getLngLat();
          mapRef.current.flyTo({ center: [lngLat.lng, lngLat.lat], zoom: 13 });
        }
      },
    }));

    // Function to create or update the custom Kivo marker
    const updateMarker = (
      map: MapboxMap,
      coords: { lat: number; lng: number },
    ) => {
      if (markerRef.current) {
        markerRef.current.setLngLat([coords.lng, coords.lat]);
      } else {
        const el = document.createElement("div");
        el.style.width = "28px";
        el.style.height = "28px";
        el.style.backgroundColor = KIVO_BLUE; // Updated to Kivo Blue
        el.style.borderRadius = "50%";
        el.style.border = `4px solid ${KIVO_YELLOW}`; // Kivo Yellow accent border
        el.style.boxShadow = "0 8px 20px rgba(0,82,255,0.4)"; // Themed shadow
        el.style.cursor = "pointer";

        markerRef.current = new mapboxgl.Marker(el)
          .setLngLat([coords.lng, coords.lat])
          .addTo(map);
      }
    };

    useEffect(() => {
      if (!mapContainer.current || mapRef.current) return;

      // Default center set to Port Harcourt, Rivers State
      const initialCenter: [number, number] = selectedCoords
        ? [selectedCoords.lng, selectedCoords.lat]
        : [7.0498, 4.8156]; // Port Harcourt Coordinates

      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11", // Using dark mode for a sleeker "Kivo" tech look
        center: initialCenter,
        zoom: selectedCoords ? 15 : 12,
      });

      mapRef.current = map;

      map.on("load", () => {
        // Hide POIs for a cleaner discovery-focused look
        map.getStyle().layers?.forEach((layer) => {
          if (layer.type === "symbol" && layer.id.includes("poi")) {
            map.setLayoutProperty(layer.id, "visibility", "none");
          }
        });

        if (selectedCoords) {
          updateMarker(map, selectedCoords);
        }
      });

      // Click to select location
      map.on("click", (e) => {
        const coords = { lat: e.lngLat.lat, lng: e.lngLat.lng };
        onSelect(coords);
        updateMarker(map, coords);
      });

      return () => {
        map.remove();
        mapRef.current = null;
        markerRef.current = null;
      };
    }, []);

    // Handle updates to selectedCoords from the outside (GPS or manual search)
    useEffect(() => {
      if (!selectedCoords || !mapRef.current) return;

      updateMarker(mapRef.current, selectedCoords);

      mapRef.current.flyTo({
        center: [selectedCoords.lng, selectedCoords.lat],
        zoom: 15,
        speed: 1.5,
        essential: true,
      });
    }, [selectedCoords]);

    return (
      <div
        ref={mapContainer}
        className="w-full h-full min-h-[500px] rounded-[32px] overflow-hidden border-2 border-gray-100"
      />
    );
  },
);

CreateEventMap.displayName = "CreateEventMap";
export default CreateEventMap;
