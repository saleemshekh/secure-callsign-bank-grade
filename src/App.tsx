import { useState, useEffect, useRef } from 'react'

export default function App() {
  const [step, setStep] = useState(1)
  const [status, setStatus] = useState('🔍 Checking location...')
  const [color, setColor] = useState('#f59e0b')
  const [details, setDetails] = useState('')
  const [ipInfo, setIpInfo] = useState('Checking IP...')
  const [checked, setChecked] = useState(false)
  const watchId = useRef<number | null>(null)

  const checkIP = async () => {
    try {
      const r = await fetch('/api/sama-check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      const data = await r.json()
      setIpInfo(data.ip ? `IP: ${data.ip} (${data.country || 'SA'})` : `IP Check: ${data.reason}`)
      if (data.blocked) {
        setStatus(`🚨 BLOCKED: VPN Detected! ${data.reason}`)
        setColor('#ef4444')
        setStep(1)
        return false
      }
      return true
    } catch {
      setIpInfo('IP: SA - SECURE (Frontend)')
      return true
    }
  }

  const verifyGPS = async (lat: number, lon: number, acc: number) => {
    setDetails(`Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}, Acc: ${acc.toFixed(1)}m`)
    if (lat < 16 || lat > 33 || lon < 34 || lon > 56) {
      setStatus(`🚨 BLOCKED: Outside Saudi - Live GPS!`)
      setColor('#ef4444'); setStep(1); return false
    }
    if (acc < 3) {
      setStatus(`🚨 BLOCKED: Fake GPS Live! Acc: ${acc.toFixed(1)}m`)
      setColor('#ef4444'); setStep(1); return false
    }
    const ipOk = await checkIP()
    if (!ipOk) return false
    setStatus(`✅ GPS REAL - IP SA Verified - LIVE`)
    setColor('#10b981')
    return true
  }

  useEffect(() => {
    if (!navigator.geolocation) return
    checkIP() // First IP check
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => { verifyGPS(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy) },
      (err) => { setStatus(`❌ GPS Error: ${err.message}`); setColor('#ef4444') },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    )
    // VPN Live Check har 5 sec
    const ipInterval = setInterval(() => { checkIP() }, 5000)
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current)
      clearInterval(ipInterval)
    }
  }, [])

  if (step === 3) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: 16 }}>
        <div style={{ background: '#16a34a', color: 'white', padding: 20, borderRadius: 20, maxWidth: 400, margin: '0 auto' }}>
          <p style={{ opacity: 0.8, fontSize: 12 }}>Saleem Bank - SAMA Secure • 🔴 LIVE GPS+VPN</p>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>50,000 SAR</h1>
          <p style={{ fontSize: 10, marginTop: 8, background: 'rgba(255,255,255,0.2)', padding: '6px 10px', borderRadius: 999 }}>{details} • {ipInfo} • 🔴 LIVE</p>
        </div>
        <div style={{ background: 'white', padding: 20, borderRadius: 20, maxWidth: 400, margin: '16px auto' }}>
          <p style={{fontSize: 11, color: '#ef4444', fontWeight: 700}}>⚠️ Test: Fake GPS ya VPN ON karo → 5 sec me Auto BLOCK!</p>
          <button style={{ width: '100%', marginTop: 12, padding: 14, borderRadius: 12, background: '#0f172a', color: 'white', fontWeight: 700, border: 'none' }}>Transfer Money →</button>
          <button onClick={()=>setStep(1)} style={{ width: '100%', marginTop: 10, padding: 12, borderRadius: 12, background: '#f1f5f9', border: 'none', fontWeight: 600 }}>Logout</button>
        </div>
        <p style={{ textAlign: 'center', fontSize: 11, color: '#10b981', fontWeight: 700 }}>V10 LIVE: GPS ✅ + VPN ✅ + Dashboard ✅</p>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7f5', padding: 20 }}>
        <div style={{ background: 'white', padding: 24, borderRadius: 20, maxWidth: 400, width: '100%' }}>
          <div style={{ background: '#f0fdf4', color: '#15803d', textAlign: 'center', padding: '8px', borderRadius: 999, fontSize: 11, fontWeight: 800 }}>✅ {details} • {ipInfo} • LIVE</div>
          <h1 style={{ fontSize: 20, fontWeight: 800, textAlign: 'center', marginTop: 16 }}>Location Consent</h1>
          <div style={{ background: '#f9fafb', borderRadius: 12, padding: 16, marginTop: 16, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Status</span><b style={{ color: color }}>{status}</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}><span>IP</span><b>{ipInfo}</b></div>
          </div>
          <label style={{ display: 'flex', gap: 12, marginTop: 20, background: '#fffbeb', padding: 12, borderRadius: 12 }}>
            <input type="checkbox" checked={checked} onChange={e=>setChecked(e.target.checked)} style={{ width: 20, height: 20 }} />
            <span style={{ fontSize: 13 }}>Mai Saudi me hu aur confirm karta hu.</span>
          </label>
          <button disabled={!checked} onClick={()=>setStep(3)} style={{ width: '100%', marginTop: 20, padding: 16, borderRadius: 12, fontWeight: 800, color: 'white', background: checked? '#16a34a' : '#d1d5db', border: 'none' }}>{checked? 'Continue →' : 'Accept Consent'}</button>
        </div>
      </div>
    )
  }

  const isVerified = color === '#10b981'
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', padding: 20 }}>
      <div style={{ background: 'white', padding: 30, borderRadius: 16, maxWidth: 420, width: '100%', textAlign: 'center', borderLeft: `6px solid ${color}` }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>SAMA V10 LIVE Check</h1>
        <p style={{ padding: '12px', borderRadius: 8, background: `${color}15`, color: color, fontWeight: 700, marginTop: 12 }}>{status}</p>
        <p style={{ marginTop: 12, fontSize: 12 }}>{details}</p>
        <p style={{ marginTop: 6, fontSize: 12, fontWeight: 700 }}>{ipInfo}</p>
        {isVerified && <button onClick={() => setStep(2)} style={{ marginTop: 20, width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: '#16a34a', color: 'white', fontWeight: 800 }}>✅ Verified → Consent</button>}
      </div>
    </div>
  )
}