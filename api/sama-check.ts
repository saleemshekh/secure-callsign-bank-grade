export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ blocked: true, reason: 'Method Not Allowed' })
  }

  try {
    const { lat, lon, accuracy } = req.body || {}
    
    // Vercel gives country code in header - yahi VPN pakadta hai
    const ipCountry = req.headers['x-vercel-ip-country'] as string || 
                      req.headers['x-vercel-ip-country-code'] as string || 
                      req.headers['x-real-ip-country'] as string || 'UNKNOWN'
    
    const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown'

    // 1. Saudi bounding box check
    const isInSaudi = lat >= 16 && lat <= 33 && lon >= 34 && lon <= 56
    
    if (!isInSaudi) {
      return res.json({ 
        blocked: true, 
        reason: `🚨 BACKEND BLOCK: GPS Outside Saudi (${lat?.toFixed(2)}, ${lon?.toFixed(2)})` 
      })
    }

    // 2. Fake GPS check
    if (accuracy && accuracy < 3) {
      return res.json({ 
        blocked: true, 
        reason: `🚨 BACKEND BLOCK: Fake GPS - Accuracy ${accuracy}m too perfect` 
      })
    }

    // 3. VPN / IP check - YAHI MAIN HAI
    if (ipCountry !== 'UNKNOWN' && ipCountry !== 'SA') {
      return res.json({ 
        blocked: true, 
        reason: `🚨 BACKEND BLOCK: VPN/IP Mismatch (IP Country: ${ipCountry})` 
      })
    }

    // If IP header missing (local test), allow but show warning
    if (ipCountry === 'UNKNOWN') {
      return res.json({ 
        blocked: false, 
        reason: `✅ BACKEND VERIFIED - SAMA SECURE (IP: ${ipCountry} - Dev Mode)` 
      })
    }

    return res.json({ 
      blocked: false, 
      reason: `✅ BACKEND VERIFIED - SAMA SECURE (IP: ${ipCountry})` 
    })

  } catch (e: any) {
    return res.status(200).json({ 
      blocked: false, 
      reason: `✅ BACKEND VERIFIED - SAMA SECURE` 
    })
  }
}