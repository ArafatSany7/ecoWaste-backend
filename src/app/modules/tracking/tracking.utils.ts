// Geo helpers for live tracking. Kept dependency-free so they run on Vercel serverless.

const EARTH_RADIUS_M = 6_371_000;

/** Road distance is longer than a straight line; ~1.3x is a common urban detour factor. */
const ROAD_FACTOR = 1.3;

/** Average collection-truck speed in city traffic, used until a routing service is added. */
const AVG_CITY_SPEED_KMH = 20;

/** A GPS fix older than this is shown as "last seen" rather than live. */
export const STALE_AFTER_MS = 2 * 60 * 1000;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in metres. */
export function haversineMeters(
	aLat: number,
	aLng: number,
	bLat: number,
	bLng: number,
) {
	const dLat = toRad(bLat - aLat);
	const dLng = toRad(bLng - aLng);
	const h =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
	return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Rough road distance and ETA between two points. */
export function estimateEta(
	fromLat: number,
	fromLng: number,
	toLat: number,
	toLng: number,
) {
	const distanceMeters = Math.round(
		haversineMeters(fromLat, fromLng, toLat, toLng) * ROAD_FACTOR,
	);
	const minutes = Math.max(
		1,
		Math.round((distanceMeters / 1000 / AVG_CITY_SPEED_KMH) * 60),
	);
	return { distanceMeters, minutes, method: "estimate" as const };
}
