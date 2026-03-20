import React, { useEffect, useRef, useCallback, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Station } from '@/data/stations';
import type { FilterType } from '@/pages/Index';
import { Navigation, Locate, X, Clock, Footprints, Search, MapPin } from 'lucide-react';
import { fetchRoute, formatDistance, walkingMinutes, distanceMeters, geocodeAddress } from '@/lib/geo';

const MUNSTER_CENTER: [number, number] = [7.6261, 51.9607];

const RADIUS_OPTIONS = [
  { value: null, label: 'All' },
  { value: 100, label: '100m' },
  { value: 250, label: '250m' },
  { value: 500, label: '500m' },
  { value: 750, label: '750m' },
  { value: 1000, label: '1km' },
  { value: 1250, label: '1.25km' },
  { value: 1500, label: '1.5km' },
  { value: 1750, label: '1.75km' },
  { value: 2000, label: '2km' },
  { value: 2500, label: '2.5km' },
  { value: 3000, label: '3km' },
];

interface FindTabProps {
  stations: Station[];
  activeFilters: Set<FilterType>;
  toggleFilter: (f: FilterType) => void;
  flyTo: { lat: number; lon: number } | null;
  onFlyToDone: () => void;
  radiusFilter: number | null;
  onRadiusChange: (r: number | null) => void;
  userLocation: { lat: number; lon: number } | null;
  onUserLocationChange: (loc: { lat: number; lon: number }) => void;
}

