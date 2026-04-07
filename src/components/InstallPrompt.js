import React, { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Already installed as PWA?
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    setIsStandalone(standalone);
    if (standalone) return;

    // Already dismissed this session?
    if (sessionStorage.getItem('bc-install-dismissed')) return;

    // Detect iOS
    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    setIsIOS(ios);

    // On Android/Chrome, listen for the native install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // On iOS or if no native prompt after 3s, show our manual prompt
    const timer = setTimeout(() => {
      if (!standalone) setShow(true);
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setShow(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem('bc-install-dismissed', '1');
  };

  if (!show || isStandalone) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: 20, right: 20, maxWidth: 440, margin: '0 auto',
      background: '#1A1A0A', color: '#F5C400', padding: '18px 22px',
      borderRadius: 16, boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
      zIndex: 1000, animation: 'slideUp 0.4s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ fontSize: '1.5rem', marginTop: 2 }}>📱</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>Install Business Circle</div>
          {deferredPrompt ? (
            // Android — can trigger native install
            <>
              <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: 12 }}>Get quick access from your home screen</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleInstall} style={{
                  background: '#F5C400', color: '#1A1A0A', border: 'none',
                  padding: '9px 20px', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem',
                  cursor: 'pointer', fontFamily: 'inherit'
                }}>Install App</button>
                <button onClick={handleDismiss} style={{
                  background: 'rgba(245,196,0,0.15)', color: '#F5C400', border: 'none',
                  padding: '9px 16px', borderRadius: 10, fontSize: '0.85rem',
                  cursor: 'pointer', fontFamily: 'inherit'
                }}>Not now</button>
              </div>
            </>
          ) : isIOS ? (
            // iOS — manual instructions
            <>
              <div style={{ fontSize: '0.8rem', opacity: 0.7, lineHeight: 1.5 }}>
                Tap <span style={{ fontWeight: 700, opacity: 1 }}>Share</span> (□↑) at the bottom of Safari, then tap <span style={{ fontWeight: 700, opacity: 1 }}>Add to Home Screen</span>
              </div>
              <button onClick={handleDismiss} style={{
                background: 'rgba(245,196,0,0.15)', color: '#F5C400', border: 'none',
                padding: '7px 14px', borderRadius: 8, fontSize: '0.8rem', marginTop: 10,
                cursor: 'pointer', fontFamily: 'inherit'
              }}>Got it</button>
            </>
          ) : (
            // Desktop or other — manual instructions
            <>
              <div style={{ fontSize: '0.8rem', opacity: 0.7, lineHeight: 1.5 }}>
                Click the install icon (⊕) in your browser's address bar, or use your browser menu → "Install app"
              </div>
              <button onClick={handleDismiss} style={{
                background: 'rgba(245,196,0,0.15)', color: '#F5C400', border: 'none',
                padding: '7px 14px', borderRadius: 8, fontSize: '0.8rem', marginTop: 10,
                cursor: 'pointer', fontFamily: 'inherit'
              }}>Got it</button>
            </>
          )}
        </div>
        <button onClick={handleDismiss} style={{
          background: 'none', border: 'none', color: '#F5C400', opacity: 0.4,
          cursor: 'pointer', fontSize: '1.3rem', padding: 0, lineHeight: 1
        }}>×</button>
      </div>
    </div>
  );
}
