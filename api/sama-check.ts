export default async function handler(req, res) {
  try {
    const { lat, lon, accuracy } = req.body || {};
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.socket?.remoteAddress || 'Unknown';

    // Vercel ka country header - sabse accurate hai
    let country = req.headers['x-vercel-ip-country'] || req.headers['x-vercel-ip-city'] || '';

    // Agar Vercel header nahi hai to ipwho.is se check karo
    if (!country || country === 'XX') {
      try {
        const geo = await fetch(`https://ipwho.is/${ip}?fields=country_code`, { cache: 'no-store' }).then(r => r.json());
        country = geo.country_code || 'Unknown';
      } catch {
        country = 'Unknown';
      }
    }

    console.log(`SAMA CHECK: IP=${ip} Country=${country} GPS=${lat},${lon} Acc=${accuracy}`);

    // 1. Fake GPS Check - Accuracy < 3m = Fake
    if (accuracy!== undefined && accuracy < 3) {
      return res.status(200).json({
        blocked: true,
        reason: `🚨 BACKEND BLOCK: Fake GPS Detected (Acc ${accuracy}m)`,
        ip, country
      });
    }

    // 2. GPS Border Check - Outside Saudi
    if (lat!== undefined && lon!== undefined) {
      if (lat < 16 || lat > 33 || lon < 34 || lon > 56) {
        return res.status(200).json({
          blocked: true,
          reason: `🚨 BACKEND BLOCK: GPS Outside Saudi Arabia (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
          ip, country
        });
      }
    }

    // 3. STRICT SAMA VPN CHECK - Country SA nahi hai to BLOCK (Chahe GPS SA me hi kyu na ho)
    // Ye hi aap miss kar rahe the!
    if (country!== 'SA') {
      return res.status(200).json({
        blocked: true,
        reason: `🚨 BACKEND BLOCK: VPN/Proxy Detected - IP Country is ${country} (Must be SA) - IP: ${ip}`,
        ip, country
      });
    }

    // 4. ALL PASS
    return res.status(200).json({
      blocked: false,
      reason: `SAMA SECURE (IP: ${country})`,
      ip,
      country,
      lat,
      lon
    });

  } catch (e) {
    return res.status(200).json({
      blocked: true,
      reason: `Error: ${e.message}`,
      ip: 'Unknown',
      country: 'Unknown'
    });
  }
}
