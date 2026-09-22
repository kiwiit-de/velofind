import React, { useState, useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import {
  MapPin,
  Navigation,
  RotateCcw,
  Building2,
  Phone,
  Clock,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Search,
  Bike,
  Layers,
  X,
  Globe,
  SlidersHorizontal,
  Boxes
} from 'lucide-react';
import { Dealer } from '../types';
import {
  resolveLocation,
  calculateDistanceKm,
  DealerWithDistance,
  GeoLocation
} from '../utils/geo';
import {
  ALL_GERMAN_CITIES,
  TOP_GERMAN_METROPOLES,
  CITIES_BY_STATE,
  findCity
} from '../data/germanCities';

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

// Center of Germany bounds
const GERMANY_CENTER: [number, number] = [51.1657, 10.4515];
const GERMANY_BOUNDS: L.LatLngBoundsExpression = [
  [47.2, 5.8],
  [55.1, 15.2]
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
  const [searchInput, setSearchInput] = useState(postalCode);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [tileProvider, setTileProvider] = useState<'osm' | 'voyager'>('osm');
  const [enableClustering, setEnableClustering] = useState<boolean>(true);

  // Leaflet map refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const centerMarkerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Sync internal search input with external postalCode prop
  useEffect(() => {
    setSearchInput(postalCode);
  }, [postalCode]);

  // Resolve coordinates of current location
  const centerLocation: GeoLocation | null = useMemo(() => {
    if (!postalCode) return null;
    return resolveLocation(postalCode, dealers);
  }, [postalCode, dealers]);

  // Compute dealers with distance
  const dealersWithCoords = useMemo(() => {
    const list: DealerWithDistance[] = [];
    dealers.forEach((dealer) => {
      const loc = dealer.locations?.[0];
      if (loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
        let dist = 0;
        if (centerLocation) {
          dist = calculateDistanceKm(
            centerLocation.lat,
            centerLocation.lng,
            loc.latitude,
            loc.longitude
          );
        }
        list.push({
          ...dealer,
          primaryLocation: loc,
          distanceKm: dist
        });
      }
    });

    if (centerLocation) {
      list.sort((a, b) => a.distanceKm - b.distanceKm);
    }
    return list;
  }, [dealers, centerLocation]);

  // Filter nearby dealers by radius when a center location is defined
  const nearbyDealers = useMemo(() => {
    if (!centerLocation) return dealersWithCoords;
    return dealersWithCoords.filter((d) => d.distanceKm <= radiusKm);
  }, [dealersWithCoords, centerLocation, radiusKm]);

  // Selected dealer record
  const selectedDealer = useMemo(() => {
    if (!selectedDealerId) return null;
    return dealers.find((d) => d.id === selectedDealerId) || null;
  }, [dealers, selectedDealerId]);

  // 1. Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Check if map already exists
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: GERMANY_CENTER,
        zoom: 6,
        zoomControl: true,
        attributionControl: true
      });

      // Default OpenStreetMap tile layer
      const osmTiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      tileLayerRef.current = osmTiles;
      mapInstanceRef.current = map;
    }

    return () => {
      // Map cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Switch tile style (OpenStreetMap Standard vs CartoDB Voyager)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    let url = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

    if (tileProvider === 'voyager') {
      url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      attribution = '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap';
    }

    const newLayer = L.tileLayer(url, { maxZoom: 19, attribution }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newLayer;
  }, [tileProvider]);

  // 3. Update Radius Circle and Center Marker on map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clean up previous circle
    if (radiusCircleRef.current) {
      map.removeLayer(radiusCircleRef.current);
      radiusCircleRef.current = null;
    }
    // Clean up previous user marker
    if (centerMarkerRef.current) {
      map.removeLayer(centerMarkerRef.current);
      centerMarkerRef.current = null;
    }

    if (centerLocation) {
      const centerLatLng: L.LatLngExpression = [centerLocation.lat, centerLocation.lng];

      // Interactive radius circle
      const circle = L.circle(centerLatLng, {
        radius: radiusKm * 1000,
        color: '#059669', // Emerald-600
        weight: 2,
        dashArray: '4, 6',
        fillColor: '#10b981', // Emerald-500
        fillOpacity: 0.12
      }).addTo(map);

      radiusCircleRef.current = circle;

      // Pulsing user center pin
      const centerPinHtml = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></div>
          <div class="w-7 h-7 rounded-full bg-blue-600 text-white shadow-lg border-2 border-white flex items-center justify-center">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        </div>
      `;

      const centerIcon = L.divIcon({
        className: 'user-center-marker-icon',
        html: centerPinHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const userMarker = L.marker(centerLatLng, { icon: centerIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindTooltip(
          `<div class="font-bold text-xs">📍 Dein Suchort: ${centerLocation.name || postalCode}</div>`,
          { direction: 'top', offset: [0, -10] }
        );

      centerMarkerRef.current = userMarker;

      // Fit map viewport to circle radius smoothly
      try {
        map.flyToBounds(circle.getBounds().pad(0.12), {
          duration: 1.2,
          easeLinearity: 0.25
        });
      } catch (err) {
        map.setView(centerLatLng, 10);
      }
    } else {
      // If no center location, show all Germany
      map.fitBounds(GERMANY_BOUNDS, { padding: [20, 20] });
    }
  }, [centerLocation, radiusKm, postalCode]);

  // 4. Update Dealer Markers with Clustering Support
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clean up previous marker layer
    if (markersLayerRef.current) {
      map.removeLayer(markersLayerRef.current);
      markersLayerRef.current = null;
    }

    markersMapRef.current.clear();

    // Create clustering group if enabled and supported, otherwise standard LayerGroup
    let layerGroup: L.LayerGroup;

    if (enableClustering && typeof (L as any).markerClusterGroup === 'function') {
      layerGroup = (L as any).markerClusterGroup({
        maxClusterRadius: 48,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        spiderfyDistanceMultiplier: 1.3,
        animate: true,
        chunkedLoading: true,
        iconCreateFunction: (cluster: any) => {
          const count = cluster.getChildCount();
          let sizeClass = 'w-10 h-10 text-xs';
          let badgeClass = 'bg-emerald-600 text-white';
          let haloClass = 'bg-emerald-500/25';
          let dim = 42;

          if (count >= 10) {
            sizeClass = 'w-11 h-11 text-xs font-bold';
            badgeClass = 'bg-emerald-700 text-white';
            haloClass = 'bg-emerald-600/35';
            dim = 46;
          }
          if (count >= 25) {
            sizeClass = 'w-12 h-12 text-sm font-bold';
            badgeClass = 'bg-slate-900 text-emerald-400';
            haloClass = 'bg-slate-900/35';
            dim = 50;
          }

          return L.divIcon({
            html: `
              <div class="relative flex items-center justify-center group cursor-pointer select-none">
                <div class="absolute inset-0 rounded-full ${haloClass} animate-pulse scale-125"></div>
                <div class="relative flex flex-col items-center justify-center ${sizeClass} rounded-full ${badgeClass} shadow-lg border-2 border-white transition-transform duration-200 group-hover:scale-110">
                  <span class="font-extrabold tracking-tight leading-none">${count}</span>
                  <span class="text-[7.5px] uppercase tracking-tighter opacity-90 leading-none mt-0.5 font-medium">Händler</span>
                </div>
              </div>
            `,
            className: 'custom-dealer-cluster',
            iconSize: [dim, dim],
            iconAnchor: [dim / 2, dim / 2]
          });
        }
      });
    } else {
      layerGroup = L.layerGroup();
    }

    dealersWithCoords.forEach((dealer) => {
      const loc = dealer.primaryLocation;
      if (!loc || typeof loc.latitude !== 'number' || typeof loc.longitude !== 'number') return;

      const isNearby = !centerLocation || dealer.distanceKm <= radiusKm;
      const isSelected = selectedDealerId === dealer.id;

      // Custom high-DPI HTML Pin icon
      let pinColor = isNearby ? 'bg-emerald-600' : 'bg-slate-500';
      let pinBorder = isSelected ? 'border-amber-400 ring-4 ring-emerald-400/40' : 'border-white';
      let zIndex = isSelected ? 900 : isNearby ? 500 : 200;
      let scale = isSelected ? 'scale-125' : isNearby ? 'scale-100 hover:scale-110' : 'scale-90 opacity-75';

      const iconHtml = `
        <div class="transform transition-all duration-200 cursor-pointer ${scale}">
          <div class="relative flex flex-col items-center">
            <div class="w-7 h-7 rounded-full ${pinColor} text-white shadow-md border-2 ${pinBorder} flex items-center justify-center">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="18.5" cy="17.5" r="3.5"></circle>
                <circle cx="5.5" cy="17.5" r="3.5"></circle>
                <circle cx="15" cy="5" r="1"></circle>
                <path d="M12 17.5V14l-3-3 4-3 2 3h2"></path>
              </svg>
            </div>
            <div class="w-1.5 h-1.5 bg-slate-800 rotate-45 -mt-1 rounded-xs"></div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: `dealer-marker-${dealer.id}`,
        html: iconHtml,
        iconSize: [28, 34],
        iconAnchor: [14, 34],
        popupAnchor: [0, -32]
      });

      const marker = L.marker([loc.latitude, loc.longitude], {
        icon: customIcon,
        zIndexOffset: zIndex
      });

      // Interactive Popup content with real dealer info and actions
      const popupHtml = `
        <div class="p-1 min-w-[220px] max-w-[280px] font-sans">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="font-bold text-slate-900 text-sm">${dealer.name}</span>
            ${dealer.is_verified ? '<span class="text-emerald-600 text-xs font-bold">✓</span>' : ''}
          </div>
          <p class="text-xs text-slate-600 mb-1.5">
            ${loc.address_line1}, ${loc.postal_code} ${loc.city}
          </p>
          ${
            centerLocation
              ? `<div class="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-800 font-bold text-xs rounded border border-emerald-200 mb-2">
                  ${dealer.distanceKm} km entfernt
                </div>`
              : ''
          }
          ${
            dealer.supported_providers && dealer.supported_providers.length > 0
              ? `<div class="text-[10px] text-slate-500 mb-2">
                  Partner: ${dealer.supported_providers.slice(0, 3).map((p) => p.provider_name).join(', ')}
                </div>`
              : ''
          }
          <div class="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100">
            <button
              id="popup-btn-filter-${dealer.id}"
              class="flex-1 py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold text-center cursor-pointer transition-colors"
            >
              Räder anzeigen
            </button>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                `${dealer.name}, ${loc.address_line1}, ${loc.postal_code} ${loc.city}`
              )}"
              target="_blank"
              rel="noopener noreferrer"
              class="py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium flex items-center gap-1"
            >
              Route ↗
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 300, closeButton: true });

      // Click on marker event
      marker.on('click', () => {
        setSelectedDealerId(dealer.id);
      });

      // When popup opens, attach button click handler
      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-btn-filter-${dealer.id}`);
        if (btn && onFilterByDealer) {
          btn.onclick = () => onFilterByDealer(dealer.name);
        }
      });

      markersMapRef.current.set(dealer.id, marker);
      layerGroup.addLayer(marker);
    });

    layerGroup.addTo(map);
    markersLayerRef.current = layerGroup;
  }, [dealersWithCoords, centerLocation, radiusKm, selectedDealerId, enableClustering, onFilterByDealer]);

  // Helper to focus and open a dealer marker (supports zooming through clusters)
  const focusDealerMarker = (dealerId: string) => {
    setSelectedDealerId(dealerId);
    const marker = markersMapRef.current.get(dealerId);
    const map = mapInstanceRef.current;
    const dealer = dealers.find((d) => d.id === dealerId);
    const loc = dealer?.locations?.[0];
    if (!map) return;

    if (marker) {
      if (enableClustering && (markersLayerRef.current as any)?.zoomToShowLayer) {
        (markersLayerRef.current as any).zoomToShowLayer(marker, () => {
          marker.openPopup();
        });
      } else {
        map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 14), { duration: 1 });
        marker.openPopup();
      }
    } else if (loc?.latitude && loc?.longitude) {
      map.flyTo([loc.latitude, loc.longitude], 14, { duration: 1 });
    }
  };

  // Handle location search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    const matched = findCity(searchInput.trim());
    if (matched) {
      setPostalCode(matched.code);
    } else {
      setPostalCode(searchInput.trim());
    }
  };

  // Select city from directory
  const handleSelectCity = (city: { name: string; code: string }) => {
    setPostalCode(city.code);
    setSearchInput(`${city.name} (${city.code})`);
    setShowCityPicker(false);
  };

  // Center map on user/search location
  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (centerLocation && radiusCircleRef.current) {
      map.flyToBounds(radiusCircleRef.current.getBounds().pad(0.15), { duration: 1 });
    } else {
      map.flyToBounds(GERMANY_BOUNDS, { duration: 1.2 });
    }
  };

  // Reset to entire Germany
  const handleFitGermany = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyToBounds(GERMANY_BOUNDS, { duration: 1.2 });
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      {showHeader && (
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Title & Stats */}
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                  <MapPin className="w-4 h-4" />
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Interaktive Händlerkarte
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  Live OpenStreetMap
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Echte Kartendarstellung mit {dealers.length} verifizierten Fachhändlern in ganz Deutschland
              </p>
            </div>

            {/* Quick Cities Directory Toggle */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-xs text-slate-500 font-medium mr-1 hidden sm:inline">
                Häufig gesucht:
              </div>
              {TOP_GERMAN_METROPOLES.slice(0, 5).map((city) => (
                <button
                  key={city.code}
                  onClick={() => handleSelectCity(city)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                    postalCode === city.code
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50'
                  }`}
                >
                  {city.name}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setShowCityPicker(true)}
                className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 flex items-center gap-1"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Alle 120+ Städte...</span>
              </button>
            </div>
          </div>

          {/* Search, Radius & Controls Bar */}
          <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="dealers-map-search-input"
                type="text"
                list="map-cities-datalist"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="PLZ oder Stadt eingeben (z.B. 50667, Köln, Leipzig)..."
                className="w-full pl-9 pr-20 py-2 bg-white rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
              <datalist id="map-cities-datalist">
                {ALL_GERMAN_CITIES.map((c) => (
                  <option key={c.code} value={`${c.name} (${c.code})`} />
                ))}
              </datalist>
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
              >
                Suchen
              </button>
            </form>

            {/* Radius selection pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs text-slate-500 font-medium mr-1 shrink-0">Radius:</span>
              {[15, 30, 50, 100].map((r) => (
                <button
                  key={r}
                  id={`btn-radius-${r}`}
                  onClick={() => setRadiusKm(r)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors shrink-0 ${
                    radiusKm === r
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {r} km
                </button>
              ))}

              {postalCode && (
                <button
                  onClick={() => {
                    setPostalCode('');
                    setSearchInput('');
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 ml-1"
                  title="Filter zurücksetzen"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content: Real Interactive Leaflet Map + Dealers Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
        {/* Real Leaflet Map Container */}
        <div className="lg:col-span-8 relative bg-slate-100 min-h-[420px] lg:min-h-[580px] overflow-hidden">
          {/* The real Leaflet Map DIV */}
          <div
            ref={mapContainerRef}
            id="leaflet-dealers-map"
            className="w-full h-full min-h-[420px] lg:min-h-[580px] z-0"
            style={{ width: '100%', height: '100%' }}
          />

          {/* Floating Map Navigation & Layer Tools */}
          <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
            <button
              id="btn-leaflet-recenter"
              onClick={handleRecenter}
              className="p-2 bg-white/95 backdrop-blur-md text-slate-700 hover:text-emerald-700 hover:bg-slate-50 rounded-xl shadow-md border border-slate-200 transition-colors"
              title="Auf Suchort zentrieren"
            >
              <Navigation className="w-4 h-4" />
            </button>

            <button
              id="btn-leaflet-germany"
              onClick={handleFitGermany}
              className="p-2 bg-white/95 backdrop-blur-md text-slate-700 hover:text-emerald-700 hover:bg-slate-50 rounded-xl shadow-md border border-slate-200 transition-colors"
              title="Ganz Deutschland anzeigen"
            >
              <Globe className="w-4 h-4" />
            </button>

            {/* Tile Layer Toggle */}
            <button
              id="btn-tile-toggle"
              onClick={() => setTileProvider((prev) => (prev === 'osm' ? 'voyager' : 'osm'))}
              className="p-2 bg-white/95 backdrop-blur-md text-slate-700 hover:text-emerald-700 hover:bg-slate-50 rounded-xl shadow-md border border-slate-200 transition-colors"
              title={`Kartenstil: ${tileProvider === 'osm' ? 'OpenStreetMap' : 'Voyager'}`}
            >
              <Layers className="w-4 h-4" />
            </button>

            {/* Marker Clustering Toggle */}
            <button
              id="btn-leaflet-clustering-toggle"
              onClick={() => setEnableClustering((prev) => !prev)}
              className={`p-2 rounded-xl shadow-md border transition-all flex items-center justify-center ${
                enableClustering
                  ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-500/20'
                  : 'bg-white/95 backdrop-blur-md text-slate-700 hover:text-emerald-700 hover:bg-slate-50 border-slate-200'
              }`}
              title={
                enableClustering
                  ? 'Marker-Clustering aktiv (Klicken für Einzel-Pins)'
                  : 'Marker-Clustering inaktiv (Klicken zum Bündeln)'
              }
            >
              <Boxes className="w-4 h-4" />
            </button>
          </div>

          {/* Map Legend & Radius indicator */}
          <div className="absolute bottom-3 left-3 z-[400] flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur rounded-xl text-[11px] text-slate-600 shadow-sm border border-slate-200 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span>Händler</span>
            </div>
            {enableClustering && (
              <>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-700 text-[8px] text-white flex items-center justify-center font-bold">2+</span>
                  <span>Cluster (klickbar)</span>
                </div>
              </>
            )}
            {centerLocation && (
              <>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <span>Suchort ({radiusKm} km Radius)</span>
                </div>
              </>
            )}
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">Klick auf Marker für Details</span>
          </div>
        </div>

        {/* Sidebar: Dealers Directory & Active Card */}
        <div className="lg:col-span-4 flex flex-col bg-white border-t lg:border-t-0 lg:border-l border-slate-200 max-h-[580px]">
          {/* Header of Sidebar */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {nearbyDealers.length}{' '}
                {nearbyDealers.length === 1 ? 'Händler' : 'Händler'} gefunden
              </h3>
              <p className="text-xs text-slate-500">
                {centerLocation ? `Im Umkreis von ${radiusKm} km um ${centerLocation.name}` : 'Bundesweite Händlerliste'}
              </p>
            </div>
            {centerLocation && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200">
                PLZ {postalCode}
              </span>
            )}
          </div>

          {/* Selected Dealer Detail Card */}
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
                    Verifizierte Leasing-Partner
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
                    id="btn-dealer-sidebar-offers"
                    onClick={() => onFilterByDealer(selectedDealer.name)}
                    className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Bike className="w-3.5 h-3.5" />
                    <span>Räder anzeigen</span>
                  </button>
                )}

                {selectedDealer.locations?.[0] && (
                  <a
                    id="btn-dealer-sidebar-directions"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      `${selectedDealer.name}, ${selectedDealer.locations[0].address_line1}, ${selectedDealer.locations[0].postal_code} ${selectedDealer.locations[0].city}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors flex items-center gap-1"
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
                <h4 className="text-sm font-bold text-slate-900">Keine Händler im gewählten Radius</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Erweitere den Suchradius auf 100 km oder wähle eine benachbarte Stadt in deiner Region.
                </p>
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    id="btn-expand-radius-100"
                    onClick={() => setRadiusKm(100)}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors"
                  >
                    Suchradius auf 100 km erweitern
                  </button>
                  <button
                    id="btn-clear-plz-filter"
                    onClick={() => {
                      setPostalCode('');
                      setSearchInput('');
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                  >
                    Alle Händler bundesweit zeigen
                  </button>
                </div>
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
                      focusDealerMarker(dealer.id);
                    }}
                    className={`p-3.5 cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                      isSelected ? 'bg-emerald-50/80 border-l-4 border-emerald-600' : 'hover:bg-slate-50'
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
                      {dealer.supported_providers && dealer.supported_providers.length > 0 && (
                        <p className="text-[10px] text-emerald-700 font-medium">
                          {dealer.supported_providers.length} Leasing-Partner verfügbar
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      {centerLocation ? (
                        <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                          {dealer.distanceKm} km
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {loc.city}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-400 mt-1 ml-auto" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Comprehensive German Cities Modal Directory */}
      {showCityPicker && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  <span>Stadtauswahl Deutschland (Alle 16 Bundesländer)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Wähle deinen Standort oder eine Metropole für die Händlersuche
                </p>
              </div>
              <button
                onClick={() => setShowCityPicker(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Grouped by Bundesland */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
              {/* Top Metropolen Section */}
              <div>
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <span>⭐</span> Top Metropolen
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {TOP_GERMAN_METROPOLES.map((city) => (
                    <button
                      key={`modal-metro-${city.code}`}
                      onClick={() => handleSelectCity(city)}
                      className={`p-2 rounded-xl text-left border transition-all text-xs font-medium flex items-center justify-between ${
                        postalCode === city.code
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                          : 'bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 border-slate-200'
                      }`}
                    >
                      <span className="truncate">{city.name}</span>
                      <span className="text-[10px] opacity-75 shrink-0 ml-1">{city.code}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* By Bundesland */}
              {Object.entries(CITIES_BY_STATE).map(([state, cities]) => (
                <div key={state} className="pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    <span>{state}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({cities.length})</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {cities.map((city) => (
                      <button
                        key={`modal-${state}-${city.code}`}
                        onClick={() => handleSelectCity(city)}
                        className={`p-2 rounded-xl text-left border transition-all text-xs flex items-center justify-between ${
                          postalCode === city.code
                            ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                            : 'bg-white hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span className="truncate">{city.name}</span>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-1">{city.code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => {
                  setPostalCode('');
                  setSearchInput('');
                  setShowCityPicker(false);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Standortfilter zurücksetzen (Deutschlandweit)
              </button>
              <button
                onClick={() => setShowCityPicker(false)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
