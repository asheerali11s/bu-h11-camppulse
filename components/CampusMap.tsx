'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CampusEvent } from '@/types';
import { downloadEventICS } from '@/utils/calendar';
import { BU_H11_COORDINATES } from '@/utils/mockData';
import { MapPin, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface CampusMapProps {
  events: CampusEvent[];
  selectedEventId?: string | null;
  onSelectEvent?: (event: CampusEvent) => void;
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
  height = '520px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // BU (Bahria University H-11 CAMPUS) Coordinates
  const defaultCenter = { lat: BU_H11_COORDINATES.lat, lng: BU_H11_COORDINATES.lng };

  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = (await import('leaflet')).default;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [defaultCenter.lat, defaultCenter.lng],
        zoom: 17,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      // Add a base collegiate marker for BU H-11 Campus
      const buIconHtml = `
        <div style="
          width: 36px; 
          height: 36px; 
          border-radius: 12px; 
          background: linear-gradient(135deg, #0a1325, #11203e); 
          border: 2px solid #d4af37; 
          box-shadow: 0 4px 14px rgba(212, 175, 55, 0.5); 
          display: flex; 
          align-items: center; 
          justify-content: center;
          color: #d4af37; 
          font-weight: 900; 
          font-family: serif;
          font-size: 15px;
        ">
          BU
        </div>
      `;
      const buIcon = L.divIcon({
        html: buIconHtml,
        className: 'bu-campus-base',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      L.marker([defaultCenter.lat, defaultCenter.lng], { icon: buIcon })
        .addTo(map)
        .bindPopup(`
          <div style="padding: 4px; font-family: system-ui;">
            <strong style="color: #ffffff; font-size: 13px;">BU (Bahria University H-11 CAMPUS)</strong>
            <p style="margin: 2px 0 0 0; font-size: 11px; color: #cbd5e1;">Plot 83, Sector H-11/4, Islamabad</p>
          </div>
        `);

      if (isPickerMode && onPickLocation) {
        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
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

  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || typeof window === 'undefined') return;

    const renderMarkers = async () => {
      const L = (await import('leaflet')).default;
      const map = mapInstanceRef.current;

      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      const now = new Date();

      events.forEach((event) => {
        const startTime = new Date(event.start_time);
        const endTime = new Date(event.end_time);
        const isHappeningNow =
          (now >= startTime && now <= endTime) ||
          (startTime.getTime() - now.getTime() > 0 &&
            startTime.getTime() - now.getTime() <= 2 * 60 * 60 * 1000);

        const iconHtml = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 42px; height: 42px;">
            ${
              isHappeningNow
                ? `<div style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; background-color: #d4af37; opacity: 0.45; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
                : ''
            }
            <div style="
              width: 34px; 
              height: 34px; 
              border-radius: 12px; 
              background: linear-gradient(135deg, #0a1325, #11203e); 
              border: 2px solid #d4af37; 
              box-shadow: 0 4px 14px rgba(212, 175, 55, 0.4); 
              display: flex; 
              align-items: center; 
              justify-content: center;
              color: #d4af37; 
              font-weight: 800; 
              font-size: 13px;
              cursor: pointer;
            ">
              ${event.category === 'Sports & Athletics' ? '⚽' : event.category === 'Competition' ? '🏆' : event.category === 'Tech Talk' ? '💻' : '🏛️'}
            </div>
            ${
              isHappeningNow
                ? `<div style="position: absolute; top: -2px; right: -2px; width: 10px; height: 10px; background-color: #10b981; border: 2px solid #0a1325; border-radius: 9999px;"></div>`
                : ''
            }
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'camppulse-marker',
          iconSize: [42, 42],
          iconAnchor: [21, 21],
          popupAnchor: [0, -22],
        });

        const marker = L.marker([event.latitude || defaultCenter.lat, event.longitude || defaultCenter.lng], { icon: customIcon }).addTo(map);

        const popupContent = document.createElement('div');
        popupContent.className = 'collegiate-popup';
        popupContent.style.minWidth = '250px';
        popupContent.style.padding = '4px';

        popupContent.innerHTML = `
          <div style="margin-bottom: 8px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 8px; border-radius: 6px; background: rgba(212, 175, 55, 0.15); color: #d4af37; border: 1px solid rgba(212, 175, 55, 0.3);">
                ${event.category} • ${event.location_name}
              </span>
              ${
                isHappeningNow
                  ? `<span style="font-size: 10px; font-weight: 700; background: rgba(16, 185, 129, 0.2); color: #34d399; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.4);">🔥 LIVE NOW</span>`
                  : ''
              }
            </div>
            <h4 style="font-size: 15px; font-weight: 800; color: #ffffff; margin: 4px 0 2px 0; line-height: 1.2;">
              ${event.title}
            </h4>
            <p style="font-size: 12px; color: #cbd5e1; margin: 0 0 6px 0;">
              ${event.society?.name || 'Verified Society'}
            </p>
          </div>
          
          <div style="font-size: 12px; color: #94a3b8; margin-bottom: 10px; display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span>📍</span> <strong style="color: #f1f5f9;">${event.location_name}</strong>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span>⏰</span> <span>${new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          <button id="ics-btn-${event.id}" style="
            width: 100%; 
            background: linear-gradient(135deg, #d4af37, #b89028); 
            color: #050b14; 
            border: none; 
            padding: 7px 12px; 
            border-radius: 8px; 
            font-size: 11px; 
            font-weight: 800; 
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          ">
            📅 Export to Calendar (.ics)
          </button>
        `;

        marker.bindPopup(popupContent);

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

        if (selectedEventId === event.id) {
          map.panTo([event.latitude, event.longitude], { animate: true });
          marker.openPopup();
        }
      });
    };

    renderMarkers();
  }, [events, mapLoaded, selectedEventId]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-gold-500/30 shadow-2xl bg-navy-950">
      {/* Map Header Overlay Bar */}
      <div className="absolute top-4 left-4 z-[400] bg-navy-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-gold-500/30 shadow-lg flex items-center space-x-3 text-xs text-slate-200">
        <div className="flex items-center space-x-2 font-bold text-gold-300">
          <Navigation className="w-3.5 h-3.5 text-gold-400" />
          <span>BU (Bahria University H-11 CAMPUS) Radar</span>
        </div>
        <div className="h-3 w-px bg-navy-700" />
        <span className="text-slate-400">
          Plot 83, Sector H-11/4 Islamabad
        </span>
      </div>

      {/* Recenter Campus View Button */}
      <button
        onClick={() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([defaultCenter.lat, defaultCenter.lng], 17);
          }
        }}
        className="absolute bottom-4 right-4 z-[400] bg-navy-900/90 hover:bg-navy-850 text-gold-300 px-3 py-1.5 rounded-xl border border-gold-500/30 shadow-md text-xs font-bold transition-colors flex items-center space-x-1.5"
      >
        <MapPin className="w-3.5 h-3.5 text-gold-400" />
        <span>Center H-11 Campus</span>
      </button>

      <div ref={mapContainerRef} style={{ height, width: '100%' }} className="z-0" />
    </div>
  );
};
