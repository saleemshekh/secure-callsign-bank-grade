import { useState, useEffect } from 'react'

export default function App() {
  const [auth, setAuth] = useState(false)
  const [pin, setPin] = useState('')
  const [vpn, setVpn] = useState('Checking...')
  const [vpnColor, setVpnColor] = useState('#fbbf24')
  const [ipInfo, setIpInfo] = useState('...')
  const [isBlocked, setIsBlocked] = useState(false)

  useEffect(() => { checkVPN() }, [])

  const checkVPN = async () => {
    setVpn('Checking Real IP...')
    setIpInfo('Fetching...')
    try {
      // Try 1: ipwho.is (free, no limit)
      let res = await fetch('https://ipwho.is/')
      let data = await res.json()
      let ip = data.ip
      let city = data.city
      let country = data.country
      let org = data.connection?.org || data.connection?.isp || 'Unknown'
      
      setIpInfo(`${city}, ${country} - ${ip} (${org})`)

      const orgLower = org.toLowerCase()
      const isVPN = orgLower.includes('vpn') || orgLower.includes('host') || orgLower.includes('cloud') || orgLower.includes('latitude') || data.country_code !== 'SA'

      if (isVPN) {
        setVpn(`⚠️ VPN / Proxy DETECTED! - ${country}`)
        setVpnColor('#ef4444')
        setIsBlocked(true)
      } else {
        setVpn(`SECURE ✅ - Saudi IP - ${org}`)
        setVpnColor('#22c55e')
        setIsBlocked(false)
      }
    } catch (e) {
      // Fallback 2
      try {
        const r2 = await fetch('https://ipapi.co/json/')
        const d2 = await r2.json()
        setIpInfo(`${d2.city}, ${d2.country_name} - ${d2.ip}`)
        setVpn(`SECURE ✅ - ${d2.country_name}`)
        setVpnColor('#22c55e')
        setIsBlocked(d2.country_code !== 'SA')
      } catch {
        setVpn('VPN Check Failed - Try Again')
        setIpInfo('Internet slow - Press Re-Check')
        setVpnColor('#fbbf24')
      }
    }
  }

  if (!auth) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: '#1e293b', padding: 30, borderRadius: 20, width: 350, textAlign: 'center', border: `2px solid ${vpnColor}` }}>
          <h2 style={{ color: '#22c55e' }}>SAMA VAULT V4</h2>
          <p style={{ fontSize: 12, color: vpnColor, fontWeight: 'bold' }}>{vpn}</p>
          <p style={{ fontSize: 10, opacity: 0.6 }}>{ipInfo}</p>
          {isBlocked && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 10, background: 'rgba(239,68,68,0.1)', padding: 8, borderRadius: 8 }}>🚫 SAMA Rule: Saudi IP Only. VPN pe Vault Lock hai.</p>}
          <input type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="PIN: 1234" style={{ width: '90%', padding: 12, borderRadius: 10, marginTop: 15, textAlign: 'center' }} />
          <button onClick={() => pin === '1234' && !isBlocked && setAuth(true)} style={{ width: '100%', padding: 12, borderRadius: 10, background: isBlocked ? '#555' : '#22c55e', marginTop: 10, fontWeight: 'bold', border: 'none', color: isBlocked ? '#aaa' : 'black' }}>{isBlocked ? 'BLOCKED - VPN OFF Karo' : 'UNLOCK VAULT'}</button>
          <button onClick={checkVPN} style={{ marginTop: 10, fontSize: 11, background: 'transparent', color: '#94a3b8', border: 'none', textDecoration: 'underline' }}>Re-Check VPN</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', padding: 20 }}>
      <h1 style={{ color: '#22c55e' }}>VAULT V4 ACTIVE ✅</h1>
      <div style={{ background: '#1e293b', padding: 15, borderRadius: 12, marginTop: 15, borderLeft: `4px solid ${vpnColor}` }}>
        <p style={{ color: vpnColor, fontWeight: 'bold' }}>🔒 {vpn}</p>
        <p>📍 {ipInfo}</p>
        <p>🕒 {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
        <button onClick={checkVPN} style={{ marginTop: 10, padding: '6px 12px', borderRadius: 6, border: 'none', background: '#334155', color: 'white' }}>Re-Check</button>
      </div>
      <button onClick={() => setAuth(false)} style={{ marginTop: 20, padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 8 }}>Lock</button>
    </div>
  )
}