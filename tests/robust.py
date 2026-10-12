import asyncio, time
from playwright.async_api import async_playwright
CASES = {
 'normal': '',
 'Worker bloqué': "window.Worker = function(){ throw new DOMException('blocked', 'SecurityError'); };",
 'Worker qui plante': "window.Worker = function(){ const w = { postMessage(){ setTimeout(() => w.onerror && w.onerror({ message: 'boom', preventDefault(){} }), 50); } }; return w; };",
}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        for name, init in CASES.items():
            ctx = await b.new_context(viewport={'width':1366,'height':768})
            await ctx.add_init_script("try{localStorage.setItem('coach-guide-vu','1')}catch(e){}" + init)
            pg = await ctx.new_page(); errs = []
            pg.on('pageerror', lambda e, errs=errs: errs.append(str(e)))
            t = time.time()
            await pg.goto('http://localhost:8765/index.html#apprendre')
            # la page doit répondre vite : on mesure le temps jusqu'à ce que la carte des niveaux soit construite et peinte
            await pg.wait_for_function("document.querySelectorAll('.node').length === 7", timeout=60000)
            t_ready = time.time() - t
            # réactivité : un clic sur le niveau 2 doit répondre immédiatement
            t = time.time(); await pg.locator('.node').nth(1).click(); t_click = time.time() - t
            t = time.time(); await pg.locator('#startBtn').click()
            ok = False
            for _ in range(600):
                await pg.wait_for_timeout(100)
                if await pg.evaluate("document.getElementById('startBtn').textContent") == 'Arrêter': ok = True; break
            t_play = time.time() - t
            banner = await pg.evaluate("document.getElementById('errBanner') ? document.getElementById('errBanner').textContent : ''")
            tip = await pg.evaluate("document.getElementById('tip').textContent")
            print(f"== {name}: page prête {t_ready:.1f}s · clic niveau {t_click:.2f}s · partie lancée={ok} en {t_play:.1f}s")
            print(f"   bulle: {tip[:90]} | bandeau d'erreur: {banner or 'aucun'} | erreurs: {errs or 'aucune'}")
            await ctx.close()
        await b.close()
asyncio.run(main())
