import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  MapPin, 
  Navigation, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Building2, 
  Phone, 
  Clock, 
  ShieldCheck, 
  ExternalLink, 
  ChevronRight, 
  CheckCircle2, 
  Search, 
  SlidersHorizontal,
  Compass,
  Bike,
  Sparkles,
  Info,
  Maximize2
} from 'lucide-react';
import { Dealer, DealerLocation } from '../types';
import { 
  resolveLocation, 
  getNearbyDealers, 
  calculateDistanceKm, 
  DealerWithDistance, 
  GeoLocation 
} from '../utils/geo';

interface NearbyDealersMapProps {
  postalCode: string;
  setPostalCode: (plz: string) => void;
  radiusKm: number;
  setRadiusKm: (radius: number) => void;
  dealers: Dealer[];
  onFilterByDealer?: (dealerName: string) => void;
  className?: string;
  showHeader?: boolean;
}

// Bounding box for Germany coordinate mapping
const GERMANY_BOUNDS = {
  minLat: 47.1,
  maxLat: 55.1,
  minLng: 5.7,
  maxLng: 15.4
};

// SVG canvas dimensions
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 1000;

// Projected reference cities across Germany for cartographic background orientation
const MAJOR_GERMAN_CITIES = [
  { name: 'Berlin', lat: 52.5200, lng: 13.4050, hub: true },
  { name: 'Hamburg', lat: 53.5511, lng: 9.9937, hub: true },
  { name: 'München', lat: 48.1371, lng: 11.5754, hub: true },
  { name: 'Köln', lat: 50.9375, lng: 6.9603, hub: true },
  { name: 'Frankfurt', lat: 50.1109, lng: 8.6821, hub: true },
  { name: 'Stuttgart', lat: 48.7758, lng: 9.1829, hub: true },
  { name: 'Düsseldorf', lat: 51.2277, lng: 6.7735, hub: false },
  { name: 'Leipzig', lat: 51.3397, lng: 12.3731, hub: true },
  { name: 'Dortmund', lat: 51.5136, lng: 7.4653, hub: false },
  { name: 'Bremen', lat: 53.0793, lng: 8.8017, hub: false },
  { name: 'Dresden', lat: 51.0504, lng: 13.7373, hub: false },
  { name: 'Hannover', lat: 52.3759, lng: 9.7320, hub: false },
  { name: 'Nürnberg', lat: 49.4521, lng: 11.0767, hub: false },
  { name: 'Bielefeld', lat: 52.0302, lng: 8.5325, hub: false },
  { name: 'Münster', lat: 51.9607, lng: 7.6261, hub: false },
  { name: 'Kassel', lat: 51.3127, lng: 9.4797, hub: false },
  { name: 'Freiburg', lat: 47.9990, lng: 7.8421, hub: false }
];

// Stylized natural waterways / major geographic corridors across Germany
const WATERWAYS_PATHS = [
  // Rhein corridor
  'M 200,900 Q 230,820 230,730 T 215,640 T 175,540 T 160,450 T 130,380',
  // Elbe corridor
  'M 760,650 Q 690,560 620,490 T 520,380 T 420,290 T 360,200',
  // Donau corridor
  'M 260,890 Q 380,880 500,870 T 630,850 T 780,840',
  // Weser corridor
  'M 410,560 Q 395,460 370,390 T 340,290 T 325,210'
];

