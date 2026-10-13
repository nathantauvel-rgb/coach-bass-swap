// Bandeau d'erreur : chargé en premier, il attrape les erreurs de tous les autres fichiers.
(function(){ const show = msg => { let b = document.getElementById('errBanner'); if (!b){ b = document.createElement('div'); b.id = 'errBanner';
    b.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:99;background:#fff4f4;color:#7a1d1d;border:2px solid #e5484d;border-radius:16px;padding:12px 16px;font:600 14px system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.15)';
    document.body.appendChild(b); } b.textContent = 'Un problème est survenu : ' + msg + ' (envoie une capture de ce message pour que je corrige).'; };
  window.addEventListener('error', e => show((e.message || 'erreur') + (e.lineno ? ' · ligne ' + e.lineno : '')));
  window.addEventListener('unhandledrejection', e => { const r = e.reason; if (r && r.silent) return; show(String((r && r.message) || r)); });
})();
