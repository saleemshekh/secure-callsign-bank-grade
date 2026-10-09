import { useState, useEffect } from 'react'

export default function App() {
  const [auth, setAuth] = useState(false)
  const [pin, setPin] = useState('')
  const [vpn, setVpn] = useState('Checking...')
  const [vpnColor, setVpnColor] = useState('#fbbf24')
  const [ipInfo, setIpInfo] = useState('...')
  const [gpsInfo, setGpsInfo] = useState('GPS: Not checked')
  const [fakeStatus, setFakeStatus] = useState('Checking GPS...')
  const [fakeColor, setFakeColor] = useState('#fbbf24')
  const [isBlocked, setIsBlocked] = useState(false)
  const [ipCountry, setIpCountry] = useState('')

  useEffect(() => { checkAll() }, [])

  const checkAll = async () => {
    // 1. IP CHECK
    setVpn('Checking Real IP...')
    try {
      let res = await fetch('https://ipwho.is/')
      let data = await res.json()
      setIpCountry(data.country_code)
      setIpInfo(`${data.city}, ${data.country} - ${data.ip} (${data.connection?.org})`)
      const orgLower = (data.connection?.org || '').toLowerCase()
      const isVPN = orgLower.includes('vpn') || orgLower.includes('host') || orgLower.includes('cloud') || orgLower.includes('latitude') || data.country_code !== 'SA'
      if (isVPN) {
        setVpn(`⚠️ VPN DETECTED - ${data.country}`)
        setVpnColor('#ef4444')
        setIsBlocked(true)
      } else {
        setVpn(`SECURE ✅ - Saudi IP`)
        setVpnColor('#22c55e')
      }
      // 2. GPS CHECK after IP
      checkGPS(data.country, data.country_code)
    } catch (e) {
      setVpn('IP Check Failed')
      checkGPS('', '')
    }
  }

  const checkGPS = (ipCountryName: string, ipCode: string) => {
    if (!navigator.geolocation) {
      setFakeStatus('GPS Not Supported')
      return
    }
    setGpsInfo('Getting GPS...')
    setFakeStatus('Analyzing GPS...')
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude
      const lon = pos.coords.longitude
      const acc = pos.coords.accuracy

      // FAKE GPS TRICK 1: Accuracy check - Fake apps give 0-3m perfect accuracy
      const isPerfectAccuracy = acc < 5

      // Get real country from GPS via reverse geocode
      try {
        const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
        const geo = await geoRes.json()
        const gpsCountry = geo.countryCode
        const gpsCity = geo.city || geo.locality
        
        setGpsInfo(`📡 GPS: ${gpsCity}, ${geo.countryName} - ${lat.toFixed(4)}, ${lon.toFixed(4)} (Acc: ${acc.toFixed(0)}m)`)

        // FAKE GPS TRICK 2: Country Mismatch
        if (ipCode && gpsCountry && ipCode !== gpsCountry) {
          setFakeStatus(`🚨 FAKE GPS DETECTED! IP is ${ipCountryName} but GPS is ${geo.countryName}`)
          setFakeColor('#ef4444')
          setIsBlocked(true)
          return
        }
        
        // FAKE GPS TRICK 3: Perfect Accuracy + Timezone Mismatch
        const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone
        if (isPerfectAccuracy && browserTz === 'Asia/Riyadh' && gpsCountry !== 'SA') {
          setFakeStatus(`🚨 FAKE GPS SUSPECT! Accuracy too perfect: ${acc}m`)
          setFakeColor('#ef4444')
          setIsBlocked(true)
          return
        }

        // If all ok
        setFakeStatus(`✅ GPS REAL - Matches Saudi IP`)
        setFakeColor('#22c55e')
        if (vpnColor !== '#ef4444') setIsBlocked(false)

      } catch {
        setGpsInfo(`📡 GPS: ${lat.toFixed(4)}, ${lon.toFixed(4)} (Acc: ${acc.toFixed(0)}m) - Reverse check failed`)
        // Fallback: if accuracy is suspiciously perfect, flag it
        if (acc < 10) {
          setFakeStatus('⚠️ Suspect GPS - Too Perfect')
          setFakeColor('#f59e0b')
        } else {
          setFakeStatus('GPS OK - But cannot verify country')
          setFakeColor('#22c55e')
        }
      }
    }, (err) => {
      setGpsInfo('GPS Permission Denied - Enable GPS')
      setFakeStatus('⚠️ GPS OFF - SAMA Requires GPS ON')
      setFakeColor('#f59e0b')
      // Don't block if GPS off, but warn
    }, { enableHighAccuracy: true, timeout: 10000 })
  }

  if (!auth) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: '#1e293b', padding: 24, borderRadius: 20, width: 360, textAlign: 'center', border: `2px solid ${isBlocked ? '#ef4444' : fakeColor}` }}>
          <h2 style={{ color: '#22c55e', margin: 0 }}>SAMA VAULT V5</h2>
          <p style={{ fontSize: 10, color: '#94a3b8' }}>Anti Fake-GPS + VPN</p>
          
          <div style={{ background: '#0f172a', padding: 12, borderRadius: 12, marginTop: 12, textAlign: 'left' }}>
            <p style={{ fontSize: 12, color: vpnColor, fontWeight: 'bold', margin: 0 }}>{vpn}</p>
            <p style={{ fontSize: 10, opacity: 0.7, margin: '4px 0' }}>{ipInfo}</p>
            <hr style={{ borderColor: '#334155', margin: '8px 0' }} />
            <p style={{ fontSize: 10, opacity: 0.7, margin: '4px 0' }}>{gpsInfo}</p>
            <p style={{ fontSize: 12, color: fakeColor, fontWeight: 'bold', margin: '6px 0 0 0' }}>{fakeStatus}</p>
          </div>

          {isBlocked && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 10, background: 'rgba(239,68,68,0.15)', padding: 8, borderRadius: 8 }}>🚫 BLOCKED: VPN/Fake GPS Not Allowed</p>}
          
          <input type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="PIN: 1234" style={{ width: '90%', padding: 12, borderRadius: 10, marginTop: 12, textAlign: 'center', border: 'none' }} />
          <button onClick={() => pin === '1234' && !isBlocked && setAuth(true)} style={{ width: '100%', padding: 12, borderRadius: 10, background: isBlocked ? '#555' : '#22c55e', marginTop: 10, fontWeight: 'bold', border: 'none', color: isBlocked ? '#aaa' : 'black' }}>{isBlocked ? 'BLOCKED' : 'UNLOCK VAULT'}</button>
          <button onClick={checkAll} style={{ marginTop: 10, fontSize: 11, background: 'transparent', color: '#94a3b8', border: 'none', textDecoration: 'underline' }}>Re-Check All</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', padding: 20 }}>
      <h1 style={{ color: '#22c55e' }}>VAULT V5 ACTIVE ✅</h1>
      <div style={{ background: '#1e293b', padding: 15, borderRadius: 12, marginTop: 15, borderLeft: `4px solid ${fakeColor}` }}>
        <p style={{ color: vpnColor, fontWeight: 'bold' }}>🔒 {vpn}</p>
        <p style={{ fontSize: 13 }}>{ipInfo}</p>
        <p style={{ fontSize: 13, marginTop: 8 }}>{gpsInfo}</p>
        <p style={{ color: fakeColor, fontWeight: 'bold' }}>{fakeStatus}</p>
        <p style={{ fontSize: 11, opacity: 0.6 }}>🕒 {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
        <button onClick={checkAll} style={{ marginTop: 10, padding: '6px 12px', borderRadius: 6, border: 'none', background: '#334155', color: 'white' }}>Re-Check</button>
      </div>
      <button onClick={() => setAuth(false)} style={{ marginTop: 20, padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 8 }}>Lock</button>
    </div>
  )
}