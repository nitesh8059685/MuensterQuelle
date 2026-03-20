import React from 'react';
import { Map, Plus, BarChart3 } from 'lucide-react';
import type { TabType } from '@/pages/Index';

interface TabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'find', label: 'FIND', icon: Map },
  { id: 'report', label: 'REPORT', icon: Plus },
  { id: 'stats', label: 'STATS', icon: BarChart3 },
];

const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => (
  <nav className="flex items-center justify-around bg-card/80 backdrop-blur-xl border-t border-border/50 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] z-50 relative">
    {tabs.map(({ id, label, icon: Icon }) => (
      <button
        key={id}
        onClick={() => onTabChange(id)}
        className={`flex flex-col items-center gap-1 px-6 py-1.5 rounded-xl transition-all duration-200 ${
          activeTab === id
            ? 'text-primary bg-primary/10'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="text-[10px] font-bold tracking-widest" style={{ fontFamily: 'var(--font-heading)' }}>
          {label}
        </span>
      </button>
    ))}
  </nav>
);

export default TabBar;
