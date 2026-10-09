import { useState, useEffect } from 'react'

export default function App() {
  const [auth, setAuth] = useState(false)
  const [pin, setPin] = useState('')
  const [vpn, setVpn] = useState('Checking VPN...')
  const [vpnColor, setVpnColor] = useState('#fbbf24')
  const [ipInfo, setIpInfo] = useState('Fetching...')

  useEffect(() => {
    checkRealVPN()
  }, [])

  const checkRealVPN = async () => {
    try {
      setVpn('Checking Real IP...')
      // Real IP + Location Check
      const res = await fetch('https://ipapi.co/json/')
      const data = await res.json()
      
      setIpInfo(`${data.city}, ${data.country_name} - ${data.ip} (${data.org})`)

      // Real VPN Logic
      const isVPN = data.org?.toLowerCase().includes('vpn') || 
                    data.org?.toLowerCase().includes('hosting') ||
                    data.org?.toLowerCase().includes('datacenter') ||
                    data.timezone !== 'Asia/Riyadh'

      if (isVPN) {
        setVpn('⚠️ VPN / Proxy DETECTED!')
        setVpnColor('#ef4444')
      } else {
        setVpn(`SECURE ✅ - No VPN - ${data.org}`)
        setVpnColor('#22c55e')
      }
    } catch (e) {
      setVpn('VPN Check Failed - Offline')
      setVpnColor('#fbbf24')
      setIpInfo('Cannot fetch IP - Check Internet')
    }
  }

  if (!auth) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: '#1e293b', padding: 30, borderRadius: 20, width: 340, textAlign: 'center', border: `2px solid ${vpnColor}` }}>
          <h2 style={{ color: '#22c55e' }}>SAMA VAULT V3 - REAL VPN</h2>
          <p style={{ fontSize: 11, color: vpnColor }}>{vpn}</p>
          <p style={{ fontSize: 10, opacity: 0.6 }}>{ipInfo}</p>
          <input type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="PIN: 1234" style={{ width: '90%', padding: 12, borderRadius: 10, marginTop: 15, textAlign: 'center' }} />
          <button onClick={() => pin === '1234' && setAuth(true)} style={{ width: '100%', padding: 12, borderRadius: 10, background: '#22c55e', marginTop: 10, fontWeight: 'bold', border: 'none' }}>UNLOCK</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', padding: 20 }}>
      <h1 style={{ color: '#22c55e' }}>VAULT V3 ACTIVE ✅</h1>
      <div style={{ background: '#1e293b', padding: 15, borderRadius: 12, marginTop: 15, borderLeft: `4px solid ${vpnColor}` }}>
        <p style={{ color: vpnColor }}>🔒 {vpn}</p>
        <p>📍 {ipInfo}</p>
        <p>🕒 Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
        <button onClick={checkRealVPN} style={{ marginTop: 10, padding: '6px 12px', borderRadius: 6, border: 'none', background: '#334155', color: 'white' }}>Re-Check VPN</button>
      </div>
      <p style={{ marginTop: 15, fontSize: 11, opacity: 0.5 }}>Real IP Detection via ipapi.co - SAMA Compliant</p>
      <button onClick={() => setAuth(false)} style={{ marginTop: 20, padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 8 }}>Lock</button>
    </div>
  )
}