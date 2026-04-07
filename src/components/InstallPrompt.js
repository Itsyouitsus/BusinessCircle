import React, { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    setIsStandalone(standalone);
    if (standalone) return;
    if (sessionStorage.getItem('bc-install-dismissed')) return;

    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    setIsIOS(ios);

    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); setShow(true); };
    window.addEventListener('beforeinstallprompt', handler);

    const timer = setTimeout(() => { if (!standalone) setShow(true); }, 3000);
    return () => { window.removeEventListener('beforeinstallprompt', handler); clearTimeout(timer); };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
    setShow(false);
  };

  const handleDismiss = () => { setShow(false); sessionStorage.setItem('bc-install-dismissed', '1'); };

  if (!show || isStandalone) return null;

  const isAndroid = /android/i.test(navigator.userAgent);

  return (
    <div style={{
      position: 'fixed', bottom: 16, left: 12, right: 12, maxWidth: 420, margin: '0 auto',
      background: '#1A1A0A', color: '#F5C400', padding: '16px 18px',
      borderRadius: 14, boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
      zIndex: 1000, animation: 'slideUp 0.4s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ fontSize: '1.4rem', marginTop: 2 }}>📱</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 4 }}>Install Business Circle</div>
          {deferredPrompt ? (
            <>
              <div style={{ fontSize: '0.78rem', opacity: 0.7, marginBottom: 10 }}>Add to your home screen for quick access</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleInstall} style={{ background: '#F5C400', color: '#1A1A0A', border: 'none', padding: '8px 18px', borderRadius: 8, fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>Install</button>
                <button onClick={handleDismiss} style={{ background: 'rgba(245,196,0,0.15)', color: '#F5C400', border: 'none', padding: '8px 14px', borderRadius: 8, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>Not now</button>
              </div>
            </>
          ) : isIOS ? (
            <>
              <div style={{ fontSize: '0.78rem', opacity: 0.7, lineHeight: 1.5 }}>
                Tap the <strong style={{ opacity: 1 }}>Share</strong> button (□↑) then <strong style={{ opacity: 1 }}>Add to Home Screen</strong>
              </div>
              <button onClick={handleDismiss} style={{ background: 'rgba(245,196,0,0.15)', color: '#F5C400', border: 'none', padding: '7px 14px', borderRadius: 8, fontSize: '0.78rem', marginTop: 8, cursor: 'pointer', fontFamily: 'inherit' }}>Got it</button>
            </>
          ) : isAndroid ? (
            <>
              <div style={{ fontSize: '0.78rem', opacity: 0.7, lineHeight: 1.5 }}>
                Tap <strong style={{ opacity: 1 }}>⋮</strong> (menu) in the top right → <strong style={{ opacity: 1 }}>Add to Home screen</strong>
              </div>
              <button onClick={handleDismiss} style={{ background: 'rgba(245,196,0,0.15)', color: '#F5C400', border: 'none', padding: '7px 14px', borderRadius: 8, fontSize: '0.78rem', marginTop: 8, cursor: 'pointer', fontFamily: 'inherit' }}>Got it</button>
            </>
          ) : (
            <>
              <div style={{ fontSize: '0.78rem', opacity: 0.7, lineHeight: 1.5 }}>
                Use your browser menu → <strong style={{ opacity: 1 }}>Install app</strong> or <strong style={{ opacity: 1 }}>Add to Home Screen</strong>
              </div>
              <button onClick={handleDismiss} style={{ background: 'rgba(245,196,0,0.15)', color: '#F5C400', border: 'none', padding: '7px 14px', borderRadius: 8, fontSize: '0.78rem', marginTop: 8, cursor: 'pointer', fontFamily: 'inherit' }}>Got it</button>
            </>
          )}
        </div>
        <button onClick={handleDismiss} style={{ background: 'none', border: 'none', color: '#F5C400', opacity: 0.4, cursor: 'pointer', fontSize: '1.2rem', padding: 0, lineHeight: 1 }}>×</button>
      </div>
    </div>
  );
}
