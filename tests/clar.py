import asyncio, json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        for name, ls, lvl, wait in [('ch1_filtre', {'coach-guide-vu':'1'}, 4, 3800), ('ch2_filtre', {'coach-guide-vu':'1','coach-chapitre':'2','coach-ch2-ouvert':'1'}, 4, 6000), ('ch1_swap', {'coach-guide-vu':'1'}, 2, 9000)]:
            ctx = await b.new_context(viewport={'width':1366,'height':768})
            await ctx.add_init_script("try{" + "".join(f"localStorage.setItem({json.dumps(k)},{json.dumps(v)});" for k,v in ls.items()) + "}catch(e){}")
            pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e, errs=errs: errs.append(str(e)))
            await pg.goto('http://localhost:8765/index.html#apprendre'); await pg.wait_for_timeout(1000)
            await pg.locator('.node').nth(lvl).click(); await pg.wait_for_timeout(400)
            await pg.screenshot(path=f'{name}_avant.png')
            await pg.locator('#startBtn').click()
            for _ in range(300):
                await pg.wait_for_timeout(100)
                if await pg.evaluate("document.getElementById('startBtn').textContent") == 'Arrêter': break
            await pg.wait_for_timeout(wait)
            await pg.screenshot(path=f'{name}_jeu.png')
            print(name, 'bulle:', await pg.evaluate("document.getElementById('tip').textContent"), '| focus:', await pg.evaluate("[...document.querySelectorAll('.group.focus')].map(g=>g.id)"), '| erreurs:', errs or 'aucune')
            await ctx.close()
        await b.close()
asyncio.run(main())
