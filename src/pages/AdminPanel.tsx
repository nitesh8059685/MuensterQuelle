import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Lock, MapPin } from 'lucide-react';

interface CommunityStation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  photo_url: string;
  submitted_at: string;
  report_count: number;
  verified: boolean;
}

const AdminPanel: React.FC = () => {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [stations, setStations] = useState<CommunityStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStations = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('community_stations')
      .select('*')
      .eq('verified', false)
      .order('submitted_at', { ascending: false });
    if (data) setStations(data as CommunityStation[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authed) fetchStations();
  }, [authed, fetchStations]);

  const handleAction = async (action: 'verify' | 'reject', id: string) => {
    setActionLoading(id);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/admin-stations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-password': 'munsterquelle2026',
          },
          body: JSON.stringify({ action, id }),
        }
      );
      if (res.ok) {
        setStations((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error('Admin action failed:', err);
    }
    setActionLoading(null);
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4">
          <div className="flex items-center justify-center gap-2 text-foreground">
            <Lock className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Admin Panel</h1>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && password === 'munsterquelle2026') setAuthed(true); }}
            placeholder="Enter password"
            className="w-full px-4 py-3 bg-secondary/60 border border-border/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={() => { if (password === 'munsterquelle2026') setAuthed(true); }}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
          Unverified Stations ({stations.length})
        </h1>

        {loading && <p className="text-muted-foreground text-sm">Loading...</p>}

        {stations.map((s) => (
          <div key={s.id} className="bg-card border border-border/50 rounded-2xl overflow-hidden">
            <div className="flex gap-3 p-4">
              <img
                src={s.photo_url}
                alt={s.name}
                className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm truncate" style={{ fontFamily: 'var(--font-heading)' }}>{s.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{s.address}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  📅 {new Date(s.submitted_at).toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  📊 Reported {s.report_count} time{s.report_count !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <MapPin className="w-3 h-3" />
                  <span>{s.lat.toFixed(4)}, {s.lon.toFixed(4)}</span>
                </div>
              </div>
            </div>

            {/* Small map preview */}
            <img
              src={`https://tile.openstreetmap.org/${15}/${Math.floor((s.lon + 180) / 360 * Math.pow(2, 15))}/${Math.floor((1 - Math.log(Math.tan(s.lat * Math.PI / 180) + 1 / Math.cos(s.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, 15))}.png`}
              alt="Map"
              className="w-full h-24 object-cover"
            />

            <div className="flex gap-2 p-3">
              <button
                onClick={() => handleAction('verify', s.id)}
                disabled={actionLoading === s.id}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                <CheckCircle className="w-3.5 h-3.5" /> Verify
              </button>
              <button
                onClick={() => handleAction('reject', s.id)}
                disabled={actionLoading === s.id}
                className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
            </div>
          </div>
        ))}

        {!loading && stations.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-12">No unverified stations 🎉</p>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
