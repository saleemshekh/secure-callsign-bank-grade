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
          if (ipCode !== 'SA' && gpsCountry === 'SA') {
            setFakeStatus(`✅ GPS REAL - But VPN Mismatch (IP: ${ipCountryName})`)
            setFakeColor('#f59e0b')
          } else {
            setFakeStatus(`🚨 FAKE GPS DETECTED! IP is ${ipCountryName} but GPS is ${geo.countryName}`)
            setFakeColor('#ef4444')
            setIsBlocked(true)
          }
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
        setIsBlocked(false)

        // SAMA V7 BACKEND DOUBLE CHECK
        try {
          const r = await fetch('/api/sama-check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat, lon, accuracy: acc })
          })
          const d = await r.json() as any
          if (d.blocked) {
            setFakeStatus(d.reason)
            setFakeColor('#ef4444')
            setIsBlocked(true)
          } else {
            setFakeStatus(prev => prev + ' + ' + d.reason)
          }
        } catch {
          // Backend fail = V6.3 continues
        }

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
export default App;