export const NearbyDealersMap: React.FC<NearbyDealersMapProps> = ({
  postalCode,
  setPostalCode,
  radiusKm,
  setRadiusKm,
  dealers,
  onFilterByDealer,
  className = '',
  showHeader = true
}) => {
  const [selectedDealerId, setSelectedDealerId] = useState<string | null>(null);
  const [hoveredDealerId, setHoveredDealerId] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<'focused' | 'germany'>('focused');
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [customSearchInput, setCustomSearchInput] = useState(postalCode);

  const mapSvgRef = useRef<SVGSVGElement | null>(null);

  // Sync custom input with external postalCode
  useEffect(() => {
    setCustomSearchInput(postalCode);
  }, [postalCode]);

  // Resolve active center location from postalCode state
  const centerLocation: GeoLocation | null = useMemo(() => {
    if (!postalCode) return null;
    return resolveLocation(postalCode, dealers);
  }, [postalCode, dealers]);

  // Calculate nearby dealers based on center location and radius
  const nearbyDealers: DealerWithDistance[] = useMemo(() => {
    if (!centerLocation) {
      // If no center location is set, list all dealers with approximate distance from Germany center
      const defaultCenterLat = 51.1657;
      const defaultCenterLng = 10.4515;
      return dealers
        .filter((d) => d.locations?.[0]?.latitude && d.locations?.[0]?.longitude)
        .map((d) => ({
          ...d,
          primaryLocation: d.locations[0],
          distanceKm: calculateDistanceKm(
            defaultCenterLat,
            defaultCenterLng,
            d.locations[0].latitude,
            d.locations[0].longitude
          )
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    return getNearbyDealers(dealers, centerLocation.lat, centerLocation.lng, radiusKm);
  }, [dealers, centerLocation, radiusKm]);

  // Selected dealer object
  const selectedDealer = useMemo(() => {
    if (!selectedDealerId) return null;
    return dealers.find((d) => d.id === selectedDealerId) || null;
  }, [selectedDealerId, dealers]);

  // Geographic projection: (lat, lng) -> SVG (x, y)
  // Uses Equirectangular projection with cosine latitude scaling for Germany (~51° N)
  const project = (lat: number, lng: number): { x: number; y: number } => {
    const latRad = (51.1 * Math.PI) / 180;
    const xRatio = (lng - GERMANY_BOUNDS.minLng) / (GERMANY_BOUNDS.maxLng - GERMANY_BOUNDS.minLng);
    // Invert latitude because SVG Y goes downward
    const yRatio = (GERMANY_BOUNDS.maxLat - lat) / (GERMANY_BOUNDS.maxLat - GERMANY_BOUNDS.minLat);

    const x = xRatio * CANVAS_WIDTH;
    const y = yRatio * CANVAS_HEIGHT;
    return { x, y };
  };

  // Convert kilometer distance to SVG coordinate radius at Germany latitude
  const kmToSvgRadius = (km: number): number => {
    const totalKmHeight = calculateDistanceKm(GERMANY_BOUNDS.minLat, 10.5, GERMANY_BOUNDS.maxLat, 10.5);
    return (km / totalKmHeight) * CANVAS_HEIGHT;
  };

  // Auto-center and zoom when postalCode or radiusKm changes
  useEffect(() => {
    if (centerLocation && mapMode === 'focused') {
      const centerPos = project(centerLocation.lat, centerLocation.lng);
      // Scale zoom inversely proportional to search radius
      let targetZoom = 1.8;
      if (radiusKm <= 15) targetZoom = 3.8;
      else if (radiusKm <= 30) targetZoom = 2.8;
      else if (radiusKm <= 60) targetZoom = 2.0;
      else if (radiusKm <= 100) targetZoom = 1.5;
      else targetZoom = 1.2;

      setZoom(targetZoom);
      // Center SVG view on the location point
      const targetPanX = CANVAS_WIDTH / 2 - centerPos.x * targetZoom;
      const targetPanY = CANVAS_HEIGHT / 2 - centerPos.y * targetZoom;
      setPan({ x: targetPanX, y: targetPanY });
    } else if (mapMode === 'germany') {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  }, [centerLocation, radiusKm, mapMode]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.3, 6));
  const handleZoomOut = () => setZoom((z) => Math.max(z / 1.3, 0.7));
  const handleReset = () => {
    if (centerLocation) {
      setMapMode('focused');
      const centerPos = project(centerLocation.lat, centerLocation.lng);
      setZoom(2.2);
      setPan({
        x: CANVAS_WIDTH / 2 - centerPos.x * 2.2,
        y: CANVAS_HEIGHT / 2 - centerPos.y * 2.2
      });
    } else {
      setMapMode('germany');
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  };

  // Direct submission of postal code / city search
  const handleApplyLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSearchInput.trim()) {
      setPostalCode(customSearchInput.trim());
      setMapMode('focused');
    }
  };

  const quickCities = [
    { name: 'Berlin', code: '10115' },
    { name: 'München', code: '80331' },
    { name: 'Hamburg', code: '20095' },
    { name: 'Köln', code: '50667' },
    { name: 'Frankfurt', code: '60311' },
    { name: 'Stuttgart', code: '70173' },
    { name: 'Leipzig', code: '04109' },
    { name: 'Bielefeld', code: '33602' }
  ];

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col ${className}`}>
      {/* Optional Component Header */}
      {showHeader && (
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-emerald-50/20">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <MapPin className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Partner-Fachhändler auf der Karte
              </h2>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                {centerLocation ? `${nearbyDealers.length} in deiner Nähe` : `${dealers.length} bundesweit`}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {centerLocation
                ? `Standort: ${centerLocation.name} • Umkreis ${radiusKm} km`
                : 'Deutschlandweite Händlerübersicht verifizierter Fachgeschäfte'}
            </p>
          </div>

          {/* Quick Filter Inputs */}
          <div className="flex flex-wrap items-center gap-2">
            <form onSubmit={handleApplyLocation} className="flex items-center gap-1.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  id="map-plz-input"
                  type="text"
                  value={customSearchInput}
                  onChange={(e) => setCustomSearchInput(e.target.value)}
                  placeholder="PLZ / Stadt..."
                  className="w-32 sm:w-40 pl-8 pr-2 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
              <button
                id="btn-apply-map-plz"
                type="submit"
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs"
              >
                Finden
              </button>
            </form>

            {/* Radius Selector */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-medium">
              {[15, 30, 50, 100].map((r) => (
                <button
                  key={r}
                  id={`btn-map-radius-${r}`}
                  onClick={() => setRadiusKm(r)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    radiusKm === r
                      ? 'bg-white text-emerald-800 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Map + Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 relative min-h-[460px] lg:min-h-[580px]">
        {/* Interactive SVG Map Container */}
        <div 
          className="lg:col-span-8 bg-slate-50 relative overflow-hidden select-none border-b lg:border-b-0 lg:border-r border-slate-200 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Map Controls Floating Toolbar */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-white/90 backdrop-blur rounded-2xl p-1 shadow-md border border-slate-200/80">
            <button
              id="btn-map-zoom-in"
              onClick={handleZoomIn}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              title="Heranzoomen"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              id="btn-map-zoom-out"
              onClick={handleZoomOut}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              title="Herauszoomen"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="h-px bg-slate-200 my-0.5" />
            <button
              id="btn-map-recenter"
              onClick={handleReset}
              className="p-2 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
              title="Auf aktuellen Standort zentrieren"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              id="btn-map-toggle-germany"
              onClick={() => setMapMode(mapMode === 'germany' ? 'focused' : 'germany')}
              className={`p-2 rounded-xl transition-colors ${
                mapMode === 'germany'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="Ganz Deutschland anzeigen"
            >
              <Compass className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Location Chips Floating Banner (if no location is set) */}
          {!postalCode && (
            <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur px-3.5 py-2.5 rounded-2xl shadow-sm border border-slate-200 max-w-sm">
              <span className="text-[11px] font-semibold text-slate-700 block mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Schnellauswahl beliebter Fahrradstädte:
              </span>
              <div className="flex flex-wrap gap-1">
                {quickCities.slice(0, 5).map((qc) => (
                  <button
                    key={qc.code}
                    onClick={() => {
                      setPostalCode(qc.code);
                      setMapMode('focused');
                    }}
                    className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 text-slate-700 rounded-md transition-colors"
                  >
                    {qc.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Map Canvas SVG */}
          <svg
            ref={mapSvgRef}
            viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
            className="w-full h-full min-h-[460px] lg:min-h-[580px] transition-transform duration-75"
          >
            <defs>
              {/* Radial gradient for user search radius */}
              <radialGradient id="radiusGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                <stop offset="75%" stopColor="#10b981" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.25" />
              </radialGradient>

              {/* Marker pin shadow filter */}
              <filter id="pinShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0f172a" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* Transform Group (handles zoom & pan) */}
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Subtle Geographic Background Grid */}
              <g stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.6">
                {/* Parallels (Latitudes) */}
                <line x1="0" y1="200" x2={CANVAS_WIDTH} y2="200" />
                <line x1="0" y1="400" x2={CANVAS_WIDTH} y2="400" />
                <line x1="0" y1="600" x2={CANVAS_WIDTH} y2="600" />
                <line x1="0" y1="800" x2={CANVAS_WIDTH} y2="800" />
                {/* Meridians (Longitudes) */}
                <line x1="200" y1="0" x2="200" y2={CANVAS_HEIGHT} />
                <line x1="400" y1="0" x2="400" y2={CANVAS_HEIGHT} />
                <line x1="600" y1="0" x2="600" y2={CANVAS_HEIGHT} />
                <line x1="800" y1="0" x2="800" y2={CANVAS_HEIGHT} />
              </g>

              {/* Simplified stylized outline of Germany landmass */}
              <path
                d="M 280,70 Q 380,40 450,110 T 600,160 T 730,190 T 820,320 T 860,490 T 780,680 T 790,830 T 640,890 T 490,920 T 360,940 T 260,900 T 160,780 T 170,610 T 140,480 T 180,330 T 260,190 Z"
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="2.5"
                strokeLinejoin="round"
                opacity="0.95"
              />

              {/* Waterways corridors (Rhein, Elbe, Donau, Weser) */}
              <g fill="none" stroke="#93c5fd" strokeWidth="2" opacity="0.4" strokeLinecap="round">
                {WATERWAYS_PATHS.map((d, i) => (
                  <path key={i} d={d} />
                ))}
              </g>

              {/* Reference City Points across Germany */}
              {MAJOR_GERMAN_CITIES.map((city) => {
                const pos = project(city.lat, city.lng);
                return (
                  <g key={city.name} className="pointer-events-none select-none">
                    <circle cx={pos.x} cy={pos.y} r={city.hub ? 3.5 : 2} fill="#94a3b8" />
                    <text
                      x={pos.x + 6}
                      y={pos.y + 3}
                      fontSize="9"
                      fontWeight={city.hub ? '600' : '400'}
                      fill="#64748b"
                      className="font-sans"
                    >
                      {city.name}
                    </text>
                  </g>
                );
              })}

              {/* Active Search Radius Boundary Circle */}
              {centerLocation && (
                <g>
                  {(() => {
                    const centerPos = project(centerLocation.lat, centerLocation.lng);
                    const svgRadius = kmToSvgRadius(radiusKm);

                    return (
                      <g>
                        {/* Radius filled aura */}
                        <circle
                          cx={centerPos.x}
                          cy={centerPos.y}
                          r={svgRadius}
                          fill="url(#radiusGradient)"
                          stroke="#059669"
                          strokeWidth="2"
                          strokeDasharray="6,4"
                        />

                        {/* Radius distance pill tag on circumference */}
                        <g transform={`translate(${centerPos.x}, ${centerPos.y - svgRadius})`}>
                          <rect
                            x="-36"
                            y="-11"
                            width="72"
                            height="18"
                            rx="9"
                            fill="#065f46"
                            opacity="0.95"
                          />
                          <text
                            x="0"
                            y="2"
                            fill="#ffffff"
                            fontSize="9"
                            fontWeight="bold"
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            {radiusKm} km Radius
                          </text>
                        </g>

                        {/* Leader line between user center and selected dealer */}
                        {selectedDealer && selectedDealer.locations?.[0] && (
                          <line
                            x1={centerPos.x}
                            y1={centerPos.y}
                            x2={project(selectedDealer.locations[0].latitude, selectedDealer.locations[0].longitude).x}
                            y2={project(selectedDealer.locations[0].latitude, selectedDealer.locations[0].longitude).y}
                            stroke="#059669"
                            strokeWidth="2"
                            strokeDasharray="4,4"
                            opacity="0.8"
                          />
                        )}
                      </g>
                    );
                  })()}
                </g>
              )}

              {/* All Dealers Pins */}
              {dealers.map((dealer) => {
                const loc = dealer.locations?.[0];
                if (!loc || !loc.latitude || !loc.longitude) return null;

                const pos = project(loc.latitude, loc.longitude);
                const isSelected = selectedDealerId === dealer.id;
                const isHovered = hoveredDealerId === dealer.id;

                // Determine if dealer is within current postal code radius
                const isWithinRadius = centerLocation
                  ? calculateDistanceKm(centerLocation.lat, centerLocation.lng, loc.latitude, loc.longitude) <= radiusKm
                  : true;

                // Scale pin size based on zoom level to maintain balanced optical size
                const pinScale = Math.max(0.6, Math.min(1.4, 1.2 / Math.sqrt(zoom)));

                return (
                  <g
                    key={dealer.id}
                    transform={`translate(${pos.x}, ${pos.y}) scale(${pinScale})`}
                    className="cursor-pointer transition-transform"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDealerId(dealer.id);
                    }}
                    onMouseEnter={() => setHoveredDealerId(dealer.id)}
                    onMouseLeave={() => setHoveredDealerId(null)}
                  >
                    {/* Pulsing ring if selected */}
                    {isSelected && (
                      <circle
                        cx="0"
                        cy="-16"
                        r="24"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        opacity="0.6"
                      >
                        <animate attributeName="r" values="18;28;18" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}

                    {/* Marker Pin Body */}
                    <g filter="url(#pinShadow)">
                      <path
                        d="M 0,-32 C -11,-32 -20,-23 -20,-12 C -20,3 0,0 0,0 C 0,0 20,3 20,-12 C 20,-23 11,-32 0,-32 Z"
                        fill={
                          isSelected
                            ? '#0f172a'
                            : isWithinRadius
                            ? '#059669'
                            : '#94a3b8'
                        }
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                      {/* Bike Icon / Dot inside pin */}
                      <circle cx="0" cy="-16" r="6.5" fill="#ffffff" />
                      <circle
                        cx="0"
                        cy="-16"
                        r="3.5"
                        fill={
                          isSelected
                            ? '#10b981'
                            : isWithinRadius
                            ? '#059669'
                            : '#64748b'
                        }
                      />
                    </g>

                    {/* Quick Hover Label */}
                    {(isHovered || isSelected) && (
                      <g transform="translate(0, -42)" className="pointer-events-none">
                        <rect
                          x="-65"
                          y="-18"
                          width="130"
                          height="22"
                          rx="6"
                          fill="#0f172a"
                          opacity="0.95"
                        />
                        <text
                          x="0"
                          y="-4"
                          fill="#ffffff"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {dealer.name.length > 20 ? `${dealer.name.slice(0, 18)}...` : dealer.name}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* User Center Location Pin */}
              {centerLocation && (
                (() => {
                  const centerPos = project(centerLocation.lat, centerLocation.lng);
                  return (
                    <g transform={`translate(${centerPos.x}, ${centerPos.y})`} className="pointer-events-none">
                      {/* Outer pulse */}
                      <circle cx="0" cy="0" r="16" fill="#3b82f6" opacity="0.25">
                        <animate attributeName="r" values="10;26;10" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.4;0.05;0.4" dur="2s" repeatCount="indefinite" />
                      </circle>
                      {/* Inner glowing dot */}
                      <circle cx="0" cy="0" r="7" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
                      <circle cx="0" cy="0" r="3" fill="#ffffff" />

                      {/* Label */}
                      <g transform="translate(0, 18)">
                        <rect
                          x="-50"
                          y="-2"
                          width="100"
                          height="18"
                          rx="6"
                          fill="#1e3a8a"
                          opacity="0.9"
                        />
                        <text
                          x="0"
                          y="10"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="600"
                          textAnchor="middle"
                        >
                          Dein Standort
                        </text>
                      </g>
                    </g>
                  );
                })()
              )}
            </g>
          </svg>

          {/* Map Legend & Scale Footer Bar */}
          <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur rounded-xl text-[11px] text-slate-600 shadow-xs border border-slate-200">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span>Im Umkreis</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span>Dein Suchort</span>
            </div>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">Klicken zum Auswählen</span>
          </div>
        </div>

        {/* Sidebar: Nearby Dealers List & Selected Detail Card */}
        <div className="lg:col-span-4 flex flex-col bg-white overflow-hidden max-h-[580px]">
          {/* Header of Sidebar */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {nearbyDealers.length}{' '}
                {nearbyDealers.length === 1 ? 'Händler' : 'Händler'} gefunden
              </h3>
              <p className="text-xs text-slate-500">
                {centerLocation ? `Im Umkreis von ${radiusKm} km` : 'Sortiert nach Bundesland'}
              </p>
            </div>
            {centerLocation && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200">
                PLZ {postalCode}
              </span>
            )}
          </div>

          {/* If a dealer is selected, show their full profile card first */}
          {selectedDealer && (
            <div className="p-4 bg-emerald-50/40 border-b border-emerald-100 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-900">{selectedDealer.name}</h4>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  </div>
                  {selectedDealer.locations?.[0] && (
                    <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        {selectedDealer.locations[0].address_line1}, {selectedDealer.locations[0].postal_code}{' '}
                        {selectedDealer.locations[0].city}
                      </span>
                    </p>
                  )}
                </div>
                {centerLocation && selectedDealer.locations?.[0] && (
                  <span className="px-2 py-1 bg-white text-emerald-800 font-bold text-xs rounded-lg border border-emerald-200 shrink-0">
                    {calculateDistanceKm(
                      centerLocation.lat,
                      centerLocation.lng,
                      selectedDealer.locations[0].latitude,
                      selectedDealer.locations[0].longitude
                    )}{' '}
                    km
                  </span>
                )}
              </div>

              {/* Opening hours & contact info */}
              {selectedDealer.locations?.[0]?.opening_hours && (
                <div className="text-[11px] text-slate-600 flex items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-200">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{selectedDealer.locations[0].opening_hours}</span>
                </div>
              )}

              {/* Supported Leasing Badges */}
              {selectedDealer.supported_providers && selectedDealer.supported_providers.length > 0 && (
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Verifizierte Dienstrad-Partner
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedDealer.supported_providers.slice(0, 4).map((p) => (
                      <span
                        key={p.provider_slug}
                        className="px-1.5 py-0.5 text-[10px] font-medium bg-white text-slate-800 border border-slate-200 rounded"
                      >
                        ✓ {p.provider_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                {onFilterByDealer && (
                  <button
                    id="btn-dealer-offers"
                    onClick={() => onFilterByDealer(selectedDealer.name)}
                    className="flex-1 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1"
                  >
                    <Bike className="w-3.5 h-3.5" />
                    <span>Räder anzeigen</span>
                  </button>
                )}

                {selectedDealer.locations?.[0] && (
                  <a
                    id="btn-dealer-directions"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      `${selectedDealer.name}, ${selectedDealer.locations[0].address_line1}, ${selectedDealer.locations[0].postal_code} ${selectedDealer.locations[0].city}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors flex items-center gap-1"
                  >
                    <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Route</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Scrollable List of Nearby Dealers */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {nearbyDealers.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <MapPin className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Keine Händler in diesem Umkreis</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Erweitere den Suchradius auf 100 km oder wähle eine andere Stadt in deiner Nähe.
                </p>
                <button
                  id="btn-expand-radius"
                  onClick={() => setRadiusKm(100)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Umkreis auf 100 km erweitern
                </button>
              </div>
            ) : (
              nearbyDealers.map((dealer) => {
                const isSelected = selectedDealerId === dealer.id;
                const loc = dealer.primaryLocation;

                return (
                  <div
                    key={dealer.id}
                    id={`dealer-item-${dealer.id}`}
                    onClick={() => {
                      setSelectedDealerId(dealer.id);
                      if (loc?.latitude && loc?.longitude) {
                        const pos = project(loc.latitude, loc.longitude);
                        setZoom(3);
                        setPan({
                          x: CANVAS_WIDTH / 2 - pos.x * 3,
                          y: CANVAS_HEIGHT / 2 - pos.y * 3
                        });
                      }
                    }}
                    className={`p-3.5 cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                      isSelected ? 'bg-emerald-50/70 border-l-4 border-emerald-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {dealer.name}
                        </span>
                        {dealer.is_verified && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {loc.postal_code} {loc.city} • {loc.address_line1}
                      </p>
                      {dealer.supported_providers && (
                        <p className="text-[10px] text-emerald-700 font-medium">
                          {dealer.supported_providers.length} Leasing-Partner verfügbar
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                        {dealer.distanceKm} km
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 mt-1 ml-auto" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
