import React, { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed or dismissed
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (sessionStorage.getItem('bc-install-dismissed')) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShow(false);
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    sessionStorage.setItem('bc-install-dismissed', '1');
  };

  if (!show || dismissed) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: 20, right: 20, maxWidth: 420, margin: '0 auto',
      background: 'var(--dark-text)', color: 'var(--gold)', padding: '16px 20px',
      borderRadius: 'var(--radius)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      display: 'flex', alignItems: 'center', gap: 14, zIndex: 1000,
      animation: 'slideUp 0.3s ease'
    }}>
      <div style={{ fontSize: '1.6rem' }}>📱</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 2 }}>Install Business Circle</div>
        <div style={{ fontSize: '0.78rem', opacity: 0.7 }}>Add to your home screen for quick access</div>
      </div>
      <button onClick={handleInstall} style={{
        background: 'var(--gold)', color: 'var(--dark-text)', border: 'none',
        padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: '0.82rem',
        cursor: 'pointer', fontFamily: 'var(--font-body)', flexShrink: 0
      }}>Install</button>
      <button onClick={handleDismiss} style={{
        background: 'none', border: 'none', color: 'var(--gold)', opacity: 0.5,
        cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px', flexShrink: 0
      }}>×</button>
    </div>
  );
}
