// Shared helpers: one Chromium, condition-based waits instead of fixed sleeps, timings recorded.
const { chromium } = require('playwright')

// Set by run.cjs once the preview server is up.
const BASE = process.env.BASE
const results = []
const timings = []

function check(block, name, ok, detail = '') {
  results.push({ block, name, ok: !!ok, detail })
  if (!ok || process.env.VERBOSE) console.log(`${ok ? 'PASS' : 'FAIL'} [${block}] ${name}${detail ? ' — ' + detail : ''}`)
}

function timing(block, name, ms, budget) {
  timings.push({ block, name, ms: Math.round(ms), budget })
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** Polls `fn` until it returns something truthy; returns that value, or false on timeout. */
async function until(fn, { timeout = 8000, every = 20 } = {}) {
  const t0 = Date.now()
  for (;;) {
    try {
      const v = await fn()
      if (v) return v
    } catch {}
    if (Date.now() - t0 > timeout) return false
    await sleep(every)
  }
}

async function open(browser, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'es-ES', acceptDownloads: true, ...opts })
  const p = await ctx.newPage()
  // CPU=4 slows the page's CPU 4× (Chromium emulation), for a modest laptop or a phone.
  if (process.env.CPU) await (await ctx.newCDPSession(p)).send('Emulation.setCPUThrottlingRate', { rate: Number(process.env.CPU) })
  p.errs = []
  p.on('pageerror', (e) => p.errs.push('pageerror: ' + e.message))
  p.on('console', (m) => {
    if (m.type() === 'error' || (m.type() === 'warning' && !/\[vite\]/.test(m.text()))) p.errs.push(m.type() + ': ' + m.text().slice(0, 200))
  })
  await p.goto(BASE, { waitUntil: 'networkidle' })
  return p
}

const preview = (p) => p.locator('.pane .cv-page, .cv-page').first()
const previewText = (p) => preview(p).innerText()
const previewHas = (p, text, timeout) => until(async () => (await previewText(p)).includes(text), { timeout })

async function step(p, name) {
  await p.locator('nav button.row', { hasText: name }).first().click()
  await p.getByRole('heading', { name, exact: true }).first().waitFor({ timeout: 5000 }).catch(() => {})
}

async function startSample(p) {
  await p.getByRole('button', { name: /Desde un ejemplo/ }).click()
  await previewHas(p, 'Nadia Martín Reyes')
}

/** Every value in the app's IndexedDB store, as one string: "has this reached storage yet?". */
const idbDump = (p) =>
  p.evaluate(
    () =>
      new Promise((resolve) => {
        const q = indexedDB.open('cv-maker')
        q.onsuccess = () => {
          const all = q.result.transaction('kv').objectStore('kv').getAll()
          all.onsuccess = () => resolve(JSON.stringify(all.result.filter((v) => !(v instanceof Blob))))
        }
        q.onerror = () => resolve('')
      }),
  )

const idbDocCount = (p) =>
  p.evaluate(
    () =>
      new Promise((resolve) => {
        const q = indexedDB.open('cv-maker')
        q.onsuccess = () => {
          const g = q.result.transaction('kv').objectStore('kv').get('index')
          g.onsuccess = () => resolve((g.result || []).length)
        }
      }),
  )

const overflow = (p) => p.evaluate(() => document.documentElement.scrollWidth - innerWidth)

module.exports = { chromium, BASE, results, timings, check, timing, sleep, until, open, preview, previewText, previewHas, step, startSample, idbDump, idbDocCount, overflow }
