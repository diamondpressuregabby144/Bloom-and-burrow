// Real pediatrician / children's hospital data for the Cleveland/Chattanooga, TN
// area, gathered when this project was built. To make this live for any city,
// swap this static list for a call to the Google Places API (free tier covers
// roughly 11,000 searches/month) using the user's device location.
export const CARE_PROVIDERS = [
  { type: "Pediatrician", name: "Peerless Pediatrics", address: "1060 Peerless Crossing #100, Cleveland, TN 37312", phone: "+1 423-339-5656", rating: 4.3, ratingCount: 68, lat: 35.1933084, lng: -84.8708166 },
  { type: "Pediatrician", name: "Cleveland Pediatrics", address: "435 25th St NW, Cleveland, TN 37311", phone: "+1 423-479-9733", rating: 3.7, ratingCount: 213, lat: 35.1797832, lng: -84.8698106 },
  { type: "Pediatrician", name: "Ocoee Pediatrics", address: "55 25th St NW #1, Cleveland, TN 37311", phone: "+1 423-614-3733", rating: 3.7, ratingCount: 78, lat: 35.178765, lng: -84.866332 },
  { type: "Children's Hospital", name: "Children's Hospital at Erlanger (T C Thompson)", address: "910 Blackford St, Chattanooga, TN 37403", phone: "+1 423-778-6011", rating: 3.4, ratingCount: 231, lat: 35.0492962, lng: -85.2905371 },
  { type: "Children's Hospital", name: "Adolescent Medicine — Children's Hospital at Erlanger", address: "900 E 3rd St, Chattanooga, TN 37403", phone: "+1 423-778-5437", rating: 3.8, ratingCount: 47, lat: 35.0483159, lng: -85.2925274 },
];

export function haversineMiles(lat1, lng1, lat2, lng2) {
  if ([lat1, lng1, lat2, lng2].some((v) => typeof v !== "number")) return null;
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function mapsDirectionsUrl(address) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}
