import asyncio, json
from playwright.async_api import async_playwright
STATES = {
 'chapitre 2 mémorisé, verrouillé': {'coach-guide-vu':'1','coach-chapitre':'2'},
 'chapitre 3 mémorisé, verrouillé': {'coach-guide-vu':'1','coach-chapitre':'3'},
 'chapitre 2 ouvert': {'coach-guide-vu':'1','coach-chapitre':'2','coach-ch2-ouvert':'1'},
 'chapitre 3 ouvert': {'coach-guide-vu':'1','coach-chapitre':'3','coach-ch2-ouvert':'1','coach-ch2':json.dumps({0:3,1:3,2:3,3:3})},
 'données abîmées': {'coach-guide-vu':'1','coach-chapitre':'abc','coach-lecons':'{oops','coach-ch2':'[1,2]','coach-style':'zouk'},
}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for name, ls in STATES.items():
            ctx = await b.new_context()
            await ctx.add_init_script("try{" + "".join(f"localStorage.setItem({json.dumps(k)},{json.dumps(v)});" for k,v in ls.items()) + "}catch(e){}")
            pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e, errs=errs: errs.append(str(e)))
            await pg.goto('http://localhost:8765/index.html#apprendre'); await pg.wait_for_timeout(1500)
            r = await pg.evaluate("({nodes: document.querySelectorAll('.node').length, lnum: document.getElementById('lnum').textContent, banner: !!document.getElementById('errBanner')})")
            print(f'== {name}: {r} erreurs={errs or "aucune"}')
            await ctx.close()
        await b.close()
asyncio.run(main())
