import React, { useState, useCallback, useEffect } from 'react';
import { Station, stations as defaultStations } from '@/data/stations';
import { distanceMeters } from '@/lib/geo';
import { supabase } from '@/integrations/supabase/client';
import TopBar from '@/components/TopBar';
import TabBar from '@/components/TabBar';
import FindTab from '@/components/FindTab';
import ReportTab from '@/components/ReportTab';
import StatsTab from '@/components/StatsTab';

export type TabType = 'find' | 'report' | 'stats';
export type FilterType = 'wc' | 'dog' | 'late' | 'community';

function mapDbRow(row: any): Station {
  return {
    id: row.id,
    n: row.name,
    a: row.address,
    p: row.postal_code,
    h: row.hours,
    lat: row.lat,
    lon: row.lon,
    wc: row.wc,
    dog: row.dog,
    late: row.late,
    community: true,
    photoUrl: row.photo_url,
    submittedAt: row.submitted_at,
    verified: row.verified,
    reportCount: row.report_count,
    desc: row.description,
  };
}

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('find');
  const [communityStations, setCommunityStations] = useState<Station[]>([]);
  const [activeFilters, setActiveFilters] = useState<Set<FilterType>>(new Set());
  const [flyTo, setFlyTo] = useState<{ lat: number; lon: number } | null>(null);
  const [radiusFilter, setRadiusFilter] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  const fetchCommunityStations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('community_stations')
        .select('*');
      if (error) throw error;
      if (data) setCommunityStations(data.map(mapDbRow));
    } catch (err) {
      console.error('Failed to fetch community stations:', err);
      // Graceful fallback — show only official stations
    }
  }, []);

  useEffect(() => {
    fetchCommunityStations();
  }, [fetchCommunityStations]);

  const allStations = [...defaultStations, ...communityStations];

  const filteredStations = allStations.filter((s) => {
    if (activeFilters.size > 0) {
      if (activeFilters.has('wc') && !s.wc) return false;
      if (activeFilters.has('dog') && !s.dog) return false;
      if (activeFilters.has('late') && !s.late) return false;
      if (activeFilters.has('community') && !s.community) return false;
    }
    if (radiusFilter && userLocation) {
      const dist = distanceMeters(userLocation.lat, userLocation.lon, s.lat, s.lon);
      if (dist > radiusFilter) return false;
    }
    return true;
  });

  const toggleFilter = useCallback((f: FilterType) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  }, []);

  const handleReport = useCallback(async () => {
    // Refetch from Supabase to get latest state
    await fetchCommunityStations();
    setActiveTab('find');
  }, [fetchCommunityStations]);

  const handleStationClick = useCallback((lat: number, lon: number) => {
    setFlyTo({ lat, lon });
    setActiveTab('find');
  }, []);

  return (
    <div className="h-[100dvh] w-screen flex flex-col bg-background overflow-hidden">
      <TopBar stationCount={allStations.length} />

      <div className="flex-1 relative overflow-hidden">
        {activeTab === 'find' && (
          <FindTab
            stations={filteredStations}
            activeFilters={activeFilters}
            toggleFilter={toggleFilter}
            flyTo={flyTo}
            onFlyToDone={() => setFlyTo(null)}
            radiusFilter={radiusFilter}
            onRadiusChange={setRadiusFilter}
            userLocation={userLocation}
            onUserLocationChange={setUserLocation}
          />
        )}
        {activeTab === 'report' && <ReportTab onSubmit={handleReport} />}
        {activeTab === 'stats' && (
          <StatsTab
            allStations={allStations}
            communityStations={communityStations}
            filteredCount={filteredStations.length}
            onStationClick={handleStationClick}
          />
        )}
      </div>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
