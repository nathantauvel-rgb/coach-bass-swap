import asyncio, time
from playwright.async_api import async_playwright
async def run(throttle):
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        pg = await b.new_page(viewport={'width': 1366, 'height': 768})
        logs = []; pg.on('console', lambda m: logs.append(m.type + ': ' + m.text)); pg.on('pageerror', lambda e: logs.append('PAGEERROR ' + str(e)))
        cdp = await pg.context.new_cdp_session(pg)
        await pg.goto('http://localhost:8765/index.html#apprendre')
        await cdp.send('Emulation.setCPUThrottlingRate', {'rate': throttle})
        await pg.wait_for_timeout(800)
        guide = await pg.evaluate("!document.getElementById('onb').hidden")
        print(f'[x{throttle}] guide ouvert au démarrage:', guide)
        if guide:
            t = time.time(); await pg.locator('#onbNext').click()
            for _ in range(240):
                await pg.wait_for_timeout(250)
                if await pg.evaluate("document.getElementById('onbTitle').textContent") != 'Bienvenue dans Coach DJ': break
            print(f'[x{throttle}] guide: son prêt en {time.time()-t:.1f}s ->', await pg.evaluate("document.getElementById('onbTitle').textContent"))
            await pg.locator('#onbSkip').click()
        t = time.time(); await pg.locator('#startBtn').click()
        txt = ''
        for _ in range(480):
            await pg.wait_for_timeout(250)
            txt = await pg.evaluate("document.getElementById('startBtn').textContent")
            if txt == 'Arrêter': break
        print(f'[x{throttle}] Jouer -> "{txt}" après {time.time()-t:.1f}s')
        await pg.wait_for_timeout(3000)
        st = await pg.evaluate("({cd: document.getElementById('cdNum').textContent, lanceDisabled: document.getElementById('launchB').disabled, prog: document.getElementById('progFill').style.width})")
        print(f'[x{throttle}] pendant la partie:', st)
        print('\n'.join(l for l in logs if 'error' in l.lower() or 'PAGEERROR' in l)[:2000] or '  (aucune erreur console)')
        await b.close()
async def main():
    await run(1); await run(4)
asyncio.run(main())