function getMarkerColor(s: Station): string {
  if (!s.community) return '#2db89e'; // official teal
  if (s.verified) return '#2db89e'; // verified community = teal
  if (s.submittedAt) {
    const daysSince = (Date.now() - new Date(s.submittedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince >= 7) return '#6b7280'; // grey — unverified after 7 days
  }
  return '#e84670'; // red — awaiting verification
}

function getInnerColor(color: string): string {
  if (color === '#2db89e') return '#d0f5ee';
  if (color === '#e84670') return '#fda4af';
  return '#d1d5db'; // grey inner
}

function createMarkerEl(s: Station): HTMLElement {
  const el = document.createElement('div');
  const color = getMarkerColor(s);
  const isGrey = color === '#6b7280';
  el.className = `water-marker${s.community ? ' community-marker' : ''}${isGrey ? ' grey-marker' : ''}`;
  el.innerHTML = `<svg width="30" height="38" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 0C14 0 0 12.8 0 21a14 14 0 0028 0C28 12.8 14 0 14 0z" fill="${color}" fill-opacity="0.85"/>
    <circle cx="14" cy="20" r="5.5" fill="${getInnerColor(color)}" fill-opacity="0.9"/>
  </svg>`;
  return el;
}

function popupHTML(s: Station, userLoc: { lat: number; lon: number } | null): string {
  const tags = [
    s.wc && '♿ Wheelchair',
    s.dog && '🐕 Pet-friendly',
    s.late && '🌙 Open late',
    s.community && !s.verified && '🆕 Community',
    s.community && s.verified && '✅ Verified',
  ].filter(Boolean);

  let distInfo = '';
  if (userLoc) {
    const dist = distanceMeters(userLoc.lat, userLoc.lon, s.lat, s.lon);
    const mins = walkingMinutes(dist);
    distInfo = `<div style="display:flex;gap:12px;margin-bottom:10px;font-size:11px;color:rgba(208,245,238,0.7)">
      <span>📍 ${formatDistance(dist)}</span>
      <span>🚶 ~${mins} min walk</span>
    </div>`;
  }

  // Community station extra info
  let communityInfo = '';
  if (s.community) {
    const date = s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : 'Unknown';
    const verifiedText = s.verified
      ? '<span style="color:#2db89e">✅ Verified by community</span>'
      : '<span style="color:#e84670">❌ Verified: No — pending community confirmation</span>';
    communityInfo = `
      <div style="margin-bottom:10px;font-size:11px;space-y:2px;color:rgba(208,245,238,0.7)">
        <p>🏘️ Submitted by community</p>
        <p>📅 ${date}</p>
        <p>📊 Reported ${s.reportCount || 1} time${(s.reportCount || 1) !== 1 ? 's' : ''}</p>
        <p>${verifiedText}</p>
      </div>
      ${s.photoUrl ? `<img src="${s.photoUrl}" alt="Station photo" style="width:100%;height:80px;object-fit:cover;border-radius:8px;margin-bottom:10px" />` : ''}
    `;
  }

  return `
    <div style="font-family:var(--font-body);padding:16px">
      <h3 style="font-family:var(--font-heading);font-weight:700;font-size:15px;margin:0 0 4px;color:#d0f5ee">${s.n}</h3>
      <p style="font-size:12px;opacity:0.55;margin:0 0 2px">${s.a}, ${s.p}</p>
      <p style="font-size:12px;opacity:0.55;margin:0 0 10px">🕐 ${s.h}</p>
      ${distInfo}
      ${communityInfo}
      ${tags.length ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px">${tags.map(t => `<span style="font-size:10px;background:rgba(255,255,255,0.06);padding:3px 8px;border-radius:6px">${t}</span>`).join('')}</div>` : ''}
      <button onclick="window.__navigateToStation('${s.id}',${s.lat},${s.lon})"
         style="display:flex;align-items:center;justify-content:center;gap:6px;width:100%;background:linear-gradient(135deg,#2db89e,#1a9680);color:#0a1a17;padding:10px 16px;border-radius:10px;font-size:12px;font-weight:700;border:none;cursor:pointer;font-family:var(--font-heading);letter-spacing:0.5px">
        🧭 Navigate Here
      </button>
    </div>
  `;
}

const filters: { key: FilterType; label: string; emoji: string }[] = [
  { key: 'wc', label: 'Wheelchair', emoji: '♿' },
  { key: 'dog', label: 'Dogs', emoji: '🐕' },
  { key: 'late', label: 'Evening', emoji: '🌙' },
  { key: 'community', label: 'Community', emoji: '🆕' },
];

const FindTab: React.FC<FindTabProps> = ({
  stations, activeFilters, toggleFilter, flyTo, onFlyToDone,
  radiusFilter, onRadiusChange, userLocation, onUserLocationChange,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const [showRadiusSelect, setShowRadiusSelect] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);
  const [selectedStationId, setSelectedStationId] = useState<number | string | null>(null);
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [addressQuery, setAddressQuery] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState('');

  const handleAddressSearch = useCallback(async () => {
    if (!addressQuery.trim()) return;
    setAddressLoading(true);
    setAddressError('');
    const result = await geocodeAddress(addressQuery.trim());
    setAddressLoading(false);
    if (!result) {
      setAddressError('Location not found');
      return;
    }
    onUserLocationChange({ lat: result.lat, lon: result.lon });
    mapRef.current?.flyTo({ center: [result.lon, result.lat], zoom: 15, duration: 1000 });

    if (userMarkerRef.current) userMarkerRef.current.remove();
    const el = document.createElement('div');
    el.style.cssText = 'width:16px;height:16px;background:#3b82f6;border:3px solid #d0f5ee;border-radius:50%;box-shadow:0 0 12px rgba(59,130,246,0.5)';
    userMarkerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat([result.lon, result.lat])
      .addTo(mapRef.current!);
    setShowAddressInput(false);
    setAddressQuery('');
  }, [addressQuery, onUserLocationChange]);

  // Global navigate handler for popup button
  useEffect(() => {
    (window as any).__navigateToStation = async (stationId: number | string, lat: number, lon: number) => {
      const map = mapRef.current;
      if (!map) return;

      setSelectedStationId(stationId);

      if (map.getSource('route')) {
        map.removeLayer('route-line');
        map.removeLayer('route-outline');
        map.removeSource('route');
      }
      setRouteInfo(null);

      let fromLat = userLocation?.lat;
      let fromLon = userLocation?.lon;

      if (!fromLat || !fromLon) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000 })
          );
          fromLat = pos.coords.latitude;
          fromLon = pos.coords.longitude;
          onUserLocationChange({ lat: fromLat, lon: fromLon });
        } catch {
          const center = map.getCenter();
          fromLat = center.lat;
          fromLon = center.lng;
        }
      }

      const route = await fetchRoute(fromLon, fromLat, lon, lat);
      if (!route) {
        setSelectedStationId(null);
        return;
      }

      setRouteInfo({ distance: route.distance, duration: route.duration });

      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: route.coordinates },
        },
      });

      map.addLayer({
        id: 'route-outline',
        type: 'line',
        source: 'route',
        paint: { 'line-color': '#0a1a17', 'line-width': 7, 'line-opacity': 0.4 },
      });

      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        paint: { 'line-color': '#2db89e', 'line-width': 4, 'line-opacity': 0.85 },
      });

      const coords = route.coordinates;
      const bounds = coords.reduce(
        (b, c) => b.extend(c as [number, number]),
        new maplibregl.LngLatBounds(coords[0] as [number, number], coords[0] as [number, number])
      );
      map.fitBounds(bounds, { padding: 80, duration: 800 });
    };

    return () => { delete (window as any).__navigateToStation; };
  }, [userLocation, onUserLocationChange]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [{
          id: 'osm-tiles',
          type: 'raster',
          source: 'osm',
          paint: {
            'raster-brightness-max': 0.35,
            'raster-saturation': -0.6,
            'raster-hue-rotate': 195,
          },
        }],
      },
      center: MUNSTER_CENTER,
      zoom: 13,
      attributionControl: true,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    mapRef.current = map;

    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Update markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const visibleStations = selectedStationId === null
      ? stations
      : stations.filter((s) => s.id === selectedStationId);

    visibleStations.forEach((s) => {
      const el = createMarkerEl(s);
      const popup = new maplibregl.Popup({ offset: 22, closeButton: true, maxWidth: '300px' })
        .setHTML(popupHTML(s, userLocation));
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([s.lon, s.lat])
        .setPopup(popup)
        .addTo(map);
      markersRef.current.push(marker);
    });
  }, [stations, userLocation, selectedStationId]);

  // Fly to location
  useEffect(() => {
    if (!flyTo || !mapRef.current) return;
    mapRef.current.flyTo({ center: [flyTo.lon, flyTo.lat], zoom: 16, duration: 1200 });
    onFlyToDone();
  }, [flyTo, onFlyToDone]);

  const clearRoute = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    if (map.getSource('route')) {
      map.removeLayer('route-line');
      map.removeLayer('route-outline');
      map.removeSource('route');
    }
    setRouteInfo(null);
    setSelectedStationId(null);
  }, []);

  const handleLocate = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        onUserLocationChange({ lat: latitude, lon: longitude });
        mapRef.current?.flyTo({ center: [longitude, latitude], zoom: 15, duration: 1000 });

        if (userMarkerRef.current) userMarkerRef.current.remove();
        const el = document.createElement('div');
        el.style.cssText = 'width:16px;height:16px;background:#3b82f6;border:3px solid #d0f5ee;border-radius:50%;box-shadow:0 0 12px rgba(59,130,246,0.5)';
        userMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat([longitude, latitude])
          .addTo(mapRef.current!);
      },
      () => {
        mapRef.current?.flyTo({ center: MUNSTER_CENTER, zoom: 13, duration: 800 });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [onUserLocationChange]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Top controls */}
      <div className="absolute top-3 left-3 right-3 z-10 space-y-2">
        {/* Filter chips */}
        <div className="flex gap-1.5 flex-wrap">
          {filters.map(({ key, label, emoji }) => (
            <button
              key={key}
              onClick={() => toggleFilter(key)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border backdrop-blur-md transition-all duration-200 ${
                activeFilters.has(key)
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                  : 'bg-card/70 text-foreground border-border/50 hover:border-primary/40'
              }`}
            >
              {emoji} {label}
            </button>
          ))}
        </div>

        {/* Radius selector */}
        <div className="flex gap-1.5 items-center">
          <button
            onClick={() => {
              if (!userLocation) handleLocate();
              setShowRadiusSelect(!showRadiusSelect);
            }}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border backdrop-blur-md transition-all duration-200 ${
              radiusFilter
                ? 'bg-accent text-accent-foreground border-accent shadow-lg shadow-accent/20'
                : 'bg-card/70 text-foreground border-border/50 hover:border-accent/40'
            }`}
          >
            📍 {radiusFilter ? formatDistance(radiusFilter) : 'Nearby'}
          </button>
          {showRadiusSelect && (
            <div className="flex gap-1 flex-wrap">
              {RADIUS_OPTIONS.map(({ value, label }) => (
                <button
                  key={label}
                  onClick={() => { onRadiusChange(value); setShowRadiusSelect(false); }}
                  className={`px-2 py-1 rounded-full text-[10px] font-medium border backdrop-blur-md transition-all ${
                    radiusFilter === value
                      ? 'bg-accent text-accent-foreground border-accent'
                      : 'bg-card/70 text-muted-foreground border-border/50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map legend */}
      <div className="absolute top-[6.5rem] right-3 z-10 bg-card/90 backdrop-blur-md border border-border/50 rounded-xl px-3 py-2.5 space-y-1.5">
        <div className="flex items-center gap-2 text-[10px] text-foreground">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#2db89e' }} />
          Official / Verified
        </div>
        <div className="flex items-center gap-2 text-[10px] text-foreground">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#e84670' }} />
          Community (pending)
        </div>
        <div className="flex items-center gap-2 text-[10px] text-foreground">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#6b7280' }} />
          Unverified (7+ days)
        </div>
      </div>

      {/* Route info bar */}
      {routeInfo && (
        <div className="absolute bottom-16 left-3 right-3 z-10 bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-primary">
              <Footprints className="w-4 h-4" />
              <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                {formatDistance(routeInfo.distance)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-accent">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                ~{Math.round(routeInfo.duration / 60)} min
              </span>
            </div>
          </div>
          <button onClick={clearRoute} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Location buttons */}
      <div className="absolute bottom-4 left-4 z-10 flex gap-2">
        <button
          onClick={handleLocate}
          className="w-11 h-11 rounded-full bg-card/90 backdrop-blur-md border border-border/50 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 shadow-lg"
          title="My location (GPS)"
        >
          <Locate className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowAddressInput(!showAddressInput)}
          className={`w-11 h-11 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-200 shadow-lg ${
            showAddressInput
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card/90 border-border/50 text-accent hover:bg-accent hover:text-accent-foreground'
          }`}
          title="Set location manually"
        >
          <MapPin className="w-4 h-4" />
        </button>
      </div>

      {/* Manual address input */}
      {showAddressInput && (
        <div className="absolute bottom-[4.5rem] left-3 right-3 z-10 bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl px-3 py-3 space-y-2">
          <p className="text-[11px] text-muted-foreground font-medium" style={{ fontFamily: 'var(--font-heading)' }}>
            📍 Enter address or place name
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={addressQuery}
              onChange={(e) => setAddressQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
              placeholder="e.g. Prinzipalmarkt, Münster"
              className="flex-1 bg-secondary/50 border border-border/50 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
            />
            <button
              onClick={handleAddressSearch}
              disabled={addressLoading}
              className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold disabled:opacity-50"
            >
              {addressLoading ? '...' : <Search className="w-3.5 h-3.5" />}
            </button>
          </div>
          {addressError && <p className="text-[10px] text-destructive">{addressError}</p>}
        </div>
      )}
    </div>
  );
};

export default FindTab;
