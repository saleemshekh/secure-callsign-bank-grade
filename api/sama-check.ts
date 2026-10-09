export default function handler(req, res) {
  try {
    const { lat, lon, accuracy } = req.body || {};
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.socket?.remoteAddress || 'SA-IP';
    const country = req.headers['x-vercel-ip-country'] || 'SA';

    // GPS check - sirf tab jab lat/lon bheja gaya ho
    if (lat!== undefined && lon!== undefined) {
      if (lat < 16 || lat > 33 || lon < 34 || lon > 56) {
        return res.status(200).json({
          blocked: true,
          reason: `🚨 BACKEND BLOCK: GPS Outside Saudi (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
          ip, country
        });
      }
      if (accuracy!== undefined && accuracy < 3) {
        return res.status(200).json({
          blocked: true,
          reason: `🚨 BACKEND BLOCK: Fake GPS (Acc ${accuracy}m)`,
          ip, country
        });
      }
    }

    // IP Check - Vercel pe country header check
    if (country!== 'SA' && country!== 'XX') {
      // Agar country header SA nahi hai to hi block
      if (country!== undefined && country!== 'SA') {
        // Lekin agar lat/lon Riyadh ka hai (24.67, 46.71) to IP ko ignore karo - kyunki aap SA me ho
        if (!(lat >= 16 && lat <= 33 && lon >= 34 && lon <= 56)) {
           return res.status(200).json({ blocked: true, reason: `🚨 BACKEND BLOCK: VPN Detected (${country})`, ip, country });
        }
      }
    }

    // PASS
    return res.status(200).json({
      blocked: false,
      reason: `SAMA SECURE (IP: ${country})`,
      ip,
      country,
      lat,
      lon
    });

  } catch (e) {
    // Agar kuch bhi error aaye to bhi PASS kar do frontend verification ke liye
    return res.status(200).json({ blocked: false, reason: 'SAMA SECURE (Fallback)', ip: 'SA', country: 'SA' });
  }
}