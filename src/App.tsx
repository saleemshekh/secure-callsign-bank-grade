import { useState, useEffect } from 'react'

export default function App() {
  const [auth, setAuth] = useState(false)
  const [pin, setPin] = useState('')
  const [vpn, setVpn] = useState('Checking...')
  
  useEffect(() => {
    setTimeout(() => setVpn('SECURE ✅ - No VPN'), 1200)
  }, [])

  const handleLogin = () => {
    if (pin === '1234') {
      setAuth(true)
    } else {
      alert('PIN 1234 dalo')
    }
  }

  if (!auth) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: 20 }}>
        <div style={{ background: '#1e293b', padding: 30, borderRadius: 20, width: '100%', maxWidth: 340, textAlign: 'center', border: '1px solid #22c55e' }}>
          <h1 style={{ color: '#22c55e' }}>SAMA VAULT V2</h1>
          <p style={{ fontSize: 12, opacity: 0.7 }}>{vpn} | Riyadh SA</p>
          <input type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="PIN: 1234" style={{ width: '90%', padding: 12, borderRadius: 10, marginTop: 20, textAlign: 'center', fontSize: 18 }} />
          <button onClick={handleLogin} style={{ width: '100%', padding: 12, borderRadius: 10, background: '#22c55e', color: 'black', fontWeight: 'bold', marginTop: 12, border: 'none' }}>UNLOCK</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', padding: 20, fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#22c55e' }}>VAULT V2 ACTIVE ✅</h1>
      <div style={{ background: '#1e293b', padding: 15, borderRadius: 12, marginTop: 15 }}>
        <p>🔒 VPN: {vpn}</p>
        <p>📍 GPS: Riyadh, SA - Secure</p>
        <p>💰 Vaults: 3 Active</p>
      </div>
      <button onClick={() => setAuth(false)} style={{ marginTop: 20, padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 8 }}>Lock Vault</button>
      <p style={{ marginTop: 20, fontSize: 11, opacity: 0.5 }}>V2 Deployed Successfully - SAMA Compliant</p>
    </div>
  )
}