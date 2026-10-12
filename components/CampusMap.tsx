'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CampusEvent } from '@/types';
import { downloadEventICS } from '@/utils/calendar';
import { MapPin, Calendar, Clock, Users, ExternalLink, Sparkles, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface CampusMapProps {
  events: CampusEvent[];
  selectedEventId?: string | null;
  onSelectEvent?: (event: CampusEvent) => void;
  // Optional coordinate picker mode for event creation
  isPickerMode?: boolean;
  onPickLocation?: (lat: number, lng: number, placeName?: string) => void;
  height?: string;
}

export const CampusMap: React.FC<CampusMapProps> = ({
  events,
  selectedEventId,
  onSelectEvent,
  isPickerMode = false,
  onPickLocation,
  height = '580px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedPinCoord, setSelectedPinCoord] = useState<{ lat: number; lng: number } | null>(null);

  // Default campus center coordinates (Bahria University / Campus quadrangle)
  const defaultCenter = { lat: 33.7183, lng: 73.0300 };

  useEffect(() => {
    let isMounted = true;

    // Dynamically load Leaflet on client side
    const initMap = async () => {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = (await import('leaflet')).default;

      // Clean up previous instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize map
      const map = L.map(mapContainerRef.current, {
        center: [defaultCenter.lat, defaultCenter.lng],
        zoom: 16,
        zoomControl: true,
      });

      // CartoDB Dark Matter / Stadia / OpenStreetMap Tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      // Handle map clicks in coordinate picker mode
      if (isPickerMode && onPickLocation) {
        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          setSelectedPinCoord({ lat, lng });
          onPickLocation(lat, lng);
        });
      }

      mapInstanceRef.current = map;
      if (isMounted) setMapLoaded(true);
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isPickerMode]);

  // Update markers when events change or map is loaded
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || typeof window === 'undefined') return;

    const renderMarkers = async () => {
      const L = (await import('leaflet')).default;
      const map = mapInstanceRef.current;

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      // Category color mapping
      const categoryColors: Record<string, { bg: string; border: string; glow: string }> = {
        Tech: { bg: '#3b82f6', border: '#1d4ed8', glow: 'rgba(59, 130, 246, 0.4)' },
        Sports: { bg: '#f97316', border: '#c2410c', glow: 'rgba(249, 115, 22, 0.4)' },
        Drama: { bg: '#a855f7', border: '#7e22ce', glow: 'rgba(168, 85, 247, 0.4)' },
        'Free Food': { bg: '#10b981', border: '#047857', glow: 'rgba(16, 185, 129, 0.4)' },
        Workshops: { bg: '#ec4899', border: '#be185d', glow: 'rgba(236, 72, 153, 0.4)' },
        Music: { bg: '#eab308', border: '#a16207', glow: 'rgba(234, 179, 8, 0.4)' },
        Academic: { bg: '#6366f1', border: '#4338ca', glow: 'rgba(99, 102, 241, 0.4)' },
      };

      const now = new Date();

      events.forEach((event) => {
        const startTime = new Date(event.start_time);
        const endTime = new Date(event.end_time);
        const isHappeningNow =
          now >= startTime && now <= endTime ||
          (startTime.getTime() - now.getTime() > 0 &&
            startTime.getTime() - now.getTime() <= 2 * 60 * 60 * 1000);

        const colors = categoryColors[event.category] || categoryColors.Tech;

        // Custom pulsing marker icon HTML
        const iconHtml = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">
            ${
              isHappeningNow
                ? `<div style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; background-color: ${colors.bg}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
                : ''
            }
            <div style="
              width: 32px; 
              height: 32px; 
              border-radius: 9999px; 
              background: linear-gradient(135deg, ${colors.bg}, ${colors.border}); 
              border: 2px solid white; 
              box-shadow: 0 4px 12px ${colors.glow}; 
              display: flex; 
              align-items: center; 
              justify-content: center;
              color: white; 
              font-weight: bold; 
              font-size: 14px;
              cursor: pointer;
            ">
              ${event.category === 'Free Food' ? '🍕' : event.category === 'Sports' ? '⚽' : event.category === 'Drama' ? '🎭' : '⚡'}
            </div>
            ${
              isHappeningNow
                ? `<div style="position: absolute; top: -2px; right: -2px; width: 10px; height: 10px; background-color: #10b981; border: 2px solid white; border-radius: 9999px;"></div>`
                : ''
            }
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-event-marker',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          popupAnchor: [0, -22],
        });

        const marker = L.marker([event.latitude, event.longitude], { icon: customIcon }).addTo(map);

        // Rich Popup Card
        const popupContent = document.createElement('div');
        popupContent.className = 'camppulse-popup';
        popupContent.style.minWidth = '240px';
        popupContent.style.padding = '8px 4px';
        popupContent.style.fontFamily = 'system-ui, sans-serif';

        popupContent.innerHTML = `
          <div style="margin-bottom: 8px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
              <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 2px 8px; border-radius: 6px; background: ${colors.bg}22; color: ${colors.border}; border: 1px solid ${colors.bg}44;">
                ${event.category}
              </span>
              ${
                isHappeningNow
                  ? `<span style="font-size: 10px; font-weight: 700; background: #10b98122; color: #047857; padding: 2px 6px; border-radius: 4px; border: 1px solid #10b98144;">🔥 HAPPENING NOW</span>`
                  : ''
              }
            </div>
            <h4 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 4px 0 2px 0; line-height: 1.2;">
              ${event.title}
            </h4>
            <p style="font-size: 12px; color: #475569; margin: 0 0 6px 0;">
              ${event.society?.name || 'Campus Society'}
            </p>
          </div>
          
          <div style="font-size: 12px; color: #334155; margin-bottom: 10px; display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span>📍</span> <strong>${event.location_name}</strong>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span>⏰</span> <span>${new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          <div style="display: flex; gap: 6px;">
            <button id="ics-btn-${event.id}" style="
              flex: 1; 
              background: #4f46e5; 
              color: white; 
              border: none; 
              padding: 6px 10px; 
              border-radius: 6px; 
              font-size: 11px; 
              font-weight: 600; 
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 4px;
            ">
              📅 Add to Calendar (.ics)
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);

        // Bind ICS export event listener when popup opens
        marker.on('popupopen', () => {
          const btn = document.getElementById(`ics-btn-${event.id}`);
          if (btn) {
            btn.onclick = (e) => {
              e.stopPropagation();
              downloadEventICS(event);
            };
          }
          if (onSelectEvent) {
            onSelectEvent(event);
          }
        });

        markersRef.current.push(marker);

        // If this event was selected, pan and open popup
        if (selectedEventId === event.id) {
          map.panTo([event.latitude, event.longitude], { animate: true });
          marker.openPopup();
        }
      });
    };

    renderMarkers();
  }, [events, mapLoaded, selectedEventId]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700 shadow-xl bg-slate-900">
      {/* Map Header Overlay Bar */}
      <div className="absolute top-3 left-3 z-[400] bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/80 shadow-lg flex items-center space-x-3 text-xs text-slate-200">
        <div className="flex items-center space-x-1.5 font-semibold">
          <Navigation className="w-3.5 h-3.5 text-indigo-400" />
          <span>Interactive Campus Radar</span>
        </div>
        <div className="h-3 w-px bg-slate-700" />
        <span className="text-slate-400">
          {events.length} Active Pin{events.length !== 1 ? 's' : ''}
        </span>
        {isPickerMode && (
          <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-medium border border-amber-500/30">
            🎯 Click map to pin venue coordinates
          </span>
        )}
      </div>

      {/* Recenter Campus View Button */}
      <button
        onClick={() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([defaultCenter.lat, defaultCenter.lng], 16);
          }
        }}
        className="absolute bottom-4 right-4 z-[400] bg-slate-900/90 hover:bg-slate-800 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 shadow-md text-xs font-medium transition-colors flex items-center space-x-1.5"
      >
        <MapPin className="w-3.5 h-3.5 text-indigo-400" />
        <span>Center Campus</span>
      </button>

      {/* Actual Map Canvas Container */}
      <div ref={mapContainerRef} style={{ height, width: '100%' }} className="z-0" />
    </div>
  );
};
