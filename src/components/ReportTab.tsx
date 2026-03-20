import React, { useState, useRef, useEffect, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import { Station } from '@/data/stations';
import { MapPin, Navigation, CheckCircle, Send, Camera, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { distanceMeters } from '@/lib/geo';
import { compressImage } from '@/lib/imageUtils';

interface ReportTabProps {
  onSubmit: () => void;
}

const MUNSTER_CENTER: [number, number] = [7.6261, 51.9607];

const ReportTab: React.FC<ReportTabProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [hours, setHours] = useState('');
  const [desc, setDesc] = useState('');
  const [wc, setWc] = useState(false);
  const [dog, setDog] = useState(false);
  const [late, setLate] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number }>({ lat: 51.9607, lon: 7.6261 });
  const [submitted, setSubmitted] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const miniMapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!miniMapRef.current || mapInstanceRef.current) return;

    const map = new maplibregl.Map({
      container: miniMapRef.current,
      style: {
        version: 8,
        sources: {
          osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256 },
        },
        layers: [{
          id: 'osm', type: 'raster', source: 'osm',
          paint: { 'raster-brightness-max': 0.35, 'raster-saturation': -0.6, 'raster-hue-rotate': 195 },
        }],
      },
      center: MUNSTER_CENTER,
      zoom: 13,
      attributionControl: false,
    });

    const marker = new maplibregl.Marker({ color: '#e84670', draggable: true })
      .setLngLat(MUNSTER_CENTER)
      .addTo(map);

    marker.on('dragend', () => {
      const { lng, lat } = marker.getLngLat();
      setCoords({ lat, lon: lng });
    });

    markerRef.current = marker;
    mapInstanceRef.current = map;

    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  const handleGPS = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lon: longitude });
        markerRef.current?.setLngLat([longitude, latitude]);
        mapInstanceRef.current?.flyTo({ center: [longitude, latitude], zoom: 15 });
      },
      () => {}
    );
  }, []);

  const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoError('');
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    if (!photo) {
      setPhotoError('Please add a photo before submitting');
      return;
    }

    setSubmitting(true);

    try {
      // Compress and upload photo
      const compressed = await compressImage(photo);
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('station-photos')
        .upload(fileName, compressed, { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('station-photos')
        .getPublicUrl(fileName);

      const photoUrl = urlData.publicUrl;

      // Check for existing unverified station within 50m
      const { data: existing } = await supabase
        .from('community_stations')
        .select('*')
        .eq('verified', false);

      let merged = false;
      if (existing) {
        for (const row of existing) {
          const dist = distanceMeters(coords.lat, coords.lon, row.lat, row.lon);
          if (dist <= 50) {
            const newCount = (row.report_count || 1) + 1;
            const shouldVerify = newCount >= 4;
            await supabase
              .from('community_stations')
              .update({
                report_count: newCount,
                verified: shouldVerify,
              })
              .eq('id', row.id);
            merged = true;
            onSubmit();
            break;
          }
        }
      }

      if (!merged) {
        const { error: insertError } = await supabase
          .from('community_stations')
          .insert({
            name: name.trim(),
            address: address.trim(),
            postal_code: '48143',
            hours: hours.trim() || 'Not specified',
            description: desc.trim() || null,
            lat: coords.lat,
            lon: coords.lon,
            wc, dog, late,
            photo_url: photoUrl,
          });

        if (insertError) throw insertError;
        onSubmit();
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-5 px-6">
        <div className="w-20 h-20 rounded-2xl bg-primary/15 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
          Station submitted!
        </h2>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Your station is now visible on the map with a red marker. Thank you for contributing!
        </p>
        <button
          onClick={() => { setSubmitted(false); setPhoto(null); setPhotoPreview(null); }}
          className="mt-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Report another
        </button>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 bg-secondary/60 border border-border/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all";

  return (
    <div className="h-full overflow-y-auto">
      <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-lg mx-auto pb-8">
        <div>
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
            Report a Station
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Help the community find more water refill spots.</p>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Station Name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} placeholder="e.g. Café am Dom" />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Street Address *</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required className={inputClass} placeholder="e.g. Domplatz 12" />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Opening Hours</label>
          <input type="text" value={hours} onChange={(e) => setHours(e.target.value)} className={inputClass} placeholder="e.g. Mo–Fr 9–18" />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Description</label>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} className={`${inputClass} resize-none`} placeholder="Any helpful details..." />
        </div>

        {/* Photo upload */}
        <div>
          <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
            Add photo of tap and surroundings (required) *
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            className="hidden"
          />
          {photoPreview ? (
            <div className="relative">
              <img src={photoPreview} alt="Station preview" className="w-full h-40 object-cover rounded-xl border border-border/50" />
              <button
                type="button"
                onClick={() => { setPhoto(null); setPhotoPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-card/90 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 rounded-xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/40 hover:text-primary transition-all"
            >
              <Camera className="w-6 h-6" />
              <span className="text-xs font-medium">Tap to add photo</span>
            </button>
          )}
          {photoError && (
            <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {photoError}
            </p>
          )}
        </div>

        {/* Accessibility toggles */}
        <div className="flex gap-2 flex-wrap">
          {[
            { label: '♿ Wheelchair', state: wc, set: setWc },
            { label: '🐕 Pet-friendly', state: dog, set: setDog },
            { label: '🌙 Open evenings', state: late, set: setLate },
          ].map(({ label, state, set }) => (
            <button
              type="button" key={label}
              onClick={() => set(!state)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                state
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                  : 'bg-card text-foreground border-border/50 hover:border-primary/30'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Mini map */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
              <MapPin className="w-3 h-3" /> Drag pin to set location
            </label>
            <button type="button" onClick={handleGPS} className="text-[11px] text-primary flex items-center gap-1 font-semibold hover:text-primary/80 transition-colors">
              <Navigation className="w-3 h-3" /> Use GPS
            </button>
          </div>
          <div ref={miniMapRef} className="w-full h-48 rounded-2xl border border-border/50 overflow-hidden" />
          <p className="text-[10px] text-muted-foreground mt-1.5">
            {coords.lat.toFixed(5)}, {coords.lon.toFixed(5)}
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50"
          style={{
            fontFamily: 'var(--font-heading)',
            background: 'linear-gradient(135deg, hsl(168 72% 42%), hsl(168 72% 35%))',
            color: 'hsl(200 30% 7%)',
          }}
        >
          <Send className="w-4 h-4" />
          {submitting ? 'SUBMITTING...' : 'SUBMIT STATION'}
        </button>
      </form>
    </div>
  );
};

export default ReportTab;
