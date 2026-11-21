// Lot 76 : le mail de rappel des 7 jours gratuits (api/rappel.js), lancé une fois par jour par Vercel. Sans réseau : Stripe
// et Brevo sont remplacés par un faux `fetch`.
const { test, expect } = require('@playwright/test');

test.describe('La fonction /api/rappel', () => {
  const fn = require('../api/rappel.js');
  const vraiFetch = global.fetch, vraiMaintenant = fn.maintenant;
  const T0 = Date.parse('2026-11-23T08:00:00Z'), t0 = T0 / 1000;
  const ABO = (o = {}) => Object.assign({ id: 'sub_1', status: 'trialing', customer: { id: 'cus_1', email: 'lea@exemple.fr' }, cancel_at_period_end: false, cancel_at: null,
    trial_end: t0 + 40 * 3600, metadata: { uid: 'u1', essai: 'semaine' }, items: { data: [{ price: { id: 'price_an', unit_amount: 4999, recurring: { interval: 'year' } } }] } }, o);
  let f;   // les appels, et ce que Stripe et Brevo répondent
  test.beforeEach(() => {
    Object.assign(process.env, { CRON_SECRET: 'phrase-secrete', STRIPE_CLE: 'sk_test_secret', BREVO_CLE: 'xkeysib-test' });
    fn.maintenant = () => T0;
    f = { appels: [], abos: [], brevo: 201 };
    global.fetch = async (url, o = {}) => {
      f.appels.push({ url, methode: o.method || 'GET', entetes: o.headers || {}, corps: o.body || '' });
      const rep = (d, st = 200) => ({ ok: st < 300, status: st, json: async () => d });
      if (url.includes('api.brevo.com')) return rep({ messageId: 'm1' }, f.brevo);
      if (url.includes('/subscriptions?')) return rep({ data: f.abos, has_more: false });
      if (/\/customers\/cus_/.test(url)) return rep({ id: 'cus_2', email: 'tom@exemple.fr' });
      if (/\/subscriptions\/sub_/.test(url)) return rep({ id: 'sub_1' });
      return rep({});
    };
  });
  test.afterEach(() => { global.fetch = vraiFetch; fn.maintenant = vraiMaintenant; for (const k of ['CRON_SECRET', 'STRIPE_CLE', 'BREVO_CLE']) delete process.env[k]; });
  async function appel(entete = 'Bearer phrase-secrete'){
    const res = { statusCode: 0, corps: null, setHeader(){}, end(t){ this.corps = JSON.parse(t); } };
    await fn({ method: 'GET', headers: entete ? { authorization: entete } : {} }, res);
    return res;
  }
  const brevo = () => f.appels.filter(a => a.url.includes('api.brevo.com'));

  test('attend ses réglages ; sans le bon secret, personne ne déclenche de mail', async () => {
    delete process.env.CRON_SECRET;
    expect((await appel()).statusCode).toBe(503);
    process.env.CRON_SECRET = 'phrase-secrete';
    for (const e of ['', 'Bearer autre', 'phrase-secrete']) expect((await appel(e)).statusCode).toBe(401);
    expect(f.appels).toEqual([]);
  });

  test('deux jours avant la fin d’un essai de 7 jours : un mail par Brevo, puis l’abonnement est marqué (jamais deux mails)', async () => {
    f.abos = [ABO()];
    const r = await appel();
    expect(r.statusCode).toBe(200); expect(r.corps).toEqual({ vus: 1, envoyes: 1, erreurs: 0 });
    expect(decodeURIComponent(f.appels[0].url)).toContain('/subscriptions?status=trialing&limit=100&expand[]=data.customer');
    expect(f.appels[0].entetes.Authorization).toBe('Bearer sk_test_secret');
    const [m] = brevo(), d = JSON.parse(m.corps);
    expect(m.entetes['api-key']).toBe('xkeysib-test');
    expect(d.to).toEqual([{ email: 'lea@exemple.fr' }]);
    expect(d.sender.email).toBe('noreply@djingood.fr');
    expect(d.subject).toBe('Ton essai de DJingood Pro se termine mercredi 25 novembre');
    for (const t of ['mercredi 25 novembre', '49,99 € pour l’année', 'Tu veux continuer', 'Gérer mon abonnement', 'Annuler l’abonnement']) { expect(d.textContent).toContain(t); expect(d.htmlContent).toContain(t.replace(/’/g, '’')); }
    const marque = f.appels.find(a => /\/subscriptions\/sub_1$/.test(a.url));
    expect(marque.methode).toBe('POST');
    expect(decodeURIComponent(marque.corps)).toContain('metadata[rappel]=2026-11-23T08:00:00.000Z');
  });

  // Lot 80 : un essai commencé sur le site en anglais (api/pro.js écrit metadata.langue = 'en')
  test('un essai commencé en anglais : le rappel part en anglais', async () => {
    f.abos = [ABO({ metadata: { uid: 'u1', essai: 'semaine', langue: 'en' } })];
    const r = await appel();
    expect(r.corps).toEqual({ vus: 1, envoyes: 1, erreurs: 0 });
    const d = JSON.parse(brevo()[0].corps);
    expect(d.subject).toBe('Your DJingood Pro trial ends Wednesday, November 25');
    expect(d.sender).toEqual({ name: 'Vini from DJingood', email: 'noreply@djingood.fr' });
    for (const t of ['Wednesday, November 25', '€49.99 for the year', 'Want to keep going?', 'Manage my subscription', 'Cancel subscription']) expect(d.textContent).toContain(t);
    expect(d.htmlContent).toContain('<html lang="en">');
    expect(d.htmlContent).toContain('€49.99 for the year');
    expect(d.textContent).not.toMatch(/Salut|abonnement|essai/);
  });

  test('pas de mail : le mois offert, un essai arrêté, déjà prévenu, trop tôt ou trop tard', async () => {
    f.abos = [
      ABO({ id: 'sub_a', metadata: { uid: 'u1', essai: 'mois-offert' } }),
      ABO({ id: 'sub_b', metadata: { uid: 'u1' } }),
      ABO({ id: 'sub_c', cancel_at_period_end: true }),
      ABO({ id: 'sub_d', metadata: { uid: 'u1', essai: 'semaine', rappel: '2026-11-22T08:00:00.000Z' } }),
      ABO({ id: 'sub_e', trial_end: t0 + 5 * 24 * 3600 }),
      ABO({ id: 'sub_f', trial_end: t0 + 10 * 3600 }),
      ABO({ id: 'sub_g', status: 'active' })
    ];
    expect((await appel()).corps).toEqual({ vus: 7, envoyes: 0, erreurs: 0 });
    expect(brevo()).toEqual([]);
  });

  test('l’adresse lue chez Stripe si le client n’est pas joint ; le mois : « 4,99 € par mois » ; Brevo en panne : pas marqué', async () => {
    f.abos = [ABO({ customer: 'cus_2', items: { data: [{ price: { unit_amount: 499, recurring: { interval: 'month' } } }] } })];
    expect((await appel()).corps).toMatchObject({ envoyes: 1 });
    const d = JSON.parse(brevo()[0].corps);
    expect(d.to).toEqual([{ email: 'tom@exemple.fr' }]);
    expect(d.textContent).toContain('4,99 € par mois');
    f.appels = []; f.brevo = 500;
    expect((await appel()).corps).toEqual({ vus: 1, envoyes: 0, erreurs: 1 });
    expect(f.appels.some(a => /\/subscriptions\/sub_/.test(a.url))).toBe(false);   // réessayé au prochain passage
  });

  test('vercel.json lance la tâche une fois par jour', async () => {
    const v = require('../vercel.json');
    expect(v.crons).toEqual([{ path: '/api/rappel', schedule: '0 8 * * *' }]);
  });
});
