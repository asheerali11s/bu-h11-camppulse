'use client';

import React, { useState } from 'react';
import { CampusFloor, CampusEvent } from '@/types';
import { BU_H11_FLOORS, H11FloorPlan } from '@/utils/mockData';
import {
  Layers,
  Building,
  Cpu,
  Monitor,
  Flame,
  Users,
  Calendar,
  Sparkles,
  MapPin,
  Compass,
} from 'lucide-react';

interface H11FloorModelProps {
  events: CampusEvent[];
  selectedFloor?: CampusFloor;
  onSelectFloor?: (floor: CampusFloor) => void;
  onSelectFacility?: (facilityName: string, floor: CampusFloor) => void;
}

export const H11FloorModel: React.FC<H11FloorModelProps> = ({
  events,
  selectedFloor: propFloor,
  onSelectFloor,
  onSelectFacility,
}) => {
  const [activeFloor, setActiveFloor] = useState<CampusFloor>(propFloor || 'Ground');
  const [selectedFacilityName, setSelectedFacilityName] = useState<string | null>(null);

  const currentFloorData = BU_H11_FLOORS.find((f) => f.floor === activeFloor) || BU_H11_FLOORS[0];

  const handleFloorChange = (floor: CampusFloor) => {
    setActiveFloor(floor);
    setSelectedFacilityName(null);
    if (onSelectFloor) onSelectFloor(floor);
  };

  const getEventsForFacility = (name: string) => {
    return events.filter(
      (e) =>
        e.location_name.toLowerCase().includes(name.toLowerCase()) ||
        (e.lab_name && e.lab_name.toLowerCase().includes(name.toLowerCase()))
    );
  };

  return (
    <div className="rounded-3xl bg-navy-900 border border-gold-500/30 overflow-hidden shadow-2xl space-y-4 p-5 sm:p-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-gold-400" />
            <h3 className="text-base font-black text-white">
              BU H-11 Academic Blocks &amp; Lab Architecture
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Plot 83, Sector H-11/4 Islamabad • Multi-Level Floor &amp; Laboratory Blueprint
          </p>
        </div>

        {/* Floor Selection Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {BU_H11_FLOORS.map((f) => {
            const isSelected = activeFloor === f.floor;
            return (
              <button
                key={f.floor}
                onClick={() => handleFloorChange(f.floor)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-gold-500 text-navy-950 border-gold-400 shadow-gold'
                    : 'bg-navy-950 text-slate-400 border-navy-800 hover:text-white hover:border-navy-700'
                }`}
              >
                {f.floor === 'Outdoor' ? 'Outdoor' : `${f.floor} Floor`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Floor Subtitle */}
      <div className="flex items-center justify-between text-xs text-slate-300 bg-navy-950 p-3 rounded-2xl border border-navy-800">
        <div>
          <span className="text-gold-400 font-bold">{currentFloorData.label}:</span>{' '}
          <span className="text-slate-400">{currentFloorData.wings}</span>
        </div>
        <span className="font-mono text-[11px] text-slate-500">
          {currentFloorData.facilities.length} Rooms / Labs
        </span>
      </div>

      {/* Interactive Blueprint Grid of Labs & Halls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {currentFloorData.facilities.map((fac) => {
          const facEvents = getEventsForFacility(fac.name);
          const hasActiveEvents = facEvents.length > 0;
          const isSelected = selectedFacilityName === fac.name;

          return (
            <div
              key={fac.name}
              onClick={() => {
                setSelectedFacilityName(fac.name);
                if (onSelectFacility) onSelectFacility(fac.name, activeFloor);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-navy-800 border-gold-400 ring-1 ring-gold-400/40 shadow-gold'
                  : hasActiveEvents
                  ? 'bg-navy-850 border-gold-500/40'
                  : 'bg-navy-950 border-navy-800 hover:border-gold-500/30 hover:bg-navy-850/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                      fac.type === 'lab'
                        ? 'bg-gold-500/10 text-gold-300 border border-gold-500/30'
                        : fac.type === 'hall'
                        ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
                        : fac.type === 'sports'
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        : 'bg-navy-900 text-slate-400 border border-navy-700'
                    }`}
                  >
                    {fac.type.toUpperCase()}
                  </span>

                  {hasActiveEvents && (
                    <span className="flex items-center space-x-1 text-[10px] font-bold text-gold-400 animate-pulse">
                      <Flame className="w-3 h-3" />
                      <span>{facEvents.length} Event Scheduled</span>
                    </span>
                  )}
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                  {fac.name}
                </h4>
              </div>

              <div className="mt-3 pt-2.5 border-t border-navy-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="flex items-center space-x-1">
                  <Users className="w-3 h-3 text-slate-500" />
                  <span>Cap: {fac.capacity}</span>
                </span>

                <span className="text-gold-400 text-[10px] font-bold">
                  {hasActiveEvents ? 'In Booking' : 'Clear / Available'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
