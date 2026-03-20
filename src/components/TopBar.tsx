import React from 'react';
import { Droplets } from 'lucide-react';

interface TopBarProps {
  stationCount: number;
}

const TopBar: React.FC<TopBarProps> = ({ stationCount }) => (
  <header className="flex items-center justify-between px-4 py-3 bg-card/80 backdrop-blur-xl border-b border-border/50 z-50 relative">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
        <Droplets className="w-5 h-5 text-primary" />
      </div>
      <h1 className="text-lg font-extrabold tracking-tight text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
        Münster<span className="text-primary">Quelle</span>
      </h1>
    </div>
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
      <span>{stationCount}</span>
      <span className="text-primary/60">stations</span>
    </div>
  </header>
);

export default TopBar;
