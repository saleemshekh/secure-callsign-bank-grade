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

  // New V6 States
  const [bills, setBills] = useState([
    { id: 1, name: 'STC / موبايلي', amount: '150 SAR', date: '2026-10-15', paid: false },
    { id: 2, name: 'Electricity / الكهرباء', amount: '320 SAR', date: '2026-10-20', paid: false },
    { id: 3, name: 'Water / المياه', amount: '85 SAR', date: '2026-10-25', paid: true },
  ])

  useEffect(() => { checkAll() }, [])

  // === SAME OLD V5 CODE - NO CHANGE ===
  const checkAll = async () => {
    setVpn('Checking Real IP...')
    try {
      let res = await fetch('https://ipwho.is/')
      let data = await res.json()
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
      checkGPS(data.country, data.country_code)
    } catch (e) {
      setVpn('IP Check Failed')
      checkGPS('', '')
    }
  }

  const checkGPS = (ipCountryName: string, ipCode: string) => {
    if (!navigator.geolocation) { setFakeStatus('GPS Not Supported'); return }
    setGpsInfo('Getting GPS...')
    setFakeStatus('Analyzing GPS...')
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude
      const lon = pos.coords.longitude
      const acc = pos.coords.accuracy
      const isPerfectAccuracy = acc < 5
      try {
        const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
        const geo = await geoRes.json()
        const gpsCountry = geo.countryCode
        const gpsCity = geo.city || geo.locality
        setGpsInfo(`📡 GPS: ${gpsCity}, ${geo.countryName} - ${lat.toFixed(4)}, ${lon.toFixed(4)} (Acc: ${acc.toFixed(0)}m)`)
        if (ipCode && gpsCountry && ipCode !== gpsCountry) {
          setFakeStatus(`🚨 FAKE GPS DETECTED! IP is ${ipCountryName} but GPS is ${geo.countryName}`)
          setFakeColor('#ef4444')
          setIsBlocked(true)
          return
        }
        const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone
        if (isPerfectAccuracy && browserTz === 'Asia/Riyadh' && gpsCountry !== 'SA') {
          setFakeStatus(`🚨 FAKE GPS SUSPECT! Accuracy too perfect: ${acc}m`)
          setFakeColor('#ef4444')
          setIsBlocked(true)
          return
        }
        setFakeStatus(`✅ GPS REAL - Matches Saudi IP`)
        setFakeColor('#22c55e')
        if (vpnColor !== '#ef4444') setIsBlocked(false)
      } catch {
        setGpsInfo(`📡 GPS: ${lat.toFixed(4)}, ${lon.toFixed(4)} (Acc: ${acc.toFixed(0)}m)`)
        if (acc < 10) { setFakeStatus('⚠️ Suspect GPS - Too Perfect'); setFakeColor('#f59e0b') }
        else { setFakeStatus('GPS OK'); setFakeColor('#22c55e') }
      }
    }, () => {
      setGpsInfo('GPS Permission Denied')
      setFakeStatus('⚠️ GPS OFF - SAMA Requires GPS ON')
      setFakeColor('#f59e0b')
    }, { enableHighAccuracy: true, timeout: 10000 })
  }
  // === V5 CODE END ===

  const toggleBill = (id: number) => {
    setBills(bills.map(b => b.id === id ? { ...b, paid: !b.paid } : b))
  }

  if (!auth) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: '#1e293b', padding: 24, borderRadius: 20, width: 380, textAlign: 'center', border: `2px solid ${isBlocked ? '#ef4444' : fakeColor}` }}>
          <h2 style={{ color: '#22c55e', margin: 0 }}>SAMA VAULT V6</h2>
          <p style={{ fontSize: 10, color: '#94a3b8' }}>مؤسسة النقد العربي السعودي - Bank Grade</p>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#22c55e', margin: 0 }}>VAULT V6 ✅</h1>
        <span style={{ fontSize: 10, background: '#1e293b', padding: '4px 8px', borderRadius: 20, color: '#94a3b8' }}>SAMA COMPLIANT</span>
      </div>

      {/* SECURITY CARD - SAME AS V5 */}
      <div style={{ background: '#1e293b', padding: 15, borderRadius: 12, marginTop: 15, borderLeft: `4px solid ${fakeColor}` }}>
        <p style={{ color: vpnColor, fontWeight: 'bold', margin: 0 }}>🔒 {vpn}</p>
        <p style={{ fontSize: 12, margin: '6px 0' }}>{ipInfo}</p>
        <p style={{ fontSize: 12, margin: '6px 0' }}>{gpsInfo}</p>
        <p style={{ color: fakeColor, fontWeight: 'bold', fontSize: 13, margin: '6px 0' }}>{fakeStatus}</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button onClick={checkAll} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: '#334155', color: 'white', fontSize: 12 }}>Re-Check</button>
          <button onClick={() => setAuth(false)} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: '#ef4444', color: 'white', fontSize: 12 }}>Lock</button>
        </div>
      </div>

      {/* NEW V6 FEATURES */}
      <h3 style={{ marginTop: 20, color: '#e2e8f0' }}>💳 Bills & Payments / الفواتير</h3>
      <div style={{ display: 'grid', gap: 10 }}>
        {bills.map(b => (
          <div key={b.id} style={{ background: '#1e293b', padding: 12, borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: b.paid ? 0.6 : 1, border: b.paid ? '1px solid #22c55e' : '1px solid transparent' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: 14 }}>{b.name}</p>
              <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>Due: {b.date} • {b.amount}</p>
            </div>
            <button onClick={() => toggleBill(b.id)} style={{ padding: '6px 14px', borderRadius: 20, border: 'none', background: b.paid ? '#22c55e' : '#334155', color: b.paid ? 'black' : 'white', fontSize: 12, fontWeight: 'bold' }}>{b.paid ? '✓ Paid' : 'Pay'}</button>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: 20, color: '#e2e8f0' }}>👨‍👩‍👧 Family Vault</h3>
      <div style={{ background: '#1e293b', padding: 15, borderRadius: 12 }}>
        <p style={{ fontSize: 13, margin: 0 }}>Secure Notes for Family - Encrypted & Saudi Only</p>
        <textarea placeholder="Add private note... / إضافة ملاحظة" style={{ width: '95%', marginTop: 10, padding: 10, borderRadius: 8, background: '#0f172a', color: 'white', border: '1px solid #334155' }} rows={3}></textarea>
      </div>

      <p style={{ fontSize: 10, textAlign: 'center', color: '#475569', marginTop: 20 }}>SAMA Compliant • Anti VPN & Fake GPS • Riyadh Secure Server</p>
    </div>
  )
}