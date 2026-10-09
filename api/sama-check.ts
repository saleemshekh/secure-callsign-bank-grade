export default async function handler(req: any, res: any) {
  const { lat, lon } = req.body
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || '8.8.8.8'
  const ipData: any = await fetch(`https://ipapi.co/${ip}/json/`).then(r=>r.json())
  const geo: any = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}`).then(r=>r.json())
  if (ipData.country_code!== 'SA') return res.json({ blocked: true, reason: `🚨 BACKEND: VPN ${ipData.country_name}` })
  if (geo.countryCode!== 'SA') return res.json({ blocked: true, reason: `🚨 BACKEND: FAKE GPS ${geo.countryName}` })
  return res.json({ blocked: false, reason: '✅ BACKEND VERIFIED' })
}