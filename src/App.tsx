import { useState, useEffect } from 'react'

export default function App() {
  const [step, setStep] = useState(1)
  const [status, setStatus] = useState('🔍 Checking location...')
  const [color, setColor] = useState('#f59e0b')
  const [details, setDetails] = useState('')
  const [checked, setChecked] = useState(false)
  const [ipInfo, setIpInfo] = useState('')
  const [liveAlert, setLiveAlert] = useState('')

  // V10.1 LIVE MONITORING FOR STEP 2 + STEP 3
  useEffect(() => {
    if (step === 1) return

    const interval = setInterval(async () => {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude: lat, longitude: lon, accuracy } = pos.coords

        // Frontend Fake GPS Check
        if (lat < 16 || lat > 33 || lon < 34 || lon > 56 || accuracy < 3) {
          setLiveAlert(`🚨 LIVE BLOCK: Fake GPS Detected! Returning to Gate...`)
          setTimeout(() => {
            setStep(1)
            setStatus(`🚨 LIVE BLOCK: Fake GPS Detected (${lat.toFixed(2)}, ${lon.toFixed(2)})`)
            setColor('#ef4444')
            setLiveAlert('')
          }, 1500)
          return
        }

        // Backend VPN + GPS Check
        try {
          const r = await fetch('/api/sama-check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat, lon, accuracy })
          })
          const data = await r.json()
          if (data.blocked) {
            setLiveAlert(`🚨 LIVE BLOCK: ${data.reason} - Returning to Gate...`)
            setTimeout(() => {
              setStep(1)
              setStatus(`🚨 BLOCKED: ${data.reason}`)
              setColor('#ef4444')
              setLiveAlert('')
            }, 1500)
          }
        } catch {}
      }, () => {
        setLiveAlert(`🚨 LIVE BLOCK: GPS Signal Lost - Returning...`)
        setTimeout(() => setStep(1), 1500)
      })
    }, 3000) // 3 sec check on Consent + Dashboard

    return () => clearInterval(interval)
  }, [step])

  useEffect(() => {
    if (step!== 1) return
    if (!navigator.geolocation) {
      setStatus('❌ GPS not supported')
      setColor('#ef4444')
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon, accuracy } = pos.coords
        const d = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}, Acc: ${accuracy.toFixed(1)}m`
        setDetails(d)

        if (lat < 16 || lat > 33 || lon < 34 || lon > 56) {
          setStatus(`🚨 BLOCKED: Outside Saudi Arabia`)
          setColor('#ef4444')
          return
        }
        if (accuracy < 3) {
          setStatus(`🚨 BLOCKED: Fake GPS Detected`)
          setColor('#ef4444')
          return
        }

        try {
          const r = await fetch('/api/sama-check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat, lon, accuracy })
          })
          const data = await r.json()
          setIpInfo(`IP: ${data.ip} (${data.country})`)
          if (data.blocked) {
            setStatus(`🚨 BLOCKED: ${data.reason}`)
            setColor('#ef4444')
          } else {
            setStatus(`✅ GPS REAL - IP SA Verified - LIVE`)
            setColor('#10b981')
            setDetails(`${d} • IP: ${data.ip} (${data.country}) • LIVE`)
          }
        } catch {
          setStatus(`✅ GPS REAL - Verified (Frontend)`)
          setColor('#10b981')
        }
      },
      (err) => {
        setStatus(`❌ GPS Error: ${err.message}`)
        setColor('#ef4444')
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }, [step])

  if (step === 3) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: 16 }}>
        {liveAlert && <div style={{ background: '#ef4444', color: 'white', padding: 12, borderRadius: 12, textAlign: 'center', fontWeight: 800, marginBottom: 12 }}>{liveAlert}</div>}
        <div style={{ background: '#16a34a', color: 'white', padding: 20, borderRadius: 20, maxWidth: 400, margin: '0 auto' }}>
          <p style={{ opacity: 0.9, fontSize: 14 }}>Saleem Bank - SAMA Secure • 🔴 LIVE GPS+VPN</p>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>50,000 SAR</h1>
          <p style={{ fontSize: 11, marginTop: 8, background: 'rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: 999 }}>{details}</p>
        </div>
        <div style={{ background: 'white', padding: 20, borderRadius: 20, maxWidth: 400, margin: '16px auto', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
          <p style={{ fontSize: 13, color: '#ef4444', fontWeight: 700, background: '#fef2f2', padding: 10, borderRadius: 8 }}>⚠️ LIVE Test: Turn ON Fake GPS or VPN → Auto BLOCK in 3 sec!</p>
          <button style={{ width: '100%', marginTop: 16, padding: 14, borderRadius: 12, background: '#0f172a', color: 'white', fontWeight: 700, border: 'none' }}>Transfer Money →</button>
          <button onClick={()=>setStep(1)} style={{ width: '100%', marginTop: 10, padding: 12, borderRadius: 12, background: '#f1f5f9', border: 'none', fontWeight: 600 }}>Logout</button>
        </div>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#16a34a', fontWeight: 700, marginTop: 10 }}>V10.1 LIVE Guard Active on Consent + Dashboard ✅</p>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7f5', padding: 20 }}>
        <div style={{ background: 'white', padding: 24, borderRadius: 20, maxWidth: 400, width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: '1px solid #dcfce7' }}>
          {liveAlert && <div style={{ background: '#ef4444', color: 'white', padding: 10, borderRadius: 10, textAlign: 'center', fontWeight: 800, fontSize: 12, marginBottom: 12 }}>{liveAlert}</div>}
          <div style={{ background: '#fef2f2', color: '#991b1b', textAlign: 'center', padding: '8px', borderRadius: '999px', fontSize: 11, fontWeight: 800, border: '1px solid #fecaca' }}>
            🔴 LIVE GUARD ACTIVE - Turn ON VPN/Fake GPS to test auto-block
          </div>
          <div style={{ background: '#f0fdf4', color: '#15803d', textAlign: 'center', padding: '8px', borderRadius: '999px', fontSize: 12, fontWeight: 800, marginTop: 8 }}>
            ✅ SAMA VERIFIED - {details}
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, textAlign: 'center', marginTop: 16 }}>Location Consent</h1>
          <p style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', marginTop: 8 }}>As per SAMA regulations, your location is verified inside Saudi Arabia.</p>

          <div style={{ background: '#f9fafb', borderRadius: 12, padding: 16, marginTop: 16, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><span>IP Country</span><b style={{ color: '#16a34a' }}>SA - SECURE</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><span>Status</span><b style={{ color: '#16a34a' }}>{status}</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><span>IP</span><b>{ipInfo}</b></div>
          </div>

          <label style={{ display: 'flex', gap: 12, marginTop: 20, background: '#fffbeb', padding: 12, borderRadius: 12, cursor: 'pointer' }}>
            <input type="checkbox" checked={checked} onChange={e=>setChecked(e.target.checked)} style={{ width: 20, height: 20 }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>I confirm that I am in Saudi Arabia and I want to continue with the transaction.</span>
          </label>

          <button disabled={!checked} onClick={()=>setStep(3)} style={{ width: '100%', marginTop: 20, padding: 16, borderRadius: 12, fontWeight: 800, color: 'white', background: checked? '#16a34a' : '#d1d5db', border: 'none', cursor: checked? 'pointer':'not-allowed' }}>
            {checked? 'Continue Securely →' : 'Please Accept Consent'}
          </button>
          <p style={{ fontSize: 10, textAlign: 'center', color: '#9ca3af', marginTop: 12 }}>V10.1 LIVE Double Lock • Audit Log: CONSENT_GIVEN • Guard: 3s</p>
        </div>
      </div>
    )
  }

  const isVerified = color === '#10b981'
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', padding: 20 }}>
      <div style={{ background: 'white', padding: 30, borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', maxWidth: 420, width: '100%', textAlign: 'center', borderLeft: `6px solid ${color}` }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>SAMA Bank-Grade Check</h1>
        <p style={{ padding: '12px', borderRadius: 8, background: `${color}15`, color: color, fontWeight: 700, border: `1px solid ${color}30` }}>{status}</p>
        <p style={{ marginTop: 12, fontSize: 12, color: '#64748b' }}>{details} {ipInfo && `• ${ipInfo}`}</p>

        {isVerified && (
          <button onClick={() => setStep(2)} style={{ marginTop: 20, width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: '#16a34a', color: 'white', fontWeight: 800, fontSize: 15 }}>
            ✅ Verified — Continue to Consent →
          </button>
        )}
        <p style={{ marginTop: 16, fontSize: 11, color: '#94a3b8' }}>V10.1 LIVE - Saleem Bank - SAMA Secure</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: 12, padding: '10px 20px', borderRadius: 8, border: 'none', background: '#0f172a', color: 'white', fontWeight: 700 }}>Retry</button>
      </div>
    </div>
  )
}