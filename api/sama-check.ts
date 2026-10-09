export default function handler(req, res) {
  const { lat, lon, accuracy } = req.body || {};
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
  const country = req.headers['x-vercel-ip-country'] || 'SA';

  // 1. Agar lat/lon aaya hai tab hi GPS check karo
  if (lat && lon) {
    if (lat < 16 || lat > 33 || lon < 34 || lon > 56) {
      return res.json({ blocked: true, reason: `GPS Outside Saudi (${lat.toFixed(2)}, ${lon.toFixed(2)})`, ip, country });
    }
    if (accuracy && accuracy < 3) {
      return res.json({ blocked: true, reason: `Fake GPS Acc ${accuracy}m`, ip, country });
    }
  }

  // 2. IP Check - Sirf tab block karo jab country SA na ho
  if (country!== 'SA' && country!== 'XX' && country!== undefined) {
     return res.json({ blocked: true, reason: `VPN IP Outside SA (${country})`, ip, country });
  }

  // Sab OK
  return res.json({ blocked: false, reason: `SAMA SECURE`, ip, country, lat, lon });
}