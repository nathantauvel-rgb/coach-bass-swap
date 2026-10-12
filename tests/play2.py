import asyncio, time
from playwright.async_api import async_playwright
async def run(throttle):
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        pg = await b.new_page(viewport={'width': 1366, 'height': 768})
        logs = []; pg.on('pageerror', lambda e: logs.append('PAGEERROR ' + str(e)))
        cdp = await pg.context.new_cdp_session(pg)
        await cdp.send('Emulation.setCPUThrottlingRate', {'rate': throttle})
        await pg.goto('http://localhost:8765/index.html')
        await pg.wait_for_timeout(4000)   # le temps de lire le guide
        t = time.time(); await pg.locator('#onbNext').click()
        for _ in range(240):
            await pg.wait_for_timeout(100)
            if await pg.evaluate("document.getElementById('onbTitle').textContent") != 'Bienvenue dans Coach DJ': break
        print(f'[x{throttle}] guide : son après {time.time()-t:.1f}s')
        await pg.locator('#onbSkip').click(); await pg.wait_for_timeout(1500)
        async def jouer(tag):
            t = time.time(); await pg.locator('#startBtn').click()
            for _ in range(480):
                await pg.wait_for_timeout(100)
                if await pg.evaluate("document.getElementById('startBtn').textContent") == 'Arrêter': break
            print(f'[x{throttle}] {tag} : partie lancée après {time.time()-t:.1f}s')
            await pg.wait_for_timeout(1500); await pg.locator('#startBtn').click(); await pg.wait_for_timeout(300)
        await jouer('1er Jouer'); await jouer('Rejouer')
        await pg.locator('.node').nth(2).click(); await pg.wait_for_timeout(2500)
        await jouer('niveau 3 (après 2,5 s de lecture de consigne)')
        print('  erreurs :', logs or 'aucune')
        await b.close()
async def main():
    await run(1); await run(4)
asyncio.run(main())
