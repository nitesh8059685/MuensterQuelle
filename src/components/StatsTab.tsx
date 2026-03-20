import React from 'react';
import { Station } from '@/data/stations';
import { Droplets, Leaf, Wind, MapPin } from 'lucide-react';

interface StatsTabProps {
  allStations: Station[];
  communityStations: Station[];
  filteredCount: number;
  onStationClick: (lat: number, lon: number) => void;
}

const districts = [
  { name: 'City Centre', count: 28 },
  { name: 'Südviertel', count: 9 },
  { name: 'Hiltrup', count: 7 },
  { name: 'Westfalenweg', count: 5 },
  { name: 'Uni-Viertel', count: 5 },
  { name: 'Other', count: 8 },
];

const maxDistrict = Math.max(...districts.map((d) => d.count));

const StatsTab: React.FC<StatsTabProps> = ({ allStations, communityStations, filteredCount, onStationClick }) => {
  const total = allStations.length;
  const lateCount = allStations.filter((s) => s.late).length;
  const wcCount = allStations.filter((s) => s.wc).length;
  const dogCount = allStations.filter((s) => s.dog).length;

  const bottlesAvoided = total * 3000;
  const plasticTonnes = (bottlesAvoided * 0.05) / 1000;
  const co2Tonnes = plasticTonnes * 4;

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-5 max-w-lg mx-auto pb-8">
        {/* Hero count */}
        <div className="text-center py-6">
          <p className="text-7xl font-extrabold text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
            {total}
          </p>
          <p className="text-sm text-muted-foreground mt-2">water refill stations in Münster</p>
        </div>

        {/* Quick stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Open late', value: lateCount, icon: '🌙', color: 'text-accent' },
            { label: 'Wheelchair', value: wcCount, icon: '♿', color: 'text-primary' },
            { label: 'Pet-friendly', value: dogCount, icon: '🐕', color: 'text-accent' },
            { label: 'Visible (filters)', value: filteredCount, icon: '👁️', color: 'text-primary' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="bg-card border border-border/50 rounded-2xl p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{icon}</span>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <p className={`text-3xl font-bold ${color}`} style={{ fontFamily: 'var(--font-heading)' }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* District bar chart */}
        <div className="bg-card border border-border/50 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-foreground mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            By District
          </h3>
          <div className="space-y-3">
            {districts.map(({ name, count }) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-[11px] text-muted-foreground w-24 shrink-0 text-right font-medium">{name}</span>
                <div className="flex-1 bg-secondary/60 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full rounded-full flex items-center justify-end pr-2.5"
                    style={{
                      width: `${(count / maxDistrict) * 100}%`,
                      background: 'linear-gradient(90deg, hsl(168 72% 42%), hsl(168 72% 35%))',
                    }}
                  >
                    <span className="text-[10px] font-bold text-primary-foreground">{count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Environmental impact */}
        <div className="bg-card border border-border/50 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-foreground mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Environmental Impact <span className="text-muted-foreground font-normal">(est./year)</span>
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Droplets, value: `~${(bottlesAvoided / 1000).toFixed(0)}k`, label: 'bottles avoided', color: 'text-primary' },
              { icon: Leaf, value: `~${plasticTonnes.toFixed(1)}t`, label: 'plastic prevented', color: 'text-accent' },
              { icon: Wind, value: `~${co2Tonnes.toFixed(0)}t`, label: 'CO₂ saved', color: 'text-primary' },
            ].map(({ icon: Icon, value, label, color }) => (
              <div key={label} className="text-center p-3">
                <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
                <p className={`text-xl font-bold ${color}`} style={{ fontFamily: 'var(--font-heading)' }}>
                  {value}
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Community stations list */}
        {communityStations.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              Community Stations
            </h3>
            <div className="space-y-2">
              {communityStations.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onStationClick(s.lat, s.lon)}
                  className="w-full flex items-center gap-3 bg-card border border-border/50 rounded-2xl p-4 text-left hover:border-primary/40 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-destructive/15 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{s.n}</p>
                    <p className="text-[11px] text-muted-foreground">{s.a}</p>
                  </div>
                  <span className="ml-auto text-[10px] bg-destructive/15 text-destructive px-2.5 py-1 rounded-full font-semibold">
                    New
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Attribution */}
        <p className="text-[10px] text-muted-foreground text-center pt-2 pb-4">
          Data: opendata.stadt-muenster.de (CC0) · Map: © OpenStreetMap
        </p>
      </div>
    </div>
  );
};

export default StatsTab;
