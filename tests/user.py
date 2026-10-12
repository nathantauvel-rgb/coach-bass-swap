import asyncio, json
from playwright.async_api import async_playwright
MIDI = """
window.__midiIn = { name: 'DDJ-FLX4', onmidimessage: null };
navigator.requestMIDIAccess = () => Promise.resolve({ inputs: new Map([['1', window.__midiIn]]), outputs: new Map(), onstatechange: null });
"""
STATES = {
 'nouveau + FLX4': {},
 'déjà venu + FLX4': {'coach-guide-vu':'1','coach-lecons':json.dumps({0:3,1:2}),'coach-style':'techno','coach-midi-map':json.dumps({"faderA":{"ch":0,"n":19},"faderB":{"ch":1,"n":19},"lowA":{"ch":0,"n":15},"lowB":{"ch":1,"n":15},"playA":{"ch":0,"n":11},"playB":{"ch":1,"n":11},"cfxA":{"ch":6,"n":23}})},
 'chapitre 3 + FLX4': {'coach-guide-vu':'1','coach-chapitre':'3','coach-ch2-ouvert':'1','coach-ch2':json.dumps({0:3,1:3,2:3,3:2}),'coach-lecons-oreille':json.dumps({0:2})},
 'style surprise + chap 2': {'coach-guide-vu':'1','coach-chapitre':'2','coach-ch2-ouvert':'1','coach-style':'random'},
}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for name, ls in STATES.items():
            ctx = await b.new_context(viewport={'width':1366,'height':768})
            await ctx.add_init_script(MIDI + "try{" + "".join(f"localStorage.setItem({json.dumps(k)},{json.dumps(v)});" for k,v in ls.items()) + "}catch(e){}")
            pg = await ctx.new_page(); errs = []
            pg.on('pageerror', lambda e, errs=errs: errs.append(str(e)))
            pg.on('console', lambda m, errs=errs: errs.append('console: ' + m.text) if m.type == 'error' and 'TUNNEL' not in m.text else None)
            await pg.goto('http://localhost:8765/index.html#apprendre'); await pg.wait_for_timeout(2500)
            info = await pg.evaluate("""() => ({ start: document.getElementById('startBtn').textContent, disabled: document.getElementById('startBtn').disabled,
               setup: !document.getElementById('setup').hidden, onb: !document.getElementById('onb').hidden, titre: document.getElementById('ltitle').textContent })""")
            if not info['onb']:
                # mouvements de la table : fader A en haut, fader B en bas, LOW au milieu
                await pg.evaluate("""() => { const s = (a,b,c) => window.__midiIn.onmidimessage && window.__midiIn.onmidimessage({data:[a,b,c]});
                  s(0xB0,19,127); s(0xB1,19,0); s(0xB0,15,64); s(0xB1,15,64); s(0xB1,15,0); s(0xB6,23,64); }""")
                await pg.wait_for_timeout(300)
                info2 = await pg.evaluate("() => ({ start: document.getElementById('startBtn').textContent, disabled: document.getElementById('startBtn').disabled })")
                try:
                    await pg.locator('#startBtn').click(timeout=3000)
                except Exception as e: errs.append('clic Jouer impossible: ' + str(e)[:120])
                await pg.wait_for_timeout(4000)
                info2['après clic'] = await pg.evaluate("document.getElementById('startBtn').textContent")
                try:
                    await pg.locator('.node').nth(1).click(timeout=3000); await pg.wait_for_timeout(300)
                    info2['clic niveau 2'] = await pg.evaluate("document.getElementById('ltitle').textContent")
                except Exception as e: errs.append('clic niveau impossible: ' + str(e)[:160])
            else: info2 = {}
            print(f'== {name}: {info} | {info2}')
            print('   erreurs:', errs[:5] or 'aucune')
            await ctx.close()
        await b.close()
asyncio.run(main())
