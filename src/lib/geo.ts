/** Haversine distance in meters between two lat/lon points */
export function distanceMeters(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Format meters to human-readable string */
export function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

/** Estimate walking time in minutes (~5 km/h) */
export function walkingMinutes(meters: number): number {
  return Math.round(meters / 83.3); // 5 km/h ≈ 83.3 m/min
}

/** Geocode an address string to lat/lon using Nominatim (free, no key) */
export async function geocodeAddress(
  query: string
): Promise<{ lat: number; lon: number; display: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', Münster, Germany')}&format=json&limit=1`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), display: data[0].display_name };
  } catch {
    return null;
  }
}

export async function fetchRoute(
  fromLon: number, fromLat: number,
  toLon: number, toLat: number
): Promise<{ coordinates: [number, number][]; distance: number; duration: number } | null> {

  const API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjIxZDg0ZDNlMmEyYjRkNWQ5OGRmNmMwZDgxNDZhMTY4IiwiaCI6Im11cm11cjY0In0=';

  try {
    const res = await fetch(
      'https://api.openrouteservice.org/v2/directions/foot-walking/geojson',
      {
        method: 'POST',
        headers: {
          'Authorization': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coordinates: [
            [fromLon, fromLat],
            [toLon, toLat],
          ],
          preference: 'shortest',
        }),
      }
    );

    const data = await res.json();
    console.log('ORS response:', data); // 🔍 DEBUG

    if (!data.features || !data.features.length) {
      console.error('No route found');
      return null;
    }

    const route = data.features[0];

    // ✅ Ensure coordinates are valid
    const coords = route.geometry?.coordinates;

    if (!coords || !Array.isArray(coords)) {
      console.error('Invalid geometry', route.geometry);
      return null;
    }

    return {
      coordinates: coords.map((c: any) => [c[0], c[1]]), // ✅ force correct format
      distance: route.properties.summary.distance,
      duration: route.properties.summary.duration,
    };
  } catch (err) {
    console.error('ORS routing error:', err);
    return null;
  }
}